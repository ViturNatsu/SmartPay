import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export default function RecurringPaymentEditDialog({
  open,
  payee,
  onClose,
  onSave,
  isSaving,
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!payee) {
      return;
    }

    setAmount(String(payee.amount ?? ""));
    setDate(payee.date ?? "");
    setEndDate(payee.endDate ?? "");
  }, [payee]);

  const validate = () => {
    const newErrors = {};

    const amountValue = Number(amount);

    if (!amount) {
      newErrors.amount = "Amount is required.";
    } else if (Number.isNaN(amountValue)) {
      newErrors.amount = "Amount must be a valid number.";
    } else if (amountValue < 1) {
      newErrors.amount = "Amount must be at least 1.";
    }

    if (!date) {
      newErrors.date = "Payment date is required.";
    }

    if (date) {
      const selectedDate = new Date(`${date}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date =
          "Past dates are not allowed for recurring payments.";
      }
    }

    if (endDate && date && endDate <= date) {
      newErrors.endDate = "End date must be after payment date.";
    }

    if (endDate) {
      const selectedEndDate = new Date(`${endDate}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedEndDate < today) {
        newErrors.endDate =
          "Past dates are not allowed for recurring payments.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const hasChanges = useMemo(() => {
    if (!payee) {
      return false;
    }

    return (
      Number(amount) !== Number(payee.amount) ||
      date !== (payee.date ?? "") ||
      endDate !== (payee.endDate ?? "")
    );
  }, [amount, date, endDate, payee]);

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave({
      amount: Number(amount),
      date,
      endDate: endDate || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Recurring Payment</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={event => {
              setAmount(event.target.value);
              setErrors(prev => ({ ...prev, amount: "" }));
            }}
            error={!!errors.amount}
            helperText={errors.amount}
            inputProps={{
              min: 1,
              step: "0.001",
            }}
            fullWidth
          />

          <TextField
            label="Payment Date"
            type="date"
            value={date}
            onChange={event => {
              setDate(event.target.value);
              setErrors(prev => ({ ...prev, date: "" }));
            }}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={event => {
              setEndDate(event.target.value);
              setErrors(prev => ({ ...prev, endDate: "" }));
            }}
            error={!!errors.endDate}
            helperText={errors.endDate}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? "Saving..." : "Save and Continue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}