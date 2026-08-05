import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SuccessCard from "@/components/SuccessCard";
import { useAuth } from "@/context/AuthContext";
import { getPaymentMethodsForUserWithId } from "@/api/paymentmethods/paymentmethodApi";
import { getWalletByUserId, loadWallet } from "@/api/wallets/walletApi";
import {
  WALLET_COLORS,
  MIN_LOAD_AMOUNT,
  MAX_LOAD_AMOUNT,
  formatMoney,
  paymentMethodLabel,
  primaryButtonSx,
  secondaryButtonSx,
} from "@/components/wallet/walletTheme";
import {tokens} from "../style/Theme.jsx";

const REVIEW_ALERT_SLOT_MIN_HEIGHT = 52;

function AlertBox({ variant, children, sx: sxOverride = {} }) {
  const styles =
    variant === "error"
      ? {
          bgcolor: WALLET_COLORS.errorBg,
          border: `1px solid ${WALLET_COLORS.errorBorder}`,
          color: WALLET_COLORS.errorText,
        }
      : variant === "success"
        ? {
            bgcolor: WALLET_COLORS.successBg,
            border: `1px solid ${WALLET_COLORS.successBorder}`,
            color: WALLET_COLORS.successText,
          }
        : {
            bgcolor: WALLET_COLORS.warningBg,
            border: `1px solid ${WALLET_COLORS.warningBorder}`,
            color: WALLET_COLORS.warningText,
          };

  return (
    <Box
      sx={{
        p: "10px 12px",
        borderRadius: "12px",
        fontSize: 13,
        display: "flex",
        gap: 1,
        ...styles,
        ...sxOverride,
      }}
    >
      <strong>{variant === "error" ? "!" : variant === "success" ? "✓" : "⚠"}</strong>
      <span>{children}</span>
    </Box>
  );
}

export default function LoadWalletDialog({ open, onClose, onSuccess }) {
  const { tokenClaims } = useAuth();
  const [step, setStep] = useState("form");
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    if (!open || !tokenClaims?.userId) return;

    async function load() {
      const [wallet, pmRes] = await Promise.all([
        getWalletByUserId(Number(tokenClaims.userId)),
        getPaymentMethodsForUserWithId(tokenClaims.userId, 0),
      ]);
      setWalletBalance(wallet.balance);
      const active = (pmRes.content || []).filter((pm) => pm.active);
      setPaymentMethods(active);
      if (active.length > 0) {
        setSelectedId(String(active[0].paymentMethodId));
      }
    }

    load().catch(() => {});
  }, [open, tokenClaims?.userId]);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setAmount("");
      setError("");
      setSuccessMessage("");
      setSubmitting(false);
      setTransactionId(null);
    }
  }, [open]);

  const selectedMethod = paymentMethods.find(
    (pm) => String(pm.paymentMethodId) === selectedId,
  );

  const numericAmount = parseFloat(amount);
  const isValidAmount =
    !Number.isNaN(numericAmount) &&
    numericAmount >= MIN_LOAD_AMOUNT &&
    numericAmount <= MAX_LOAD_AMOUNT;

  const validationMessage = useMemo(() => {
    if (amount === "") return "";
    if (!isValidAmount) {
      return `Amount must be between ${formatMoney(MIN_LOAD_AMOUNT)} and ${formatMoney(MAX_LOAD_AMOUNT)}.`;
    }
    return "";
  }, [amount, isValidAmount]);

  const handleClose = () => {
    onClose();
  };

  const handleContinue = () => {
    if (!selectedMethod || !isValidAmount) return;
    setError("");
    setStep("review");
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setError("");
    setSubmitting(true);
    try {
      const result = await loadWallet(selectedMethod.paymentMethodId, numericAmount);
      setSuccessMessage(
        `has been successfully transferred from ${paymentMethodLabel(selectedMethod)} into your SmartPay wallet.`,
      );
      setTransactionId(result.transactionId ?? null);
      setStep("success");
      onSuccess?.(result.balance);
    } catch (err) {
      setError(
        err.message ||
          "The selected linked payment method does not have enough available balance to complete this wallet load.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updatedBalance = Number(walletBalance || 0) + (isValidAmount ? numericAmount : 0);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" slotProps={{paper:{
      sx:{
        borderRadius: 6,
      }
    } }}>
      <Box sx={{ p: 2.5, position: "relative" }}>
       
        {step === "form" && (
          <>
            <Typography
              component="h2"
              sx={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", mb: 0.75, pr: 4 }}
            >
              Load Wallet
            </Typography>
            <Typography sx={{ color: tokens.color.text.primary , fontSize: 15, lineHeight: 1.5 }}>
              Transfer money from a linked bank account into your SmartPay wallet balance.
            </Typography>

            <Box
              sx={{
                mt: 2.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  borderRadius: "14px",
                  p: 2,
                  bgcolor: tokens.color.background.stack,
                  border: `1px solid ${WALLET_COLORS.border}`,
                }}
              >
                <Typography
                  sx={{ color: WALLET_COLORS.muted, fontSize: 12, fontWeight: 800, mb: 0.75 }}
                >
                  Current Wallet Balance
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {formatMoney(walletBalance)}
                </Typography>
              </Box>
              <Box
                sx={{
                  borderRadius: "14px",
                  p: 2,
                  bgcolor: tokens.color.background.stack,
                  border: `1px solid ${WALLET_COLORS.border}`,
                }}
              >
                <Typography
                  sx={{ color: WALLET_COLORS.muted, fontSize: 12, fontWeight: 800, mb: 0.75 }}
                >
                  Selected Funding Source
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {selectedMethod ? paymentMethodLabel(selectedMethod) : "—"}
                </Typography>
              </Box>
            </Box>

            {paymentMethods.length === 0 ? (
              <Box sx={{ mt: 2 }}>
                <AlertBox variant="error">
                  <strong>No linked accounts.</strong> Connect a bank account under Payment Methods
                  first.
                </AlertBox>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{
                  fontSize: tokens.typography.fontSize.extraSmall,
                  fontWeight: tokens.typography.fontWeight.extrabold,
                  mb: 1,
                  color: tokens.color.text.primary }}>
                  Load Funds From
                </Typography>
                <Select
                  fullWidth
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  sx={{ height: 48, borderRadius: "12px", bgcolor: tokens.color.background.stack }}
                >
                  {paymentMethods.map((pm) => (
                    <MenuItem key={pm.paymentMethodId} value={String(pm.paymentMethodId)}>
                      {pm.bankDisplayName} {pm.accountIdentifierMasked} — {pm.accountName}
                    </MenuItem>
                  ))}
                </Select>
                <Typography sx={{ mt: 0.875, fontSize: 12, color: WALLET_COLORS.muted }}>
                  Only verified linked payment methods should appear here.
                </Typography>

                <Typography sx={{
                  fontSize: tokens.typography.fontSize.extraSmall,
                  fontWeight: 800,
                  mb: 1,
                  mt: 2.25,
                  color: tokens.color.text.primary
                }}>
                  Load Amount
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={Boolean(validationMessage)}
                  helperText={validationMessage}
                  inputProps={{ min: MIN_LOAD_AMOUNT, max: MAX_LOAD_AMOUNT, step: "0.01" }}
                  sx={{
                    "& .MuiOutlinedInput-root": { height: 48, borderRadius: "12px" },
                    "& .MuiFormHelperText-root": { mx: 0, mt: 0.75, fontSize: 12 },
                  }}
                />
                {!validationMessage && (
                  <Typography sx={{ mt: 0.875, fontSize: 12, color: WALLET_COLORS.muted }}>
                    Amount must be greater than $1.00 and within daily wallet funding limits.
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
              <Button onClick={handleClose} sx={secondaryButtonSx}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!isValidAmount || paymentMethods.length === 0}
                sx={primaryButtonSx}
              >
                Continue
              </Button>
            </Box>
          </>
        )}

        {step === "review" && selectedMethod && (
          <>
            <Typography
              sx={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", mb: 0.75, pr: 4 }}
            >
              Confirm Wallet Load
            </Typography>
            <Typography sx={{
              color: tokens.color.text.primary,
              fontSize: tokens.typography.fontSize.small,
              lineHeight: 1.5 }}>
              Review the wallet funding details before transferring money into your SmartPay wallet.
            </Typography>

            <Box
              sx={{
                mt: 2,
                border: `1px solid ${WALLET_COLORS.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {[
                ["Load From", paymentMethodLabel(selectedMethod)],
                ["Deposit To", "SmartPay Wallet"],
                ["Load Amount", formatMoney(numericAmount)],
                ["Updated Wallet Balance", formatMoney(updatedBalance)],
              ].map(([label, value], index, rows) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: "12px 14px",
                    borderBottom: index < rows.length - 1 ? "1px solid " + tokens.color.border.light : "none",
                    fontSize: 14,
                  }}
                >
                  <Typography sx={{ color: WALLET_COLORS.muted, fontWeight: 700 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                mt: 1,
                minHeight: REVIEW_ALERT_SLOT_MIN_HEIGHT,
                overflow: "auto",
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              {error ? (
                <AlertBox variant="error">
                  <strong>Insufficient bank account funds.</strong> {error}
                </AlertBox>
              ) : null}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
              <Button onClick={() => setStep("form")} sx={secondaryButtonSx}>
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={submitting} sx={primaryButtonSx}>
                {submitting ? "Processing..." : "Confirm Load"}
              </Button>
            </Box>
          </>
        )}

        {step === "success" && (
          <Box sx={{ pt: 1, "& .MuiContainer-root": { px: 0, maxWidth: "100%" } }}>
            <SuccessCard
              title="Wallet Loaded"
              data={formatMoney(numericAmount)}
              message={successMessage}
              transactionId={transactionId}
              primaryButtonText="Close"
              onPrimaryClick={handleClose}
              showCard={false}
            />
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
