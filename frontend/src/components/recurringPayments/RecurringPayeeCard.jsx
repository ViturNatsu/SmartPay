import { useState } from "react";
import { Button, Card, Stack, TextField,Tooltip, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatRecurringAmount,
  formatRecurringDate,
  formatRecurringSchedule,
  formatStatus,
} from "@/utils/recurringPaymentFormatters";

/**
 * Displays a single bill recurring payment.
 *
 * @param {{ id: number, name: string, amount: string, schedule: string, date: string }} payee
 */
export default function RecurringPayeeCard({ payee, onView, onEdit, onCancel, onAmountSave, }) {

  const isCancelled = payee.status === "CANCELLED";

  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amount, setAmount] = useState(payee.amount);

  const handleSaveAmount = async () => {
    const success = await onAmountSave(payee, amount);

    if (success) {
      setIsEditingAmount(false);
    }
  };

  const handleCancelAmountEdit = () => {
    setAmount(payee.amount);
    setIsEditingAmount(false);
  };

  return (
    <Card sx={{ p: tokens.card.padding, mb: 2 }}>
      <Typography fontWeight={tokens.typography.fontWeight.bold}>
        {payee.name}
      </Typography>

      {!isEditingAmount ? (
        <Tooltip title="Click to edit amount" arrow>
          <Typography
            variant="body2"
            onClick={() => {
              if (!isCancelled) {
                setIsEditingAmount(true);
              }
            }}
            sx={{
              color: isCancelled ? "text.secondary" : "primary.main",
              fontWeight: 600,
              cursor: isCancelled ? "default" : "pointer",
              width: "fit-content",
              transition: "0.2s",

              "&:hover": {
                textDecoration: isCancelled ? "none" : "underline",
                opacity: isCancelled ? 1 : 0.8,
              },
            }}
          >
            ${formatRecurringAmount(payee.amount)}
          </Typography>
        </Tooltip>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1 }}>
          <TextField
            size="small"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputProps={{
              min: 1,
              max: 10000,
              step: "0.01",
            }}
            sx={{ width: 140 }}
          />

          <Button variant="contained" size="small" onClick={handleSaveAmount}>
            Save
          </Button>

          <Button variant="outlined" size="small" onClick={handleCancelAmountEdit}>
            Cancel
          </Button>
        </Stack>
      )}

      <Typography variant="body2">
        Due {formatRecurringDate(payee.date)} •{" "} {formatRecurringSchedule(payee.schedule)}
      </Typography>

      <Typography variant="body2">
        Status: {formatStatus(payee.status)}
      </Typography>

      <Stack direction="row" spacing={tokens.card.actionGap} sx={{ mt: 1.5 }}>
        <Button variant="contained" size="small" onClick={() => onView(payee)}>
          View
        </Button>
        <Button variant="outlined" size="small"
          onClick={() => onEdit(payee)}
          disabled={isCancelled}
        >
          Edit
        </Button>
        <Button variant="outlined" size="small" onClick={() => onCancel(payee)} disabled={isCancelled}>
          Cancel
        </Button>
      </Stack>

    </Card>
  );
}
