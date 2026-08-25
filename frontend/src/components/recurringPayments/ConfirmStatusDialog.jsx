import { Alert, Button, Dialog, DialogActions, DialogContent,
         DialogContentText, DialogTitle, TextField  } from "@mui/material";
import { tokens } from "@/style/Theme";
import { formatAmountWithSchedule, formatRecurringSchedule  } from "@/utils/recurringPaymentFormatters";
import { useEffect, useState } from "react";

const ACTION = {
  pause: {
    title: "Pause this payment?",
    confirmLabel: "Yes, pause",
    pendingLabel: "Pausing…",
    body: (item) =>
      `Future charges for ${item.name} ($${formatAmountWithSchedule(item.amount, item.schedule)}) will be ` +
      `temporarily stopped. You can resume at any time.`,
  },
  resume: {
    title: "Resume this payment?",
    confirmLabel: "Yes, resume",
    pendingLabel: "Resuming…",
    body: (item) =>
      `${item.name} ($${formatAmountWithSchedule(item.amount, item.schedule)}) will resume to the existing ${formatRecurringSchedule(item.schedule)} ` +
      `schedule.`,
  },
  resumeWithSchedule: {
    title: "Reset schedule and resume?",
    confirmLabel: "Save Schedule & Resume",
    pendingLabel: "Resuming…",
    body: () =>
      `This payment has been paused for more than six calendar months. ` +
      `Select a new schedule date before resuming.`,
  },
};

export default function ConfirmStatusDialog({
  action, onClose, onConfirm, item, pending = false, error = null,
}) {
  const [scheduleDate, setScheduleDate] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    setScheduleDate("");
    setDateError("");
  }, [action, item?.id]);

  const copy = action ? ACTION[action] : null;
  if (!item || !copy) return null;

  const needsSchedule = action === "resumeWithSchedule";

  const handleConfirm = () => {
    if (!needsSchedule) {
      onConfirm(null);
      return;
    }
    const chosen = new Date(`${scheduleDate}T12:00:00`);
    if (!scheduleDate || Number.isNaN(chosen.getTime()) || chosen <= new Date()) {
      setDateError("Enter a valid future date.");
      return;
    }
    onConfirm(scheduleDate);
  };

  return (
    <Dialog
      open={Boolean(action)}
      onClose={pending ? undefined : onClose}
      slotProps={{
        backdrop: { sx: { backgroundColor: "transparent" } },
        paper: { sx: { width: 420, maxWidth: "calc(100% - 64px)" } },
      }}
    >
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: tokens.spacing.sm, fontSize: tokens.typography.fontSize.small }}>
          {copy.body(item)}
        </DialogContentText>

        {needsSchedule && (
          <TextField
            label="New payment schedule date"
            type="date"
            fullWidth
            size="small"
            value={scheduleDate}
            onChange={(e) => { setScheduleDate(e.target.value); setDateError(""); }}
            error={Boolean(dateError)}
            helperText={dateError || "Required because this payment has been paused for more than six calendar months."}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: tokens.spacing.md }}
          />
        )}

        {error && <Alert severity="error" sx={{ mt: tokens.spacing.md }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>Go Back</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={pending} color={action === "pause" ? "warning" : "primary"}>
          {pending ? copy.pendingLabel : copy.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}