import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatRecurringAmount,
  formatRecurringDateWithYear,
  formatRecurringSchedule,
} from "@/utils/recurringPaymentFormatters";

const STATUS_COLOR = {
  active: "success.main",
  paused: "warning.main",
  cancelled: "error.main",
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

export default function RecurringPaymentDetail({
  open,
  onClose,
  onCancelPayment,
  onManageFunding,
  subscription,
}) {
  if (!subscription) return null;

  const accountNumber = subscription.account_number;
  const statusColor = STATUS_COLOR[subscription.status] ?? "default";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pb: tokens.spacing.sm }}>
        <Typography
          variant="h6"
          sx={{ color: tokens.color.text.title, lineHeight: 1.3 }}
        >
          {subscription.name}
        </Typography>

        <Typography sx={{ color: tokens.color.text.primary }}>
          Status:{" "}
          <Typography
            component="span"
            fontWeight={tokens.typography.fontWeight.bold}
            sx={{ color: statusColor }}
          >
            {formatStatus(subscription.status)}
          </Typography>
        </Typography>

        <Section title="Schedule">
          <Typography>
            Payments every: {formatRecurringSchedule(subscription.schedule)}
          </Typography>
          <Typography>
            Start Date: {formatRecurringDateWithYear(subscription.startPaymentDate)}
          </Typography>
        </Section>

        <Section title="Billing Details">
          <Typography>
            Next Payment Date: {formatRecurringDateWithYear(subscription.nextPaymentDate)}
          </Typography>
          <Typography>
            Next Amount: ${formatRecurringAmount(subscription.amount)}
          </Typography>
        </Section>

        <Section title="Payment Method">
          <Typography>{subscription.bankDisplayName}</Typography>
          <Typography>{subscription.account_type}</Typography>
          {accountNumber && <Typography>{accountNumber}</Typography>}
        </Section>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-start",
          gap: tokens.card.actionGap,
          px: tokens.spacing.lg,
          pb: tokens.spacing.md,
        }}
      >
        <Button variant="outlined" size="small" onClick={onCancelPayment}>
          Cancel
        </Button>
        <Button variant="outlined" size="small" onClick={onManageFunding}>
          Manage Funding
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}