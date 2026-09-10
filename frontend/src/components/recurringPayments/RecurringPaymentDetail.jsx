import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  IconButton
} from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatRecurringAmount,
  formatRecurringDateWithYear,
  formatRecurringSchedule,
  formatStatus
} from "@/utils/recurringPaymentFormatters";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

const STATUS_COLOR = {
  ACTIVE: "success.main",
  PAUSED: "warning.main",
  CANCELLED: "cancelled.main",
};

function Section({ title, children }) {
  return (
    <Stack spacing={tokens.spacing.xs} sx={{ mt: tokens.spacing.md }}>
      <Typography
        fontWeight={tokens.typography.fontWeight.bold}
        sx={{ color: tokens.color.text.primary }}
      >
        {title}
      </Typography>
      <Stack spacing={0}>{children}</Stack>
    </Stack>
  );
}

function DetailRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ mt: tokens.spacing.xs }}
    >
      <Typography variant="body2" sx={{ color: tokens.color.text.subdued }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.color.text.primary }}>
        {value}
      </Typography>
    </Stack>
  );
}

function WalletPaymentMethod() {
  return (
    <Box
      sx={{
        mt: tokens.spacing.sm,
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        p: tokens.spacing.sm,
        border: `1px solid ${tokens.color.border.grayLight}`,
        borderRadius: `${tokens.borderRadius.medium}px`,
        backgroundColor: tokens.color.background.stack,
        color: tokens.color.text.primary,
      }}
    >
      <AccountBalanceWalletOutlinedIcon fontSize="small" color="primary" />
      <Typography fontWeight={tokens.typography.fontWeight.bold}>
        SmartPay Wallet
      </Typography>
    </Box>
  );
}

export default function RecurringPaymentDetail({
  open,
  onClose,
  onToggleStatus,
  item,
}) {
  if (!item) return null;

  const statusColor = STATUS_COLOR[item.status] ?? "text.primary";
  const isSubscription = item.type === "SUBSCRIPTION";
  const isCancelled = item.status === "CANCELLED";
  const isPaused = item.status === "PAUSED";
  const nextPaymentText = isCancelled
  ? "—"
  : isPaused
    ? (item.pausedOverSixMonths
        ? "Schedule date required"
        : "No payment scheduled while paused")
    : formatRecurringDateWithYear(item.nextPaymentDate);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ pb: tokens.spacing.sm }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography
            variant="h6"
            sx={{ color: tokens.color.text.title, lineHeight: 1.3 }}
          >
            {item.name}
          </Typography>

          <Typography sx={{ color: tokens.color.text.primary }}>
            Status:{" "}
            <Typography
              component="span"
              fontWeight={tokens.typography.fontWeight.bold}
              sx={{ color: statusColor }}
            >
              {formatStatus(item.status)}
            </Typography>
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
          sx={{ mt: -0.5, mr: -1 }}
        >
        <CloseIcon fontSize="small" />
        </IconButton>
        </Stack>

        <Section title="Schedule">
          <Typography>
            Payments every: {formatRecurringSchedule(item.schedule)}
          </Typography>
          <Typography>
            Start Date: {formatRecurringDateWithYear(item.startPaymentDate)}
          </Typography>
        </Section>

        <Section title="Billing Details">
          <Typography>Next Payment Date: {nextPaymentText}</Typography>
          <Typography>
            Next Amount: ${formatRecurringAmount(item.amount)}
          </Typography>
        </Section>

        {isSubscription ? (
            <Section title="Payment Method">
              <WalletPaymentMethod />
            </Section>
          ) : (
            <Section title="Biller Details">
              <DetailRow label="Biller Name:" value={item.name} />
              {item.category ? (
                <DetailRow label="Category:" value={item.category} />
              ) : (
                <DetailRow label="Category:" value="—" />
              )}

              <Typography
                fontWeight={tokens.typography.fontWeight.bold}
                sx={{ color: tokens.color.text.primary, mt: tokens.spacing.sm }}
              >
                Payment Method
              </Typography>
              <WalletPaymentMethod />
            </Section>
          )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-start",
          gap: tokens.card.actionGap,
          px: tokens.spacing.lg,
          pb: tokens.spacing.md,
        }}
      >
        {!isCancelled && (
          <Button
            size="small"
            variant={isPaused ? "contained" : "outlined"}
            onClick={onToggleStatus}
            sx={isPaused ? undefined : {
              color: tokens.color.status.warning,
              borderColor: tokens.color.status.warning,
            }}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}