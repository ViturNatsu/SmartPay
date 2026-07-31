// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";

import ImportantMessages, {
  NOTIFICATIONS_COUNT_CHANGED_EVENT,
} from "@/components/ImportantMessages";
import { theme } from "@/style/Theme";
import * as notificationApi from "@/api/notifications/notificationApi";

vi.mock("@/api/notifications/notificationApi", () => ({
  getNotifications: vi.fn(),
  dismissNotification: vi.fn(),
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

const renderImportantMessages = () =>
  render(
    <ThemeProvider theme={theme}>
      <ImportantMessages />
    </ThemeProvider>,
  );

function makeNotification(id, type, title, detail = null) {
  return {
    id,
    type,
    title,
    detail,
    createdAt: new Date(Date.now() - id * 1000).toISOString(),
  };
}

describe("ImportantMessages", () => {
  it("displays loading indicator while fetching notifications", () => {
    notificationApi.getNotifications.mockReturnValueOnce(new Promise(() => {}));
    renderImportantMessages();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays notifications with category, action hint, and total count", async () => {
    notificationApi.getNotifications.mockResolvedValueOnce({
      notifications: [
        makeNotification(1, "SECURITY", "New sign-in detected"),
        makeNotification(2, "WARNING", "Low wallet balance", "Below $250"),
      ],
      totalCount: 2,
    });

    renderImportantMessages();

    expect(await screen.findByText("New sign-in detected")).toBeInTheDocument();
    expect(screen.getByText("Low wallet balance")).toBeInTheDocument();
    expect(screen.getByText("2 total")).toBeInTheDocument();
    expect(
      screen.getByText("If this wasn't you, review your account security."),
    ).toBeInTheDocument();
    expect(screen.getByText("Add funds to avoid failed transactions.")).toBeInTheDocument();
  });

  it("shows at most 3 notifications even when more exist, and total count reflects the full total", async () => {
    const notifications = [
      makeNotification(1, "SECURITY", "Alert 1"),
      makeNotification(2, "SECURITY", "Alert 2"),
      makeNotification(3, "SECURITY", "Alert 3"),
      makeNotification(4, "SECURITY", "Alert 4"),
      makeNotification(5, "SECURITY", "Alert 5"),
    ];
    notificationApi.getNotifications.mockResolvedValueOnce({ notifications, totalCount: 5 });

    renderImportantMessages();

    expect(await screen.findByText("Alert 1")).toBeInTheDocument();
    expect(screen.getByText("Alert 2")).toBeInTheDocument();
    expect(screen.getByText("Alert 3")).toBeInTheDocument();
    expect(screen.queryByText("Alert 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Alert 5")).not.toBeInTheDocument();
    expect(screen.getByText("5 total")).toBeInTheDocument();
  });

  it("dismissing a displayed notification removes it and backfills the next highest-priority one", async () => {
    const notifications = [
      makeNotification(1, "SECURITY", "Alert 1"),
      makeNotification(2, "SECURITY", "Alert 2"),
      makeNotification(3, "SECURITY", "Alert 3"),
      makeNotification(4, "SUCCESS", "Payment successful"),
    ];
    notificationApi.getNotifications.mockResolvedValueOnce({ notifications, totalCount: 4 });
    notificationApi.dismissNotification.mockResolvedValueOnce();

    renderImportantMessages();

    expect(await screen.findByText("Alert 1")).toBeInTheDocument();
    expect(screen.queryByText("Payment successful")).not.toBeInTheDocument();

    const dismissButtons = screen.getAllByRole("button", { name: "Dismiss notification" });
    fireEvent.click(dismissButtons[0]);

    expect(await screen.findByText("Payment successful")).toBeInTheDocument();
    expect(screen.queryByText("Alert 1")).not.toBeInTheDocument();
    expect(screen.getByText("Alert 2")).toBeInTheDocument();
    expect(screen.getByText("Alert 3")).toBeInTheDocument();
    expect(screen.getByText("3 total")).toBeInTheDocument();
    expect(notificationApi.dismissNotification).toHaveBeenCalledWith(1);
  });

  it("broadcasts a window event with the new total count when a notification is dismissed, so the navbar bell can stay in sync", async () => {
    notificationApi.getNotifications.mockResolvedValueOnce({
      notifications: [
        makeNotification(1, "SECURITY", "Alert 1"),
        makeNotification(2, "SECURITY", "Alert 2"),
      ],
      totalCount: 2,
    });
    notificationApi.dismissNotification.mockResolvedValueOnce();

    const listener = vi.fn();
    window.addEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, listener);

    renderImportantMessages();
    expect(await screen.findByText("Alert 1")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss notification" })[0]);

    await screen.findByText("1 total");
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls.at(-1)[0].detail.totalCount).toBe(1);

    window.removeEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, listener);
  });

  it("dismissing the last remaining notification shows the empty state and updates the count", async () => {
    notificationApi.getNotifications.mockResolvedValueOnce({
      notifications: [makeNotification(1, "SUCCESS", "Payment successful")],
      totalCount: 1,
    });
    notificationApi.dismissNotification.mockResolvedValueOnce();

    renderImportantMessages();

    expect(await screen.findByText("Payment successful")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(
      await screen.findByText("You have no important notifications right now."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/total$/)).not.toBeInTheDocument();
  });

  it("displays empty state message when there are no notifications", async () => {
    notificationApi.getNotifications.mockResolvedValueOnce({
      notifications: [],
      totalCount: 0,
    });

    renderImportantMessages();

    expect(
      await screen.findByText("You have no important notifications right now."),
    ).toBeInTheDocument();
  });

  it("displays an error with a retry button, and retry re-fetches", async () => {
    notificationApi.getNotifications.mockRejectedValueOnce(new Error("Network error"));
    renderImportantMessages();

    expect(await screen.findByText("Network error")).toBeInTheDocument();
    const retryButton = screen.getByTestId("retry-button");

    notificationApi.getNotifications.mockResolvedValueOnce({
      notifications: [],
      totalCount: 0,
    });
    fireEvent.click(retryButton);

    expect(
      await screen.findByText("You have no important notifications right now."),
    ).toBeInTheDocument();
    expect(notificationApi.getNotifications).toHaveBeenCalledTimes(2);
  });
});
