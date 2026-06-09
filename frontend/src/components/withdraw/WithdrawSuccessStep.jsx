import { Box, Button, DialogContent, Divider, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * Step 3 of the withdrawal flow — Success.
 *
 * Shown after the backend confirms the transaction (Scenario 6).
 * Displays a summary of what was withdrawn and a "Return to Wallet" button.
 */
function WithdrawSuccessStep({ parsedAmount, selectedMethod, transactionId, onClose }) {
  const destinationLabel = selectedMethod
    ? `${selectedMethod.bankDisplayName} ${selectedMethod.accountIdentifierMasked?.slice(2) ?? ""}`
    : "your linked account";

  return (
    <DialogContent>
      <Box sx={{ textAlign: "center", py: 5, px: 3 }}>
        {/* Green checkmark circle */}
        <Box
          sx={{
            width: 82,
            height: 82,
            borderRadius: "50%",
            bgcolor: "#DCFCE7",
            border: "1px solid #86EFAC",
            color: "#15803D",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2.5,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 42 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.25, letterSpacing: "-0.03em" }}>
          Funds Withdrawn
        </Typography>
        <Typography sx={{ color: "#64748B", fontSize: 14, mb: 1.5, lineHeight: 1.5 }}>
          ${parsedAmount.toFixed(2)} has been withdrawn from your SmartPay wallet
          and sent to {destinationLabel}.
        </Typography>
        {transactionId && (
          <Typography sx={{ color: "#94A3B8", fontSize: 12, mb: 3.5, fontFamily: "monospace" }}>
            Transaction ID: {transactionId}
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none", bgcolor: "#0F7490", "&:hover": { bgcolor: "#0A5A70" } }}
        >
          Return to Wallet
        </Button>
      </Box>
    </DialogContent>
  );
}

export default WithdrawSuccessStep;
