import {
  Box,
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
  maskAccountNumber,
  formatStatus
} from "@/utils/recurringPaymentFormatters";

const STATUS_COLOR = {
  ACTIVE: "success.main",
  PAUSED: "warning.main",
  CANCELLED: "error.main",
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

function EmptyPaymentMethod({ onAddPaymentMethod }) {
  return (
    <Box
      sx={{
        mt: tokens.spacing.sm,
        p: tokens.spacing.md,
        border: `1px dashed ${tokens.color.border.grayLight}`,
        borderRadius: `${tokens.borderRadius.medium}px`,
        backgroundColor: tokens.color.background.stack,
      }}
    >
      <Typography
        sx={{
          fontSize: tokens.typography.fontSize.extraSmall,
          color: tokens.color.text.subdued,
          mb: tokens.spacing.sm,
        }}
      >
        No payment method linked to this bill
      </Typography>
      <Button
        size="small"
        onClick={onAddPaymentMethod}
        sx={{
          fontSize: tokens.typography.fontSize.extraSmall,
          color: tokens.color.brand.primary,
          border: `1px solid ${tokens.color.brand.primary}`,
          backgroundColor: tokens.color.background.surface,
        }}
      >
        + Add Payment Method
      </Button>
    </Box>
  );
}

export default function RecurringPaymentDetail({
  open,
  onClose,
  onCancelPayment,
  onManageFunding,
  onAddPaymentMethod,
  item
}) {
  if (!item) return null;

  const statusColor = STATUS_COLOR[item.status] ?? "default";
  const isSubscription = item.type === "SUBSCRIPTION";
  const hasPaymentMethod = Boolean(item.paymentMethodId || item.bankDisplayName);
  const isCancelled = item.status === "CANCELLED";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pb: tokens.spacing.sm }}>
        <Typography
          variant="h6"
          sx={{ color: tokens.color.text.title, lineHeight: 1.3 }}
        >
          {formatStatus(item.name)}
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

        <Section title="Schedule">
          <Typography>
            Payments every: {formatRecurringSchedule(item.schedule)}
          </Typography>
          <Typography>
            Start Date: {formatRecurringDateWithYear(item.startPaymentDate)}
          </Typography>
        </Section>

        <Section title="Billing Details">
          <Typography>
            Next Payment Date: {formatRecurringDateWithYear(item.nextPaymentDate)}
          </Typography>
          <Typography>
            Next Amount: ${formatRecurringAmount(item.amount)}
          </Typography>
        </Section>

        {isSubscription ? (
            <Section title="Payment Method">
              <Typography>{item.bankDisplayName}</Typography>
              <Typography>{formatStatus(item.account_type)}</Typography>
              {item.account_number && <Typography>{item.account_number.substring(2)}</Typography>}
            </Section>
          ) : (
            <Section title="Biller Details">
              <DetailRow label="Biller Name:" value={item.name} />
              <DetailRow label="Account / Reference #:" value={maskAccountNumber(item.accountNumber)} />
              {item.category && <DetailRow label="Category:" value={item.category} />}
              <DetailRow label="Category:" value={"Utilities"}></DetailRow>
              

              {hasPaymentMethod ? (
                <Stack sx={{ mt: tokens.spacing.sm }}>
                  <Typography variant="body2">{item.bankDisplayName}</Typography>
                  <Typography variant="body2">{item.account_type}</Typography>
                  {item.account_number && (
                    <Typography variant="body2">{item.account_number}</Typography>
                  )}
                </Stack>
              ) : (
                <EmptyPaymentMethod onAddPaymentMethod={onAddPaymentMethod} />
              )}
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
        <Button variant="outlined" size="small" onClick={onCancelPayment} disabled={isCancelled}>
          Cancel
        </Button>
        {isSubscription && (
          <Button variant="outlined" size="small" onClick={onManageFunding}>
            Manage Funding
          </Button>
        )}
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}