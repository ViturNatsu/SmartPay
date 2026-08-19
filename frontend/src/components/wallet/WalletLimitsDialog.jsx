import { useEffect, useState } from "react";
import { tokens } from "@/style/Theme.jsx";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  updateDailySpendingLimit,
  updatePerTransactionLimit,
} from "@/api/wallets/walletApi";
import { validateSpendingLimit } from "@/utils/validateSpendingLimit";

const STEPS = {
  EDIT: "EDIT",
  REVIEW: "REVIEW",
  SUCCESS: "SUCCESS",
};

const DEFAULT_DAILY_LIMIT = "500";
const DEFAULT_TRANSACTION_LIMIT = "150";

/**
 * WalletLimitsDialog
 *
 * Allows the user to manage wallet-level spending limits.
 *
 * Limits apply to the entire wallet, not to individual linked funding sources.
 */
function WalletLimitsDialog({ open, onClose, onSuccess, wallet, userId, paymentMethods = [], }) {
  const [dailyLimit, setDailyLimit] = useState("");
  const [perTransactionLimit, setPerTransactionLimit] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(STEPS.EDIT);

  const formatCurrency = (value) =>
  Number(value ?? 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const walletBalance = wallet?.balance ?? 0;

  const today = new Date().toISOString().split("T")[0];

  const dailyUsage =
    wallet?.dailySpentDate === today
        ? (wallet?.dailySpentAmount ?? 0)
        : 0;
  const fundingSourceCount = paymentMethods.length;

  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(false);
  const [perTransactionLimitEnabled, setPerTransactionLimitEnabled] = useState(false);

    const dailyLimitDisplay =
    !dailyLimitEnabled
        ? "No daily limit"
        : `${formatCurrency(dailyLimit)} per day`;

    const perTransactionLimitDisplay =
    !perTransactionLimitEnabled
        ? "No per-transaction limit"
        : `${formatCurrency(perTransactionLimit)} per transaction`;
        
    useEffect(() => {
        if (open && wallet && !saved) {
            setDailyLimit(wallet.dailySpendingLimit ?? "");
            setPerTransactionLimit(wallet.perTransactionLimit ?? "");
            
            setDailyLimitEnabled(wallet.dailySpendingLimit != null);
            setPerTransactionLimitEnabled(wallet.perTransactionLimit != null);
            setError(null);
            setSuccessMessage(null);
            setSaving(false);
        }
    }, [open, wallet, saved]);


    useEffect(() => {
        if (open) {
            setSaved(false);
            setStep(STEPS.EDIT);
        }
    }, [open]);

  const handleSave = async () => {
    const dailyError = dailyLimitEnabled
        ? validateSpendingLimit(dailyLimit, "Daily spending limit")
        : null;
    if (dailyError) {
      setError(dailyError);
      return;
    }

    const perTransactionError = perTransactionLimitEnabled
        ? validateSpendingLimit(
            perTransactionLimit,
            "Per-transaction limit"
        )
        : null;
    if (perTransactionError) {
      setError(perTransactionError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let updatedWallet = wallet;

      updatedWallet = await updateDailySpendingLimit(userId, {
        dailySpendingLimit:
           !dailyLimitEnabled ? null : dailyLimit.trim(),
      });

      updatedWallet = await updatePerTransactionLimit(userId, {
        perTransactionLimit:
            !perTransactionLimitEnabled
                ? null
                : perTransactionLimit.trim(),
      });

      onSuccess(updatedWallet);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Failed to save wallet limits.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLimits = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let updatedWallet = await updateDailySpendingLimit(userId, {
        dailySpendingLimit: null,
      });

      updatedWallet = await updatePerTransactionLimit(userId, {
        perTransactionLimit: null,
      });

      setDailyLimit("");
      setPerTransactionLimit("");
      onSuccess(updatedWallet);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Failed to remove wallet limits.");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
        <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
        >
        <DialogContent>
            <Box sx={{ textAlign: "center", py: 6 }}>
            <Box
                sx={{
                width: 82,
                height: 82,
                borderRadius: "999px",
                bgcolor: tokens.color.status.successBg,
                color: tokens.color.status.success,
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2.75,
                fontSize: 42,
                fontWeight: 900,
                border: `1px solid ${tokens.color.status.successBorder}`,
                }}
            >
                ✓
            </Box>

            <Typography sx={{ fontSize: 30, fontWeight: 900, mb: 1 }}>
                Wallet Limits Saved
            </Typography>

            <Typography sx={{ color: tokens.color.text.secondary, fontSize: 14, mb: 3.5 }}>
                Your wallet-level daily spending limit and per-transaction limit
                have been saved successfully.
            </Typography>

            <Button
                variant="contained"
                onClick={onClose}
                sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: tokens.color.brand.primary,
                "&:hover": { bgcolor: tokens.color.brand.primaryHover },
                }}
            >
                Return to Wallet
            </Button>
            </Box>
        </DialogContent>
        </Dialog>
    );
    }

    if (step === STEPS.REVIEW) {
        return (
            <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3 } }}
            >
            <DialogTitle sx={{ fontWeight: 800, fontSize: 24 }}>
                Confirm Wallet Limits
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ color: tokens.color.text.secondary, fontSize: 13, mb: 2 }}>
                Wallet / Wallet Limits / Review
                </Typography>

                <Typography sx={{ color: tokens.color.text.subdued, mb: 3 }}>
                Review the wallet-level spending limits before saving them.
                </Typography>

                <Box
                sx={{
                    mt: 2,
                    border: `1px solid ${tokens.color.border.light}`,
                    borderRadius: 2,
                    overflow: "hidden",
                }}
                >
                {[
                    ["Limit Scope", "Entire SmartPay Wallet"],
                    ["Daily Spending Limit", dailyLimitDisplay],
                    ["Per-Transaction Limit", perTransactionLimitDisplay],
                    ["Applies Across", "All linked funding sources"],
                    ["Effective", "Immediately after saving"],
                ].map(([label, value]) => (
                    <Box
                    key={label}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        px: 2.25,
                        py: 2,
                        borderBottom: `1px solid ${tokens.color.border.dividerSoft}`,
                        "&:last-child": { borderBottom: 0 },
                    }}
                    >
                    <Typography sx={{ color: tokens.color.text.secondary, fontWeight: 700 }}>
                        {label}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, textAlign: "right" }}>
                        {value}
                    </Typography>
                    </Box>
                ))}
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                    onClick={() => setStep(STEPS.EDIT)}
                    disabled={saving}
                    sx={{ textTransform: "none", fontWeight: 800 }}
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    bgcolor: tokens.color.brand.primary,
                    "&:hover": { bgcolor: tokens.color.brand.primaryHover },
                    }}
                >
                    Confirm Limits
                </Button>
                </Stack>
            </DialogContent>
            </Dialog>
        );
        }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 24 }}>
        Wallet Spending Limits
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: tokens.color.text.secondary, fontSize: 13, mb: 2 }}>
            Wallet / Wallet Limits
        </Typography>

        <Typography sx={{ color: tokens.color.text.subdued, mb: 3, lineHeight: 1.5 }}>
            Set daily and per-transaction limits that apply across the entire SmartPay
            wallet, regardless of linked bank accounts, cards, or funding sources.
        </Typography>

        <Box
            sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
            mb: 3,
            }}
        >
            <Box
            sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: tokens.color.brand.primaryLight,
                border: `1px solid ${tokens.color.brand.primaryMid}`,
            }}
            >
            <Typography sx={{ color: tokens.color.text.secondary, fontSize: 12, fontWeight: 800, mb: 0.75 }}>
                Wallet Balance
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(walletBalance)}
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
                Daily Usage Today
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(dailyUsage)}
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
                Funding Sources
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                {fundingSourceCount} Linked
            </Typography>
            </Box>
        </Box>

        <Stack spacing={2.5}>
            <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: `1px solid ${tokens.color.border.light}`,
                borderRadius: 2,
                bgcolor: tokens.color.brand.primaryBackground,
            }}
            >
            <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                Daily Spending Limit
                </Typography>
                <Typography sx={{ color: tokens.color.text.subdued, fontSize: 12, mt: 0.5 }}>
                Applies to total outgoing wallet transactions per calendar day.
                </Typography>
            </Box>
            <Switch
            checked={dailyLimitEnabled}
                onChange={(e) => {
                    setDailyLimitEnabled(e.target.checked);

                    if (e.target.checked && dailyLimit === "") {
                    setDailyLimit(DEFAULT_DAILY_LIMIT);
                    }
                }}
            />
            </Box>

            <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
            }}
            >
            <TextField
                label="Daily Spending Limit"
                type="number"
                value={dailyLimit}
                onChange={(e) => {
                    const value = e.target.value;
                    setDailyLimit(value);

                    if (dailyLimitEnabled && value !== "") {
                        setError(
                        validateSpendingLimit(value, "Daily spending limit")
                        );
                    } else {
                        setError(null);
                    }
                }}
                fullWidth
                disabled={!dailyLimitEnabled}
                slotProps={{
                    htmlInput: {
                        min: 1,
                        max: 10000,
                        step: "0.01",
                    },
                }}
                helperText="Enter a value between $1.00 and $10,000.00."
            />

            <TextField
                label="Today's Current Usage"
                value={`${formatCurrency(dailyUsage)} used today`}
                fullWidth
                disabled
            />
            </Box>

            <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: `1px solid ${tokens.color.border.light}`,
                borderRadius: 2,
                bgcolor: tokens.color.brand.primaryBackground,
            }}
            >
            <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                Per-Transaction Limit
                </Typography>
                <Typography sx={{ color: tokens.color.text.subdued, fontSize: 12, mt: 0.5 }}>
                Applies to any single outgoing wallet transaction.
                </Typography>
            </Box>
            <Switch
                checked={perTransactionLimitEnabled}
                onChange={(e) => {
                    setPerTransactionLimitEnabled(e.target.checked);

                    if (e.target.checked && perTransactionLimit === "") {
                    setPerTransactionLimit(DEFAULT_TRANSACTION_LIMIT);
                    }
                }}
            />
            </Box>

            <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
            }}
            >
            <TextField
                label="Per-Transaction Limit"
                type="number"
                value={perTransactionLimit}
                onChange={(e) => {
                    const value = e.target.value;
                    setPerTransactionLimit(value);

                    if (perTransactionLimitEnabled && value !== "") {
                        setError(
                        validateSpendingLimit(value, "Per-transaction limit")
                        );
                    } else {
                        setError(null);
                    }
                }}
                fullWidth
                disabled={!perTransactionLimitEnabled}
                slotProps={{
                    htmlInput: {
                        min: 1,
                        max: 10000,
                        step: "0.01",
                    },
                }}
                helperText="Enter a value between $1.00 and $10,000.00."
            />

            <TextField
                label="Applies To"
                value="All wallet transactions"
                fullWidth
                disabled
            />
            </Box>

            {successMessage && (
            <Alert severity="success">
                <strong>Valid limits.</strong> These limits will be saved at the wallet
                level and applied across all outgoing wallet transactions.
            </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Divider />

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button
                color="error"
                onClick={handleRemoveLimits}
                disabled={saving}
                sx={{ textTransform: "none", fontWeight: 800 }}
            >
                Remove Limits
            </Button>

            <Button
                onClick={onClose}
                disabled={saving}
                sx={{ textTransform: "none", fontWeight: 800 }}
            >
                Cancel
            </Button>

            <Button
                variant="contained"
                onClick={() => {
                    const dailyError = dailyLimitEnabled
                        ? validateSpendingLimit(dailyLimit, "Daily spending limit")
                        : null;
                    if (dailyError) {
                        setError(dailyError);
                        return;
                    }

                    const perTransactionError = perTransactionLimitEnabled
                        ? validateSpendingLimit(
                            perTransactionLimit,
                            "Per-transaction limit"
                        )
                        : null;
                    if (perTransactionError) {
                        setError(perTransactionError);
                        return;
                    }

                    setError(null);
                    setStep(STEPS.REVIEW);
                    }}
                disabled={saving}
                sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: tokens.color.brand.primary,
                "&:hover": { bgcolor: tokens.color.brand.primaryHover },
                }}
            >
                Review Limits
            </Button>
            </Stack>
        </Stack>
        </DialogContent>
    </Dialog>
  );
}

export default WalletLimitsDialog;