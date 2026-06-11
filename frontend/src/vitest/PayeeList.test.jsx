// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import PayeeList from "@/pages/Payee/PayeeList";
import AddPayee from "@/pages/Payee/AddPayee";
import { theme } from "@/style/Theme";
import * as payeeApi from "@/api/payee/payeeApi";

vi.mock("@/api/payee/payeeApi", () => ({
  getPayees: vi.fn(),
  deletePayee: vi.fn(),
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

const renderPayeeList = () =>
  render(
    <MemoryRouter initialEntries={["/payees"]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/payees" element={<PayeeList />} />
          <Route path="/add-payee" element={<AddPayee />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("PayeeList", () => {
  it("displays loading indicator while fetching payees", () => {
    payeeApi.getPayees.mockResolvedValueOnce([]);
    renderPayeeList();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays a list of payees after loading", async () => {
    payeeApi.getPayees.mockResolvedValueOnce([
      {
        payeeId: 1,
        payeeName: "Rent",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      },
      {
        payeeId: 2,
        payeeName: "Gym",
        firstName: "Bob",
        lastName: "Jones",
        email: "bob@example.com",
      },
    ]);
    renderPayeeList();

    expect(await screen.findByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Gym")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("displays empty state when no payees exist", async () => {
    payeeApi.getPayees.mockResolvedValueOnce([]);
    renderPayeeList();

    expect(await screen.findByText("No payees yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add a payee to start sending money."),
    ).toBeInTheDocument();
  });

  it("displays error message when fetching payees fails", async () => {
    payeeApi.getPayees.mockRejectedValueOnce(new Error("Network error"));
    renderPayeeList();

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("deletes a payee after confirming the dialog", async () => {
    const user = userEvent.setup();
    payeeApi.getPayees
      .mockResolvedValueOnce([
        {
          payeeId: 1,
          payeeName: "Rent",
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
        },
      ])
      .mockResolvedValueOnce([]);
    payeeApi.deletePayee.mockResolvedValueOnce({});

    renderPayeeList();

    expect(await screen.findByText("Rent")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await user.click(deleteButton);

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Delete this Payee?"),
    ).toBeInTheDocument();

    const confirmDeleteButton = within(dialog).getByRole("button", {
      name: /Delete/i,
    });
    await user.click(confirmDeleteButton);

    expect(payeeApi.deletePayee).toHaveBeenCalledWith(1);
    expect(await screen.findByText("No payees yet")).toBeInTheDocument();
    expect(
      screen.getByText("Payee deleted successfully!"),
    ).toBeInTheDocument();
  });

  it("cancels delete when Cancel is clicked in the dialog", async () => {
    const user = userEvent.setup();
    payeeApi.getPayees.mockResolvedValueOnce([
      {
        payeeId: 1,
        payeeName: "Rent",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      },
    ]);

    renderPayeeList();

    expect(await screen.findByText("Rent")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await user.click(deleteButton);

    const dialog = await screen.findByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", { name: /Cancel/i });
    await user.click(cancelButton);

    expect(payeeApi.deletePayee).not.toHaveBeenCalled();
    expect(screen.getByText("Rent")).toBeInTheDocument();
  });

  it("displays error when delete request fails", async () => {
    const user = userEvent.setup();
    payeeApi.getPayees.mockResolvedValueOnce([
      {
        payeeId: 1,
        payeeName: "Rent",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      },
    ]);
    payeeApi.deletePayee.mockRejectedValueOnce(new Error("Delete failed"));

    renderPayeeList();

    expect(await screen.findByText("Rent")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await user.click(deleteButton);

    const dialog = await screen.findByRole("dialog");
    const confirmDeleteButton = within(dialog).getByRole("button", {
      name: /Delete/i,
    });
    await user.click(confirmDeleteButton);

    expect(await screen.findByText("Delete failed")).toBeInTheDocument();
  });

  it("navigates to add-payee page when Add Payee button is clicked", async () => {
    const user = userEvent.setup();
    payeeApi.getPayees.mockResolvedValueOnce([]);

    renderPayeeList();

    const addPayeeButton = await screen.findByRole("button", {
      name: /Add Payee/i,
    });
    await user.click(addPayeeButton);

    expect(await screen.findByText("Add a Payee")).toBeInTheDocument();
  });
});
