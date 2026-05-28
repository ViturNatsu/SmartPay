import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";

/**
 * Step 2 of the withdrawal flow — Review.
 *
 * Displays a read-only summary so the user can verify details
 * before committing the transaction (Scenario 4).
 * "Back" returns to the Details step without submitting (Scenario 5).
 */
function WithdrawReviewStep({
  selectedMethod,
  parsedAmount,
  remainingBalance,
  submitting,
  onBack,
  onConfirm,
}) {
  const destinationLabel = selectedMethod
    ? `${selectedMethod.bankDisplayName} ${selectedMethod.accountIdentifierMasked?.slice(2) ?? ""}`
    : "—";

  const rows = [
    { label: "Withdraw From",         value: "SmartPay Wallet" },
    { label: "Deposit To",            value: destinationLabel },
    { label: "Withdrawal Amount",     value: `$${parsedAmount.toFixed(2)}` },
    { label: "Remaining Wallet Balance", value: `$${remainingBalance.toFixed(2)}` },
  ];

  return (
    <>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: "#64748B", mb: 2.5 }}>
          Review the withdrawal details before moving funds to your linked bank account.
        </Typography>

        {/* Confirmation summary box (Scenario 4) */}
        <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden" }}>
          {rows.map((row, idx) => (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                px: 2.25,
                py: 2,
                borderBottom: idx < rows.length - 1 ? "1px solid #EEF2F3" : "none",
              }}
            >
              <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: 14 }}>
                {row.label}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {/* Scenario 5: navigate back without submitting */}
        <Button onClick={onBack} variant="outlined" sx={{ textTransform: "none" }}>
          Back
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: "none", bgcolor: "#0F7490", "&:hover": { bgcolor: "#0A5A70" } }}
        >
          {submitting ? "Processing…" : "Confirm Withdrawal"}
        </Button>
      </DialogActions>
    </>
  );
}

export default WithdrawReviewStep;
