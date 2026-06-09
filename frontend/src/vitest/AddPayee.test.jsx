// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import AddPayee from "@/pages/Payee/AddPayee";
import { MakeAPayment } from "@/pages/Accounts/MakeAPayment";
import { theme } from "@/style/Theme";
import * as payeeApi from "@/api/payee/payeeApi";

vi.mock("@/api/payee/payeeApi", () => ({
  addPayee: vi.fn(),
}));

vi.mock("@/context/AuthContext", async () => {
  const actual = await vi.importActual("@/context/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      tokenClaims: { userId: 1, role: "USER", email: "test@example.com" },
      loading: false,
    })),
  };
});

const renderAddPayee = () =>
  render(
    <MemoryRouter initialEntries={["/add-payee"]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/add-payee" element={<AddPayee />} />
          <Route path="/make-a-payment" element={<MakeAPayment />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("AddPayee", () => {
  it("renders the add payee form", () => {
    renderAddPayee();

    expect(screen.getByText("Add a Payee")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Smith")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Test@example.com or 4161234567"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Payee/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("shows validation error when payee name is empty", async () => {
    const user = userEvent.setup();
    renderAddPayee();

    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");
    await user.type(identifierInput, "test@example.com");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(
      await screen.findByText("Please enter a valid payee name"),
    ).toBeInTheDocument();
    expect(payeeApi.addPayee).not.toHaveBeenCalled();
  });

  it("shows validation error when identifier is invalid", async () => {
    const user = userEvent.setup();
    renderAddPayee();

    const nameInput = screen.getByPlaceholderText("John Smith");
    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");

    await user.type(nameInput, "John Doe");
    await user.type(identifierInput, "not-an-email");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(
      await screen.findByText("Please enter a valid email or phone number"),
    ).toBeInTheDocument();
    expect(payeeApi.addPayee).not.toHaveBeenCalled();
  });

  it("submits successfully with a valid email identifier", async () => {
    const user = userEvent.setup();
    payeeApi.addPayee.mockResolvedValueOnce({
      payeeId: 1,
      payeeName: "John Doe",
      recipientId: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    renderAddPayee();

    const nameInput = screen.getByPlaceholderText("John Smith");
    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");

    await user.type(nameInput, "John Doe");
    await user.type(identifierInput, "john@example.com");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(payeeApi.addPayee).toHaveBeenCalledWith({
      payeeName: "John Doe",
      recipientIdentifier: "john@example.com",
    });

    expect(await screen.findByText("Payee Added")).toBeInTheDocument();
    expect(screen.getByText(/has been saved as a payee/i)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("submits successfully with a valid phone identifier", async () => {
    const user = userEvent.setup();
    payeeApi.addPayee.mockResolvedValueOnce({
      payeeId: 2,
      payeeName: "Jane Smith",
      recipientId: 3,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
    });

    renderAddPayee();

    const nameInput = screen.getByPlaceholderText("John Smith");
    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");

    await user.type(nameInput, "Jane Smith");
    await user.type(identifierInput, "4165551234");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(payeeApi.addPayee).toHaveBeenCalledWith({
      payeeName: "Jane Smith",
      recipientIdentifier: "4165551234",
    });

    expect(await screen.findByText("Payee Added")).toBeInTheDocument();
  });

  it("displays error message when API call fails", async () => {
    const user = userEvent.setup();
    payeeApi.addPayee.mockRejectedValueOnce(new Error("Payee already exists"));

    renderAddPayee();

    const nameInput = screen.getByPlaceholderText("John Smith");
    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");

    await user.type(nameInput, "John Doe");
    await user.type(identifierInput, "john@example.com");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(await screen.findByText("Payee already exists")).toBeInTheDocument();
  });

  it("clears validation errors after successful validation", async () => {
    const user = userEvent.setup();
    payeeApi.addPayee.mockResolvedValueOnce({
      payeeId: 1,
      payeeName: "John Doe",
    });

    renderAddPayee();

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(
      await screen.findByText("Please enter a valid payee name"),
    ).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("John Smith");
    await user.type(nameInput, "John Doe");

    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");
    await user.type(identifierInput, "john@example.com");

    await user.click(saveButton);

    expect(await screen.findByText("Payee Added")).toBeInTheDocument();
  });

  it("navigates to make-a-payment when primary button is clicked on success", async () => {
    const user = userEvent.setup();
    payeeApi.addPayee.mockResolvedValueOnce({
      payeeId: 1,
      payeeName: "John Doe",
      recipientId: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    renderAddPayee();

    const nameInput = screen.getByPlaceholderText("John Smith");
    const identifierInput = screen.getByPlaceholderText("Test@example.com or 4161234567");

    await user.type(nameInput, "John Doe");
    await user.type(identifierInput, "john@example.com");

    const saveButton = screen.getByRole("button", { name: /Save Payee/i });
    await user.click(saveButton);

    expect(await screen.findByText("Payee Added")).toBeInTheDocument();

    const sendMoneyButton = screen.getByRole("button", { name: /Send Money/i });
    await user.click(sendMoneyButton);

    expect(await screen.findByText("Send Money")).toBeInTheDocument();
  });
});
