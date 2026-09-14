import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Stack,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  IconButton,
} from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { tokens, dashboardSidebarCardSx } from "../style/Theme.jsx";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  dismissNotification,
} from "@/api/notifications/notificationApi";

const VISIBLE_COUNT = 3;
export const IMPORTANT_MESSAGES_PANEL_ID = "important-messages-panel";
export const NOTIFICATIONS_COUNT_CHANGED_EVENT = "smartpay:notifications-count-changed";

function broadcastCountChange(totalCount, unreadCount) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_COUNT_CHANGED_EVENT, {
      detail: { totalCount, unreadCount },
    }),
  );
}

const TYPE_META = {
  SECURITY: {
    label: "Security",
    color: tokens.color.status.error,
    bg: tokens.color.status.errorBg,
    chipColor: "error",
    Icon: ShieldRoundedIcon,
    actionHint: "If this wasn't you, review your account security.",
  },
  WARNING: {
    label: "Warning",
    color: tokens.color.status.warning,
    bg: tokens.color.status.warningBg,
    chipColor: "warning",
    Icon: WarningAmberRoundedIcon,
    actionHint: "Add funds to avoid failed transactions.",
  },
  SUCCESS: {
    label: "Success",
    color: tokens.color.status.success,
    bg: tokens.color.status.successBg,
    chipColor: "success",
    Icon: CheckRoundedIcon,
    actionHint: null,
  },
  INFO: {
    label: "Info",
    color: tokens.color.text.secondary,
    bg: tokens.color.background.hover,
    chipColor: "default",
    Icon: InfoOutlinedIcon,
    actionHint: null,
  },
};

function formatRelativeTime(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ImportantMessages() {
  const { tokenClaims, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!tokenClaims?.userId) {
      setError("Not authenticated");
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      setDataLoading(true);
      setError(null);
      try {
        const data = await getNotifications();
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setTotalCount(data.totalCount ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load notifications");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenClaims?.userId, retryCount]);

  const handleDismiss = async (id) => {
    const dismissedNotification = notifications.find((n) => n.id === id);
    if (!dismissedNotification) return;

    const remaining = notifications.filter((n) => n.id !== id);
    const newTotalCount = Math.max(0, totalCount - 1);
    const newUnreadCount = remaining.filter((n) => n.read === false).length;

    setNotifications(remaining);
    setTotalCount(newTotalCount);
    broadcastCountChange(newTotalCount, newUnreadCount);

    try {
      await dismissNotification(id);

      // Top up the local pool if it's running low but more notifications
      // exist server-side than we're currently holding, so backfill keeps
      // working past the initially-fetched page.
      if (remaining.length < VISIBLE_COUNT && newTotalCount > remaining.length) {
        const data = await getNotifications();
        setNotifications(data.notifications ?? []);
        setTotalCount(data.totalCount ?? 0);
        broadcastCountChange(data.totalCount ?? 0, data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
      // Roll back to the server's canonical state rather than guessing
      // where the dismissed item should be re-inserted locally.
      try {
        const data = await getNotifications();
        setNotifications(data.notifications ?? []);
        setTotalCount(data.totalCount ?? 0);
        broadcastCountChange(data.totalCount ?? 0, data.unreadCount);
      } catch {
        setNotifications((prev) => [...prev, dismissedNotification]);
        setTotalCount((prev) => {
          const restored = prev + 1;
          broadcastCountChange(restored);
          return restored;
        });
      }
    }
  };

  const visibleNotifications = notifications.slice(0, VISIBLE_COUNT);

  return (
    <Card
      id={IMPORTANT_MESSAGES_PANEL_ID}
      elevation={0}
      sx={{
        ...dashboardSidebarCardSx,
        bgcolor: tokens.color.background.surface,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // Clears the sticky Navbar (64px mobile / 72px desktop toolbar)
        // plus breathing room, so scrollIntoView doesn't tuck the card's
        // heading underneath it.
        scrollMarginTop: { xs: "88px", sm: "100px" },
      }}
    >
      <div>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Important Messages
          </Typography>
          <Box aria-live="polite" aria-atomic="true">
            {totalCount > 0 && (
              <Chip
                label={`${totalCount} total`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, fontSize: 12 }}
              />
            )}
          </Box>
        </Stack>

        {(dataLoading || authLoading) && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!dataLoading && !authLoading && error && (
          <Alert
            severity="error"
            action={
              <Button
                color="error"
                size="small"
                onClick={() => setRetryCount((c) => c + 1)}
                data-testid="retry-button"
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Failed to load notifications</AlertTitle>
            {error}
          </Alert>
        )}

        {!dataLoading && !authLoading && !error && notifications.length === 0 && (
          <Typography
            sx={{
              color: tokens.color.text.secondary,
              fontSize: tokens.typography.fontSize.extraSmall,
              lineHeight: 1.45,
            }}
          >
            You have no important notifications right now.
          </Typography>
        )}

        {!dataLoading && !authLoading && !error && notifications.length > 0 && (
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {visibleNotifications.map((notification) => {
              const meta = TYPE_META[notification.type] ?? TYPE_META.INFO;
              const { Icon } = meta;
              const subtitle = [notification.detail, formatRelativeTime(notification.createdAt)]
                .filter(Boolean)
                .join(" · ");

              return (
                <Box
                  key={notification.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderBottomColor: tokens.color.underline.dark,
                    "&:last-child": { borderBottom: "none", pb: 0 },
                  }}
                >
                  <Avatar sx={{ bgcolor: meta.bg, width: 32, height: 32, flexShrink: 0 }}>
                    <Icon sx={{ color: meta.color, fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Chip
                      label={meta.label.toUpperCase()}
                      size="small"
                      color={meta.chipColor}
                      variant="outlined"
                      sx={{ height: 18, fontSize: 10, fontWeight: 700, mb: 0.5 }}
                    />
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.25 }}>
                      {notification.title}
                    </Typography>
                    {subtitle && (
                      <Typography
                        sx={{
                          color: tokens.color.text.secondary,
                          fontSize: tokens.typography.fontSize.extraSmall,
                          lineHeight: 1.45,
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}
                    {meta.actionHint && (
                      <Typography
                        sx={{
                          color: tokens.color.text.muted,
                          fontSize: tokens.typography.fontSize.extraSmall,
                          lineHeight: 1.45,
                          mt: 0.25,
                          fontStyle: "italic",
                        }}
                      >
                        {meta.actionHint}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    aria-label="Dismiss notification"
                    size="small"
                    onClick={() => handleDismiss(notification.id)}
                    sx={{ flexShrink: 0, alignSelf: "flex-start", color: tokens.color.text.muted }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
        )}
      </div>
    </Card>
  );
}

export default ImportantMessages;
