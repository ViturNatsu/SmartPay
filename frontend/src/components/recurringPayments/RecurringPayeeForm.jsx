import { Button, Card, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { tokens } from "@/style/Theme";

const EMPTY_HELPER = " ";

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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Name *" name="name" value={formData.name} onChange={onInputChange} error={!!errors.name} helperText={errors.name || EMPTY_HELPER} fullWidth />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Amount *" name="amount" value={formData.amount} onChange={onInputChange} error={!!errors.amount} helperText={errors.amount || "Amount must be between $1.00 and $10,000.00."} fullWidth type="number" inputProps={{ min: 0, step: "0.01" }} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select label="Recurring Schedule *" name="schedule" value={formData.schedule} onChange={onInputChange} error={!!errors.schedule} helperText={errors.schedule || EMPTY_HELPER} fullWidth>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Date *" name="date" value={formData.date} onChange={onInputChange} error={!!errors.date} helperText={errors.date || EMPTY_HELPER} fullWidth type="date" InputLabelProps={{ shrink: true }} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="End Date *" name="endDate" value={formData.endDate} onChange={onInputChange} error={!!errors.endDate} helperText={errors.endDate || EMPTY_HELPER} fullWidth type="date" InputLabelProps={{ shrink: true }} />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Payment Method"
            value="SmartPay Wallet"
            disabled
            fullWidth
            helperText="Recurring payments are funded from your SmartPay Wallet."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LockOutlinedIcon fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <Button variant="contained" onClick={onConfirm} disabled={!isFormComplete || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Confirm"}
        </Button>

        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Card>
  );
}