import { Box, Button, DialogContent, Divider, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { tokens } from "@/style/Theme.jsx";
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
            bgcolor: tokens.color.status.successBg,
            border: `1px solid ${tokens.color.status.successBorder}`,
            color: tokens.color.status.success,
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
        <Typography sx={{ color: tokens.color.text.subdued, fontSize: 14, mb: 1.5, lineHeight: 1.5 }}>
          ${parsedAmount.toFixed(2)} has been withdrawn from your SmartPay wallet
          and sent to {destinationLabel}.
        </Typography>
        {transactionId && (
          <Typography sx={{ color: tokens.color.text.muted, fontSize: 12, mb: 3.5, fontFamily: "monospace" }}>
            Transaction ID: {transactionId}
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none", bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover } }}
        >
          Return to Wallet
        </Button>
      </Box>
    </DialogContent>
  );
}

export default WithdrawSuccessStep;
