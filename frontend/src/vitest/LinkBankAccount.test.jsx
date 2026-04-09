// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../style/Theme";
import { AuthProvider } from "../context/AuthContext";
import LinkBankAccount from "../pages/PaymentMethods/LinkBankAccount";
import { setAccessToken } from "../api/axios";
import { createTestAccessToken } from "./testUtils";

const TEST_ACCESS_TOKEN = createTestAccessToken();

vi.mock("../api/authApi", async () => {
  const actual = await vi.importActual("../api/authApi");
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

function SelectedBankPage() {
  const { bank } = useParams();
  return <div>You selected: {bank}</div>;
}

const renderLinkBankAccount = () => {
  addValidRefreshToken();
  setAccessToken(TEST_ACCESS_TOKEN);
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <LinkBankAccount open={true} />
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

const renderLinkBankAccountWithRoutes = () => {
  addValidRefreshToken();
  setAccessToken(TEST_ACCESS_TOKEN);
  return render(
    <MemoryRouter initialEntries={["/link-bank-account"]}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/link-bank-account" element={<LinkBankAccount open={true} />} />
            <Route path="/simulatedbankauth/:bank/:id" element={<SelectedBankPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("LinkBankAccount", () => {
  it("displays the correct bank options in the dropdown", async () => {
    const user = userEvent.setup();
    renderLinkBankAccount();

    const select = screen.getByRole("combobox");
    await user.click(select);
    
    const options = screen.getAllByRole("option");

    const expectedBanks = [
      "",
      "TD",
      "RBC",
      "Scotiabank",
      "BMO",
      "CIBC",
      "National Bank",
      "Desjardins",
      "Simplii Financial",
      "Tangerine",
      "Other Financial Institution"
    ];

    expect(options).toHaveLength(expectedBanks.length);

    options.forEach((option, index) => {
      expect(option).toHaveTextContent(expectedBanks[index]);
    });
  });

  it.each([
    "TD",
    "RBC",
    "Scotiabank",
    "BMO",
    "CIBC",
    "National Bank",
    "Desjardins",
    "Simplii Financial",
    "Tangerine",
    "Other Financial Institution"
  ])("enables the Continue button after selecting %s", async (bank) => {
    const user = userEvent.setup();
    renderLinkBankAccount();

    const select = screen.getByRole("combobox");
    const button = screen.getByRole("button", { name: /Continue/i });

    expect(button).toBeDisabled();

    await user.click(select);
    const bankOption = screen.getByRole("option", { name: bank });
    await user.click(bankOption);

    expect(button).toBeEnabled();
    expect(button).toHaveTextContent(`Continue with ${bank}`);
  });

  it("shows error message and keeps Continue button disabled when no bank is selected", () => {
    renderLinkBankAccount();

    const button = screen.getByRole("button", { name: /Continue/i });
    const errorMessage = screen.getByText("Please select a financial institution to continue");

    expect(button).toBeDisabled();
    expect(errorMessage).toBeInTheDocument();
  });

  it.each([
    "TD",
    "RBC",
    "Scotiabank",
    "BMO",
    "CIBC",
    "National Bank",
    "Desjardins",
    "Simplii Financial",
    "Tangerine",
    "Other Financial Institution"
  ])("navigates to the selected bank page after clicking Continue for %s", async (bank) => {
    const user = userEvent.setup();
    renderLinkBankAccountWithRoutes();

    const select = screen.getByRole("combobox");
    const continueButton = screen.getByRole("button", { name: /Continue/i });

    await user.click(select);
    const bankOption = screen.getByRole("option", { name: bank });
    await user.click(bankOption);

    await user.click(continueButton);

    expect(await screen.findByText(`You selected: ${bank}`)).toBeInTheDocument();
  });
});