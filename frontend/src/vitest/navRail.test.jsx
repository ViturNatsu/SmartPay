import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/style/Theme";
import Navbar from "@/components/Navbar";

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    logout: logoutMock,
    tokenClaims: { userId: "1", role: "USER" },
    loading: false,
    user: { firstName: "Alex", lastName: "Lee", role: "USER" },
  }),
}));

vi.mock("@/api/notifications/notificationApi", () => ({
  getNotifications: vi.fn(),
  dismissNotification: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

import * as notificationApi from "@/api/notifications/notificationApi";

function mockMatchMedia(isMobile = false) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: isMobile && String(query).includes("max-width"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderNav(initialPath = "/") {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Navbar />}>
            <Route path="/" element={<h1>Dashboard</h1>} />
            <Route path="/wallet" element={<h1>Wallet</h1>} />
            <Route path="/transfers" element={<h1>Transfer</h1>} />
            <Route path="/payment-methods" element={<h1>Payment Methods</h1>} />
            <Route path="/transactions" element={<h1>Transaction History</h1>} />
            <Route path="/support" element={<h1>Support</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("US 15-01-16 collapsible nav rail and hamburger menu", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    logoutMock.mockReset();
    notificationApi.getNotifications.mockResolvedValue({
      notifications: [
        { id: 1, read: false, title: "Alert" },
        { id: 2, read: false, title: "Warning" },
      ],
      totalCount: 2,
      unreadCount: 2,
    });
    notificationApi.markNotificationAsRead.mockResolvedValue();
  });

  it("collapses labels and profile details while keeping icons and the active item", async () => {
    const user = userEvent.setup();
    renderNav("/");

    expect(await screen.findByTestId("nav-rail")).toHaveAttribute("data-collapsed", "false");
    expect(screen.getByTestId("nav-profile-details")).toHaveTextContent("Alex Lee");
    expect(screen.getByTestId("nav-dashboard")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("nav-dashboard")).toHaveTextContent("Dashboard");

    const toggle = screen.getByTestId("nav-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);

    expect(screen.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("nav-dashboard")).not.toHaveTextContent("Dashboard");
    expect(screen.queryByTestId("nav-profile-details")).not.toBeInTheDocument();
    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-wallet")).toBeInTheDocument();
    expect(screen.getByTestId("nav-dashboard")).toHaveAttribute("aria-current", "page");
  });

  it("expands the rail again with keyboard Enter", async () => {
    const user = userEvent.setup();
    renderNav("/");

    const toggle = await screen.findByTestId("nav-toggle");
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");

    toggle.focus();
    await user.keyboard(" ");
    expect(screen.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "false");
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Alex Lee")).toBeInTheDocument();
  });

  it("navigates from a collapsed icon without expanding the rail", async () => {
    const user = userEvent.setup();
    renderNav("/");

    await user.click(await screen.findByTestId("nav-toggle"));
    await user.click(screen.getByTestId("nav-wallet"));

    expect(await screen.findByRole("heading", { name: "Wallet" })).toBeInTheDocument();
    expect(screen.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByTestId("nav-wallet")).toHaveAttribute("aria-current", "page");
  });

  it("opens the hamburger with the four story items and closes on outside click", async () => {
    const user = userEvent.setup();
    renderNav("/");

    const trigger = await screen.findByTestId("nav-hamburger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const items = screen.getAllByRole("menuitem").map(item => item.textContent);
    expect(items.join(" ")).toContain("Transaction History");
    expect(items.join(" ")).toContain("Support");
    expect(items.join(" ")).toContain("Notification");
    expect(items.join(" ")).toContain("Logout");
    expect(items.findIndex(text => text.includes("Transaction History")))
      .toBeLessThan(items.findIndex(text => text.includes("Support")));
    expect(items.findIndex(text => text.includes("Support")))
      .toBeLessThan(items.findIndex(text => text.includes("Notification")));
    expect(items.findIndex(text => text.includes("Notification")))
      .toBeLessThan(items.findIndex(text => text.includes("Logout")));

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("heading", { name: "Dashboard", hidden: true }));
    await waitFor(() => {
      expect(screen.getByTestId("nav-hamburger")).toHaveAttribute("aria-expanded", "false");
    });
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("closes the hamburger and collapses the rail with one click on the SmartPay toggle", async () => {
    const user = userEvent.setup();
    renderNav("/");

    await user.click(await screen.findByTestId("nav-hamburger"));
    expect(screen.getByTestId("nav-hamburger")).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByTestId("nav-toggle"));

    expect(screen.getByTestId("nav-hamburger")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");
  });

  it("goes to Transaction History and Support from the hamburger", async () => {
    const user = userEvent.setup();
    renderNav("/");

    await user.click(await screen.findByTestId("nav-hamburger"));
    await user.click(screen.getByTestId("nav-transaction-history"));
    expect(await screen.findByRole("heading", { name: "Transaction History" })).toBeInTheDocument();
    expect(screen.getByTestId("nav-hamburger")).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByTestId("nav-hamburger"));
    await user.click(screen.getByTestId("nav-support"));
    expect(await screen.findByRole("heading", { name: "Support" })).toBeInTheDocument();
  });

  it("shows unread indicators and clears them after viewing notifications", async () => {
    const user = userEvent.setup();
    renderNav("/");

    expect(await screen.findByTestId("hamburger-unread-dot")).toBeInTheDocument();
    await user.click(screen.getByTestId("nav-hamburger"));
    expect(screen.getByTestId("notification-unread-badge")).toHaveTextContent("2");

    await user.click(screen.getByTestId("nav-notification"));
    await waitFor(() => {
      expect(notificationApi.markNotificationAsRead).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("hamburger-unread-dot")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("logs out from the hamburger menu", async () => {
    const user = userEvent.setup();
    renderNav("/");

    await user.click(await screen.findByTestId("nav-hamburger"));
    await user.click(screen.getByTestId("nav-logout"));
    expect(logoutMock).toHaveBeenCalled();
  });
});
