import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function RecurringPaymentCancelDialog({
  open,
  payee,
  onClose,
  onConfirm,
  isCancelling,
}) {
  if (!payee) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cancel Recurring Payment</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to cancel the recurring payment for{" "}
          <strong>{payee.name}</strong>?
        </DialogContentText>

        <DialogContentText sx={{ mt: 1 }}>
          Future payments will no longer be processed.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isCancelling}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelling..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}