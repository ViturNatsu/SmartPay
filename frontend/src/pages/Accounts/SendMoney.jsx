import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useAuth } from "@/context/AuthContext";
import { getWalletByUserId, sendMoney } from "@/api/wallets/walletApi";
import { getRailLabel, RAIL_TYPES } from "@/utils/transactionRailUtils";
import { getPayees } from "@/api/payees/payeeApi";
import { deletePayee } from "@/api/payee/payeeApi";
import { tokens } from "@/style/Theme.jsx";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
const STEPS = ["Send Money", "Review", "Done"];
const MAX_AMOUNT = 3000;
const MIN_AMOUNT = 1.00;


function StepIndicator({ current }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={3}>
      {STEPS.map((label, i) => (
        <Stack key={`${label}-${i}`} direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: i <= current ? tokens.color.brand.primary : tokens.color.border.gray,
              color: i <= current ? tokens.color.text.white : tokens.color.text.muted,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: i === current ? 700 : 500,
              color: i === current ? tokens.color.brand.primary : i < current ? tokens.color.text.heading : tokens.color.text.muted,
            }}
          >
            {label}
          </Typography>
          {i < STEPS.length - 1 && (
            <Box sx={{ width: 24, height: 2, bgcolor: i < current ? tokens.color.brand.primary : tokens.color.border.gray }} />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: "16px 18px",
        borderBottom: `1px solid ${tokens.color.border.dividerSoft}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ color: tokens.color.text.subdued, fontWeight: 600, fontSize: 14 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 14, textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}

export function SendMoney() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [payees, setPayees] = useState([]);
  const [payeesLoading, setPayeesLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [payeeToDelete, setPayeeToDelete] = useState(null);


  useEffect(() => {
    if (authLoading || !tokenClaims?.userId) return;

    Promise.all([getPayees(), getWalletByUserId(Number(tokenClaims.userId))])
      .then(([payeeList, wallet]) => {
        setPayees(payeeList);
        setWallet(wallet);
        setWalletBalance(wallet.balance);
      })
      .catch(() => {})
      .finally(() => setPayeesLoading(false));
  }, [authLoading, tokenClaims?.userId]);

  const validateAmount = (val) => {
    const value = String(val).trim();

    if (!value) {
      return "Please enter an amount";
    }

    // Only allow numbers with a maximum of 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return "Amount must be a valid number with no more than 2 decimal places";
    }

    const num = Number(value);

    if (num < MIN_AMOUNT) {
      return "Amount must be at least $1.00";
    }

    if (num > MAX_AMOUNT) {
        return "Amount cannot exceed $3,000.00";
    }

    if (walletBalance !== null && num > walletBalance) {
      return `Amount cannot exceed your wallet balance of $${walletBalance.toFixed(2)}`;
    }

    return "";
  };

  

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(validateAmount(e.target.value));
    setSubmitError("");
  };

  const handleConfirmDialog = (payeeId) => {
    setPayeeToDelete(payeeId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setPayeeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!payeeToDelete) return;

    try {
        await deletePayee(payeeToDelete);

        setPayees((prev) =>
        prev.filter((payee) => payee.payeeId !== payeeToDelete)
        );

        // If the deleted payee was selected in the To dropdown,
        // clear the selection.
        if (selectedPayee?.payeeId === payeeToDelete) {
        setSelectedPayee(null);
        }
    } catch (err) {
        setSubmitError(err?.message || "Failed to delete payee");
    } finally {
        setOpenConfirmDialog(false);
        setPayeeToDelete(null);
    }
  };

  const handleTransfer = async () => {
    const validationError = validateAmount(amount);

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await sendMoney(
        Number(tokenClaims.userId),
        selectedPayee.recipientId,
        Number(amount),
        null
      );

      setTransactionId(result?.transactionId ?? null);

      setWalletBalance(
        (prev) => Math.round((prev - Number(amount)) * 100) / 100
      );

      setStep(2);
    } catch (err) {
      setSubmitError(
        err?.message ?? "Transfer failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remainingBalance =
    walletBalance !== null && amount
      ? Math.round((walletBalance - parseFloat(amount || 0)) * 100) / 100
      : null;

  const today = new Date().toISOString().split("T")[0];

  const dailySpent =
    wallet?.dailySpentDate === today
      ? (wallet?.dailySpentAmount ?? 0)
      : 0;

  const dailyLimit = wallet?.dailySpendingLimit ?? null;

  const projectedDailySpent =
    dailySpent + Number(parseFloat(amount || 0));

  const dailyUsagePercent =
    dailyLimit && dailyLimit > 0
      ? Math.min((projectedDailySpent / dailyLimit) * 100, 100)
      : 0;

  const exceedsDailyLimit =
    dailyLimit &&
    projectedDailySpent > dailyLimit;

  const exceedsPerTransactionLimit =
    wallet?.perTransactionLimit &&
    Number(amount || 0) > wallet.perTransactionLimit;

  const formattedAmount = amount
    ? `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

  return (
    <BasicPageLayout
      title="Send Money"
      subtitle="Send money to a saved payee, or manage who you're able to send to."
    >
      {/* Step 1: Select Payee */}
      {step !== 0 && (
        <StepIndicator current={step} />
      )}

      {step === 0 && (
        <Stack spacing={3}>

            <Card
            elevation={0}
            sx={{
                borderRadius: "18px",
                border: `1px solid ${tokens.color.border.light}`,
                p: "24px",
            }}
            >
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: 17,
                    mb: 0.5,
                }}
                >
                Send Money
                </Typography>

                <Typography
                sx={{
                    color: tokens.color.text.muted,
                    fontSize: 13,
                    mb: 2.5,
                }}
                >
                Enter an amount and choose who to send it to.
                </Typography>

                <Box
                sx={{
                    borderRadius: "14px",
                    p: "14px 16px",
                    mb: 2.5,
                    background: tokens.color.background.panel,
                    border: `1px solid ${tokens.color.border.light}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
                >
                <Typography
                    sx={{
                    color: tokens.color.text.subdued,
                    fontSize: 12,
                    fontWeight: 700,
                    }}
                >
                    Available Wallet Balance
                </Typography>

                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                    {walletBalance !== null
                    ? `${walletBalance.toLocaleString("en-CA", {
                        style: "currency",
                        currency: "CAD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                        })}`
                    : "—"}
                </Typography>
                </Box>

                <Stack spacing={2.5}>
                <TextField
                    label="Amount"
                    fullWidth
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    error={!!amountError}
                    helperText={
                    amountError ||
                    "Amount cannot exceed your available wallet balance."
                    }
                    inputProps={{
                    min: 1,
                    max: 3000,
                    step: 0.01,
                    }}
                />

                <TextField
                    select
                    label="To"
                    fullWidth
                    value={selectedPayee?.payeeId ?? ""}
                    disabled={payeesLoading || payees.length === 0}
                    onChange={(e) => {
                    const payee = payees.find(
                        (p) =>
                        String(p.payeeId) ===
                        String(e.target.value)
                    );

                    setSelectedPayee(payee ?? null);
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    SelectProps={{
                    native: true,
                    }}
                >
                    <option value="">
                    {payees.length === 0
                        ? "Add a payee to send money"
                        : "Select a saved payee"}
                    </option>

                    {payees.map((payee) => (
                    <option
                        key={payee.payeeId}
                        value={payee.payeeId}
                    >
                        {payee.payeeName} · {payee.email || payee.phoneNumber}
                    </option>
                    ))}
                </TextField>

                {payees.length === 0 && !payeesLoading && (
                    <Typography
                    sx={{
                        color: tokens.color.text.subdued,
                        fontSize: 12,
                    }}
                    >
                    You don't have any saved payees yet. Add one below to get started.
                    </Typography>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    disabled={
                    payeesLoading ||
                    payees.length === 0 ||
                    !selectedPayee ||
                    !amount ||
                    !!amountError
                    }
                    onClick={() => setStep(1)}
                    sx={{
                    bgcolor: tokens.color.brand.primary,
                    "&:hover": {
                        bgcolor: tokens.color.brand.primaryHover,
                    },
                    }}
                >
                    Send Money
                </Button>
                </Stack>
            </Card>

            <Card
            elevation={0}
            sx={{
                borderRadius: "18px",
                border: `1px solid ${tokens.color.border.light}`,
                p: "24px",
            }}
            >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 17 }}>
                    Manage Payees
                </Typography>

                <Typography
                    sx={{
                    color: tokens.color.text.muted,
                    fontSize: 13,
                    mt: 0.5,
                    }}
                >
                    Add, edit, or remove the people you can send money to.
                </Typography>
                </Box>

                <Button
                variant="contained"
                onClick={() =>
                    navigate("/add-payee", {
                        state: { returnTo: "/send-money" },
                    })
                }
                sx={{
                    textTransform: "none",
                    bgcolor: tokens.color.brand.primary,
                    "&:hover": {
                    bgcolor: tokens.color.brand.primaryHover,
                    },
                }}
                >
                + Add Payee
                </Button>
            </Stack>

            {payeesLoading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress size={28} />
                </Box>
            ) : payees.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontWeight: 700 }}>
                    No payees saved yet
                </Typography>

                <Typography
                    sx={{
                    color: tokens.color.text.muted,
                    fontSize: 13,
                    mt: 0.5,
                    }}
                >
                    Add a payee above to start sending money.
                </Typography>
                </Box>
            ) : (
                <Stack spacing={1.5}>
                {payees.map((payee) => (
                    <Box
                    key={payee.payeeId}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        border: `1px solid ${tokens.color.border.light}`,
                        borderRadius: "12px",
                    }}
                    >
                    <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                        {payee.payeeName}
                        </Typography>

                        <Typography
                        sx={{
                            color: tokens.color.text.muted,
                            fontSize: 12,
                        }}
                        >
                        {payee.email || payee.phoneNumber}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleConfirmDialog(payee.payeeId)}
                        sx={{ textTransform: "none" }}
                    >
                        Delete
                    </Button>
                    </Box>
                ))}
                </Stack>
            )}
            </Card>

        </Stack>
       )}

      {/* Step 1: Review */}
      {step === 1 && (
        <>
          <Card elevation={0} sx={{ borderRadius: "18px", border: `1px solid ${tokens.color.border.light}`, overflow: "hidden" }}>
            <ConfirmRow label="Payment Type" value={getRailLabel(RAIL_TYPES.WALLET_TRANSFER)} />
            <ConfirmRow label="Send From" value="SmartPay Wallet" />
            <ConfirmRow label="Send To" value={`${selectedPayee.payeeName} — ${ selectedPayee.email || selectedPayee.phoneNumber }`} />
            <ConfirmRow label="Transfer Amount" value={formattedAmount} />
            {remainingBalance !== null && (
              <>
                <ConfirmRow
                  label="Remaining Wallet Balance"
                  value={`$${remainingBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                />

                {dailyLimit && (
                  <Box sx={{ p: "20px 18px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>Daily Usage After Transfer</Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        ${projectedDailySpent.toFixed(2)} / ${dailyLimit.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 12, borderRadius: 999, bgcolor: tokens.color.border.light, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${dailyUsagePercent}%`,
                          height: "100%",
                          bgcolor: dailyUsagePercent >= 90 ? tokens.color.text.number.negative : dailyUsagePercent >= 75 ? tokens.color.status.warningBright : tokens.color.brand.primary,
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}

            {exceedsDailyLimit && (
              <Box sx={{ mx: 2, mb: 2, p: "14px 16px", borderRadius: "12px", border: `1px solid ${tokens.color.status.errorBorder}`, bgcolor: tokens.color.status.errorBg, color: tokens.color.status.error, fontSize: 13 }}>
                This transfer exceeds your wallet daily spending limit of ${dailyLimit.toFixed(2)}.
              </Box>
            )}

            {exceedsPerTransactionLimit && (
              <Box sx={{ mx: 2, mb: 2, p: "14px 16px", borderRadius: "12px", border: `1px solid ${tokens.color.status.errorBorder}`, bgcolor: tokens.color.status.errorBg, color: tokens.color.status.error, fontSize: 13 }}>
                This transfer exceeds your wallet per-transaction limit of ${wallet.perTransactionLimit.toFixed(2)}.
              </Box>
            )}

            {submitError && (
              <Box sx={{ mx: 2, mb: 2, p: "14px 16px", borderRadius: "12px", border: `1px solid ${tokens.color.status.errorBorder}`, bgcolor: tokens.color.status.errorBg, color: tokens.color.status.error, fontSize: 13 }}>
                {submitError}
              </Box>
            )}


            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, p: "20px 24px", borderTop: `1px solid ${tokens.color.border.dividerSoft}` }}>
              <Button
                variant="outlined"
                onClick={() => { setSubmitError(""); setStep(0); }}
                disabled={submitting}
                sx={{ borderColor: tokens.color.border.medium, color: tokens.color.text.heading }}
              >
                Back
              </Button>
              <Button variant="contained" onClick={handleTransfer}
                disabled={submitting || Boolean(submitError) || exceedsDailyLimit || exceedsPerTransactionLimit}
                sx={{ bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover } }}>
                {submitting ? <CircularProgress size={20} sx={{ color: tokens.color.text.white }} /> : "Complete Transfer"}
              </Button>
            </Box>
          </Card>
        </>
      )}

      {/* Step 2: Success */}
      {step === 2 && (
        <Card elevation={0} sx={{ borderRadius: "18px", border: `1px solid ${tokens.color.border.light}`, p: { xs: "40px 24px", md: "54px 44px" }, textAlign: "center" }}>
          <Box sx={{ width: 82, height: 82, borderRadius: "50%", bgcolor: tokens.color.status.successBg, border: `1px solid ${tokens.color.status.successBorder}`, color: tokens.color.status.success, display: "grid", placeItems: "center", mx: "auto", mb: 2.5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Money Sent</Typography>
          <Typography sx={{ color: tokens.color.text.subdued, fontSize: 14, mb: transactionId ? 1.5 : 3.5, lineHeight: 1.6 }}>
            {formattedAmount} has been sent to {selectedPayee.payeeName} from your SmartPay wallet.
          </Typography>
          {transactionId && (
            <Typography sx={{ color: tokens.color.text.muted, fontSize: 12, mb: 3.5, fontFamily: "monospace" }}>
              Transaction ID: {transactionId}
            </Typography>
          )}
          <Button variant="contained" onClick={() => navigate("/home")}
            sx={{ bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover }, px: 3 }}>
            Done
          </Button>
        </Card>
      )}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
            sx: {
            borderRadius: 3,
            p: 1,
            },
        }}
        >
        <DialogTitle sx={{ fontWeight: 700 }}>
            Delete this Payee?
        </DialogTitle>

        <DialogContent>
            <DialogContentText>
            Are you sure you want to delete this payee? This action cannot be undone.
            </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ pb: 2, px: 3 }}>
            <Button
            variant="outlined"
            onClick={handleCloseConfirmDialog}
            sx={{ textTransform: "none" }}
            >
            Cancel
            </Button>

            <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ textTransform: "none" }}
            >
            Delete
            </Button>
        </DialogActions>
      </Dialog>
    </BasicPageLayout>
  );
}
