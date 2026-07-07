import { tokens } from "@/style/Theme.jsx";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  LinearProgress,
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
    dailyLimit,
    perTransactionLimit,
    dailySpentToday,
    dailyRemaining,
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

  const formatCurrency = (value) =>
    Number(value ?? 0).toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const dailyUsageAfterTransaction =
    dailyLimit == null ? null : dailySpentToday + parsedAmount;

  const dailyRemainingAfterTransaction =
    dailyLimit == null
      ? null
      : dailyLimit - dailySpentToday - parsedAmount;

  const dailyUsedPercent =
  dailyLimit == null || dailyLimit === 0
    ? 0
    : Math.min((dailyUsageAfterTransaction / dailyLimit) * 100, 100);

  const withinPerTransactionLimit =
    perTransactionLimit == null ||
    parsedAmount <= perTransactionLimit;

  const withinDailyLimit =
    dailyLimit == null ||
    dailyUsageAfterTransaction <= dailyLimit;

  const transactionAllowed =
    withinPerTransactionLimit && withinDailyLimit; 

  return (
    <>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: tokens.color.text.subdued, mb: 2.5 }}>
          Review the withdrawal details before moving funds to your linked bank account.
        </Typography>

        {/* Confirmation summary box (Scenario 4) */}
        <Box sx={{ border: `1px solid ${tokens.color.border.light}`, borderRadius: "16px", overflow: "hidden" }}>
          {rows.map((row, idx) => (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                px: 2.25,
                py: 2,
                borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.color.border.dividerSoft}` : "none",
              }}
            >
              <Typography sx={{ color: tokens.color.text.subdued, fontWeight: 600, fontSize: 14 }}>
                {row.label}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, mb: 0.5 }}>
            Transaction Limit Check
          </Typography>

          <Typography sx={{ color: tokens.color.text.subdued, fontSize: 14, mb: 2 }}>
            This transaction is within your wallet-level spending limits.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: transactionAllowed ? tokens.color.status.successBg : tokens.color.status.errorBg,
                border: transactionAllowed
                  ? `1px solid ${tokens.color.status.successBorder}`
                  : `1px solid ${tokens.color.status.errorBorder}`,
              }}
            >
              <Typography sx={{ color: tokens.color.text.secondary, fontSize: 12, fontWeight: 800, mb: 0.75 }}>
                Transaction Amount
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(parsedAmount)}
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: tokens.color.background.app,
                border: `1px solid ${tokens.color.border.light}`,
              }}
            >
              <Typography sx={{ color: tokens.color.text.secondary, fontSize: 12, fontWeight: 800, mb: 0.75 }}>
                Per-Transaction Limit
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {perTransactionLimit == null
                  ? "No limit"
                  : formatCurrency(perTransactionLimit)}
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: tokens.color.background.app,
                border: `1px solid ${tokens.color.border.light}`,
              }}
            >
              <Typography sx={{ color: tokens.color.text.secondary, fontSize: 12, fontWeight: 800, mb: 0.75 }}>
                Daily Limit Remaining
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {dailyRemainingAfterTransaction == null
                  ? "No limit"
                  : formatCurrency(dailyRemainingAfterTransaction)}
              </Typography>
            </Box>
          </Box>

          {dailyLimit != null && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                  Daily Usage After Transaction
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                 {formatCurrency(dailyRemainingAfterTransaction)} remaining / {formatCurrency(dailyLimit)}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={dailyUsedPercent}
                sx={{
                  height: 12,
                  borderRadius: 999,
                  bgcolor: tokens.color.border.light,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    bgcolor: tokens.color.brand.primary,
                  },
                }}
              />
            </Box>
          )}

          <Alert severity={transactionAllowed ? "success" : "error"}>
            {transactionAllowed ? (
              <>
                <strong>Transaction approved.</strong> This transaction is within
                both the wallet daily spending limit and wallet
                per-transaction limit.
              </>
            ) : (
              <>
                <strong>Transaction exceeds wallet limits.</strong>{" "}
                {!withinDailyLimit &&
                  "Daily spending limit would be exceeded. "}
                {!withinPerTransactionLimit &&
                  "Per-transaction limit would be exceeded."}
              </>
            )}
          </Alert>
          {!transactionAllowed && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Note:</strong> Wallet limits apply across the entire wallet,
              not per linked bank account, card, or funding source.
            </Alert>
          )}
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
          disabled={submitting || !transactionAllowed}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: "none", bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover } }}
        >
          {submitting ? "Processing…" : "Confirm Withdrawal"}
        </Button>
      </DialogActions>
    </>
  );
}

export default WithdrawReviewStep;
