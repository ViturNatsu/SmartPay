import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import { Login } from "@/pages/Login/Login";
import { Home } from "@/pages/Navbar/Home";
import PaymentMethods from "@/pages/PaymentMethods/PaymentMethods";
import  AddPayee  from "@/pages/Payee/AddPayee";
import { MakeAPayment } from "@/pages/Accounts/MakeAPayment";
import Forbidden from "@/pages/errors/Forbidden";

import * as authApi from "@/api/authApi.js";
import { setAccessToken } from "@/api/axios.js";
import { createTestAccessToken } from "./testUtils.js";

const TEST_ACCESS_TOKEN = createTestAccessToken();

vi.mock("@/api/authApi", async () => {
  const actual = await vi.importActual("@/api/authApi");
  return {
    ...actual,
    refreshTokens: vi.fn(async () => ({
      accessToken: TEST_ACCESS_TOKEN,
      refreshToken: "REFRESH",
    })),
    getMyUser: vi.fn(async () => ({
      id: 1,
      email: "placeholder@smartpay.local",
      role: "fake role",
    })),
    logout: vi.fn(async () => ({ ok: true })),
  };
});

function addValidRefreshToken(expSecondsFromNow = 3600) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  sessionStorage.setItem("refresh_token", `${header}.${payload}.sig`);
}

const ProtectedPage = () => (
  <div>
    <div data-testid="protected">Protected Content</div>
    <Home />
  </div>
);

function AppHarness({ initialEntries = ["/app"] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<ProtectedPage />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/add-payee" element={<AddPayee />} />
            <Route path="/make-a-payment" element={<MakeAPayment />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Home Dashboard Quick Link Acceptance", () => {
  it("Scenario 1: Load Wallet link navigates to payment methods", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    await screen.findByTestId("protected");

    const loadWalletLink = await screen.findByRole("link", {
      name: /Load Wallet/i,
    });
    await user.click(loadWalletLink);

    expect(
      screen.getByRole("heading", { name: /^Payment Methods$/i }),
    ).toBeInTheDocument();
  });

  it("Scenario 2: Send Money link navigates to make a payment", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    await screen.findByTestId("protected");

    const sendMoneyLink = await screen.findByRole("link", {
      name: /Send Money/i,
    });
    await user.click(sendMoneyLink);

    expect(screen.getByText("Send Money")).toBeInTheDocument();
  });

  it("Scenario 3: Add a Payee link navigates to add payee", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    await screen.findByTestId("protected");

    const addPayeeLink = await screen.findByRole("link", {
      name: /Add a Payee/i,
    });
    await user.click(addPayeeLink);

    expect(screen.getByText("Add a Payee")).toBeInTheDocument();
  });

  it("Scenario 4: Admin route without privileges shows forbidden", async () => {
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route path="/forbidden" element={<Forbidden />} />
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin/dashboard" element={<div>admin page</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/403\s*-\s*Forbidden/i)).toBeInTheDocument();
  });
});
