import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import { Login } from "@/pages/Login/Login";
import { Home } from "@/pages/Navbar/Home";
import { CreateAccount } from "@/pages/Accounts/CreateAccount";
import PaymentMethods from "@/pages/PaymentMethods/PaymentMethods";
import { ViewHistory } from "@/pages/Accounts/ViewHistory";
import { AddPayee } from "@/pages/Accounts/AddPayee";
import { MakeAPayment } from "@/pages/Accounts/MakeAPayment";
import Forbidden from "@/pages/errors/Forbidden";

// --------- Test Setup ---------
// npm install -D @testing-library/jest-dom
// npm test homeQuickActions.test.jsx

// Mock API calls to avoid network
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
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/view-history" element={<ViewHistory />} />
            <Route path="/add-payee" element={<AddPayee />} />
            <Route path="/make-a-payment" element={<MakeAPayment />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Home Dashboard Quick Link Acceptance", () => {
  it("Scenario 1: Test Add Payment Method Link", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    // Wait for the protected page with QuickActions to render
    const protectedContent = await screen.findByTestId("protected");
    expect(protectedContent).toBeInTheDocument();

    // Find and click the Add Payment Method link
    const paymentMethodsLink = await screen.findByRole("link", {
      name: /Add Payment Method/i,
    });
    await user.click(paymentMethodsLink);

    // Verify navigation to payment methods page
    expect(
      screen.getByRole("heading", { name: /^Payment Methods$/i }),
    ).toBeInTheDocument();
  });

  it("Scenario 2: Test View History Link", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    // Wait for the protected page with QuickActions to render
    const protectedContent = await screen.findByTestId("protected");
    expect(protectedContent).toBeInTheDocument();

    // Find and click the View History link
    const viewHistoryLink = await screen.findByRole("link", {
      name: /View History/i,
    });
    await user.click(viewHistoryLink);

    // Verify navigation to view-history page
    expect(screen.getByText("View History")).toBeInTheDocument();
  });

  it("Scenario 4: Admin route without privileges shows forbidden", async () => {
    // adjust mock to return normal user role
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    // render a small app with an admin-only route
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

    // should end up on forbidden component
    expect(await screen.findByText(/403\s*-\s*Forbidden/i)).toBeInTheDocument();
  });

  it("Scenario 3: Test Add Payee Link", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    // Wait for the protected page with QuickActions to render
    const protectedContent = await screen.findByTestId("protected");
    expect(protectedContent).toBeInTheDocument();

    // Find and click the Add Payee link
    const addPayeeLink = await screen.findByRole("link", {
      name: /Add Payee/i,
    });
    await user.click(addPayeeLink);

    // Verify navigation to add-payee page
    expect(screen.getByText("Add Payee")).toBeInTheDocument();
  });

  it("Scenario 4: Test Make Payment Link", async () => {
    const user = userEvent.setup();
    addValidRefreshToken();
    setAccessToken(TEST_ACCESS_TOKEN);

    render(<AppHarness initialEntries={["/app"]} />);

    // Wait for the protected page with QuickActions to render
    const protectedContent = await screen.findByTestId("protected");
    expect(protectedContent).toBeInTheDocument();

    // Find and click the Make a Payment link
    const makePaymentLink = await screen.findByRole("link", {
      name: /Make a Payment/i,
    });
    await user.click(makePaymentLink);

    // Verify navigation to make-payment page
    expect(screen.getByText("Make A Payment")).toBeInTheDocument();
  });
});
