import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import { MakeAPayment } from "@/pages/Accounts/MakeAPayment";
import * as authApi from "@/api/authApi.js";
import { setAccessToken } from "@/api/axios.js";
import { createTestAccessToken } from "./testUtils.js";

const TEST_ACCESS_TOKEN = createTestAccessToken({ sub: "1" });

// ── Auth mock ──────────────────────────────────────────────────────────────
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
      email: "test@smartpay.com",
      role: "USER",
      firstName: "Test",
      lastName: "User",
    })),
    logout: vi.fn(async () => ({ ok: true })),
  };
});

// ── Wallet API mock ────────────────────────────────────────────────────────
const { mockSendMoney, mockGetPayees } = vi.hoisted(() => ({
  mockSendMoney: vi.fn(),
  mockGetPayees: vi.fn(),
}));

vi.mock("@/api/wallets/walletApi", () => ({
  getWalletByUserId: vi.fn(async () => ({ balance: 200.00 })),
  sendMoney: mockSendMoney,
}));

vi.mock("@/api/payees/payeeApi", () => ({
  getPayees: mockGetPayees,
}));

// ── Test fixtures ──────────────────────────────────────────────────────────
const MOCK_PAYEES = [
  {
    payeeId: 1,
    payeeName: "John Smith",
    recipientId: 2,
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
  },
  {
    payeeId: 2,
    payeeName: "Aisha Patel",
    recipientId: 3,
    firstName: "Aisha",
    lastName: "Patel",
    email: "aisha@example.com",
  },
];

function addValidRefreshToken() {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
  ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  sessionStorage.setItem("refresh_token", `${header}.${payload}.sig`);
}

function AppHarness() {
  return (
    <MemoryRouter initialEntries={["/make-a-payment"]}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/make-a-payment" element={<MakeAPayment />} />
            <Route path="/home" element={<div>Dashboard</div>} />
            <Route path="/add-payee" element={<div>Add Payee</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  addValidRefreshToken();
  setAccessToken(TEST_ACCESS_TOKEN);
  mockGetPayees.mockResolvedValue(MOCK_PAYEES);
  mockSendMoney.mockResolvedValue(undefined);
});

// ── Helper: advance to step 2 ──────────────────────────────────────────────
async function selectPayeeAndContinue(user) {
  const payeeRow = await screen.findByText("John Smith");
  await user.click(payeeRow);
  await user.click(screen.getByRole("button", { name: /continue/i }));
}

// ── Helper: advance to review screen ──────────────────────────────────────
async function goToReviewScreen(user, amount = "75") {
  await selectPayeeAndContinue(user);
  const amountInput = screen.getByLabelText(/dollar amount/i);
  await user.clear(amountInput);
  await user.type(amountInput, amount);
  await user.click(screen.getByRole("button", { name: /continue/i }));
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("MakeAPayment — Step 1: Select Payee", () => {
  it("shows loading spinner while fetching payees", async () => {
    mockGetPayees.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AppHarness />);
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("shows empty state when user has no saved payees", async () => {
    mockGetPayees.mockResolvedValue([]);
    render(<AppHarness />);
    expect(
      await screen.findByText(/you have no saved payees yet/i)
    ).toBeInTheDocument();
  });

  it("shows payee names when payees are loaded", async () => {
    render(<AppHarness />);
    expect(await screen.findByText("John Smith")).toBeInTheDocument();
    expect(await screen.findByText("Aisha Patel")).toBeInTheDocument();
  });

  it("Continue button is disabled when no payee is selected", async () => {
    render(<AppHarness />);
    await screen.findByText("John Smith");
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("Continue button enables after selecting a payee", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await user.click(await screen.findByText("John Smith"));
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  it("navigates to step 2 when Continue is clicked", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);
    expect(screen.getByLabelText(/dollar amount/i)).toBeInTheDocument();
  });
});

describe("MakeAPayment — Step 2: Amount & Memo Validation", () => {
  it("shows error when amount is below $0.01", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "0");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/amount must be at least/i)
    ).toBeInTheDocument();
  });

  it("shows error when amount exceeds $3,000", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "3001");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/amount cannot exceed/i)
    ).toBeInTheDocument();
  });

  it("shows error when amount exceeds wallet balance", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "201");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/amount cannot exceed your wallet balance/i)
    ).toBeInTheDocument();
  });

  it("shows error when memo contains invalid characters", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "50");
    await user.type(screen.getByLabelText(/memo/i), "hello@world!");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/memo can only contain letters, numbers/i)
    ).toBeInTheDocument();
  });

  it("shows error when memo exceeds 100 characters", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "50");
    fireEvent.change(screen.getByLabelText(/memo/i), { target: { value: "A".repeat(101) } });
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/memo cannot exceed 100 characters/i)
    ).toBeInTheDocument();
  });

  it("does not show memo error when memo is empty (memo is optional)", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await selectPayeeAndContinue(user);

    await user.type(screen.getByLabelText(/dollar amount/i), "50");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.queryByText(/memo can only contain/i)
    ).not.toBeInTheDocument();
  });
});

describe("MakeAPayment — Step 3: Review Screen", () => {
  it("shows all 5 required fields on review screen", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await goToReviewScreen(user);

    expect(screen.getByText("Send From")).toBeInTheDocument();
    expect(screen.getByText("Send To")).toBeInTheDocument();
    expect(screen.getByText("Transfer Amount")).toBeInTheDocument();
    expect(screen.getByText("Memo")).toBeInTheDocument();
    expect(screen.getByText("Remaining Wallet Balance")).toBeInTheDocument();
  });

  it("shows correct recipient on review screen", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await goToReviewScreen(user);

    expect(screen.getByText(/john smith/i)).toBeInTheDocument();
  });

  it("shows correct remaining balance on review screen", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await goToReviewScreen(user, "75");

    expect(screen.getByText("$125.00")).toBeInTheDocument();
  });
});

describe("MakeAPayment — Step 4: Transfer Completion", () => {
  it("shows success screen after transfer completes", async () => {
    const user = userEvent.setup();
    render(<AppHarness />);
    await goToReviewScreen(user);

    await user.click(screen.getByRole("button", { name: /complete transfer/i }));

    expect(await screen.findByText(/money sent/i)).toBeInTheDocument();
  });

  it("shows error message when API call fails", async () => {
    mockSendMoney.mockRejectedValue({ message: "Insufficient wallet balance to complete this transfer." });
    const user = userEvent.setup();
    render(<AppHarness />);
    await goToReviewScreen(user);

    await user.click(screen.getByRole("button", { name: /complete transfer/i }));

    expect(
      await screen.findByText(/insufficient wallet balance/i)
    ).toBeInTheDocument();
  });
});
