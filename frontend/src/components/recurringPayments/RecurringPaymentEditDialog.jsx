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
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!payee) {
      return;
    }

    setName(payee.name ?? "");
    setAmount(String(payee.amount ?? ""));
    setDate(payee.date ?? "");
    setEndDate(payee.endDate ?? "");
  }, [payee]);

  const validate = () => {
    const newErrors = {};

    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "Name is required.";
    } else if (trimmedName.length > 30) {
      newErrors.name = "Name cannot exceed 30 characters.";
    } else if (!/^[A-Za-z0-9 ]+$/.test(trimmedName)) {
      newErrors.name = "Name cannot contain special characters.";
    }

    if (payee?.type === "SUBSCRIPTION") {
      const amountValue = Number(amount);

      if (!amount) {
        newErrors.amount = "Amount is required.";
      } else if (Number.isNaN(amountValue)) {
        newErrors.amount = "Amount must be a valid number.";
      } else if (amountValue < 1) {
        newErrors.amount = "Amount must be at least $1.00.";
      } else if (amountValue > 10000) {
        newErrors.amount = "Amount cannot exceed $10,000.00.";
      }
    }

    if (!date) {
      newErrors.date = "Payment date is required.";
    }

    if (date && date !== payee?.date) {
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

    if (endDate && endDate !== payee?.endDate) {
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

    const amountChanged =
      payee.type === "SUBSCRIPTION" &&
      Number(amount) !== Number(payee.amount);

    return (
      name.trim() !== (payee.name ?? "") ||
      amountChanged ||
      date !== (payee.date ?? "") ||
      endDate !== (payee.endDate ?? "")
    );
  }, [name, amount, date, endDate, payee]);

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave({
      name: name.trim(),
      amount:
        payee?.type === "SUBSCRIPTION"
          ? Number(amount)
          : payee.amount,
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
            label="Name"
            value={name}
            onChange={event => {
              setName(event.target.value);
              setErrors(prev => ({ ...prev, name: "" }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          {payee?.type === "SUBSCRIPTION" && (
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
                max: 10000,
                step: "0.01",
              }}
              fullWidth
            />
          )}

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