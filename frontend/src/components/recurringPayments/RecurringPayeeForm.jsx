import { Button, Card, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";

export default function RecurringPayeeForm({
  formData,
  errors,
  isFormComplete,
  isSubmitting,
  onInputChange,
  onConfirm,
  onCancel,
}) {
  return (
    <Card sx={{ p: tokens.layout.pagePadding, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add New Payee
      </Typography>

      <Stack spacing={2}>
        <TextField label="Name *" name="name" value={formData.name} onChange={onInputChange} error={!!errors.name} helperText={errors.name} fullWidth />
        <TextField label="Account Number *" name="accountNumber" value={formData.accountNumber} fullWidth InputProps={{readOnly: true,}} helperText="Automatically assigned" />
        <TextField label="Amount *" name="amount" value={formData.amount} onChange={onInputChange} error={!!errors.amount} helperText={errors.amount} fullWidth type="number" inputProps={{ min: 0, step: "0.01" }} />

        <TextField select label="Recurring Schedule *" name="schedule" value={formData.schedule} onChange={onInputChange} error={!!errors.schedule} helperText={errors.schedule} fullWidth>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </TextField>

        <TextField label="Date *" name="date" value={formData.date} onChange={onInputChange} error={!!errors.date} helperText={errors.date} fullWidth type="date" InputLabelProps={{ shrink: true }} />
        
        <TextField label="End Date *" name="endDate" value={formData.endDate} onChange={onInputChange} error={!!errors.endDate} helperText={errors.endDate} fullWidth type="date" InputLabelProps={{ shrink: true }} />

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