import { Button, Card, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";

export default function RecurringSubscriptionForm({
  formData,
  errors,
  isFormComplete,
  isSubmitting,
  paymentMethods,
  onInputChange,
  onConfirm,
  onCancel,
}) {
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <Card sx={{ p: tokens.layout.pagePadding, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add Subscription
      </Typography>

      <Stack spacing={2}>
        <TextField label="Name *" name="name" value={formData.name} onChange={onInputChange} error={!!errors.name} helperText={errors.name} fullWidth />
        <TextField label="Amount *" name="amount" value={formData.amount} onChange={onInputChange} error={!!errors.amount} helperText={errors.amount || "Amount must be between $1.00 and $10,000.00."} fullWidth type="number" inputProps={{ min: 0, step: "0.01" }} />

        <TextField select label="Recurring Schedule *" name="schedule" value={formData.schedule} onChange={onInputChange} error={!!errors.schedule} helperText={errors.schedule} fullWidth>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="biweekly">Bi-weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </TextField>

        <TextField label="Next Payment Date *" name="date" value={formData.date} onChange={onInputChange} error={!!errors.date} helperText={errors.date} fullWidth type="date" InputLabelProps={{ shrink: true }} />

        <TextField
          select
          label="Payment Method *"
          name="paymentMethodId"
          value={formData.paymentMethodId}
          onChange={onInputChange}
          error={!!errors.paymentMethodId}
          helperText={
            errors.paymentMethodId ||
            (!hasPaymentMethods ? "Link a payment method in Wallet to add a subscription." : "")
          }
          fullWidth
          disabled={!hasPaymentMethods}
        >
          {paymentMethods.map((pm) => (
            <MenuItem key={pm.paymentMethodId} value={pm.paymentMethodId}>
              {pm.bankDisplayName} — {pm.accountName} ({pm.accountIdentifierMasked})
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onConfirm} disabled={!isFormComplete || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm"}
          </Button>

          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
