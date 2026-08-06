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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getPayees } from "@/api/payees/payeeApi";
import { getWalletByUserId, sendMoney } from "@/api/wallets/walletApi";
import { getRailLabel, RAIL_TYPES } from "@/utils/transactionRailUtils";

import { tokens } from "@/style/Theme.jsx";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
const STEPS = ["Select Payee", "Enter Amount", "Review", "Done"];
const MAX_AMOUNT = 3000;
const MIN_AMOUNT = 0.01;
const MAX_MEMO = 100;
const MEMO_PATTERN = /^[A-Za-z0-9 ]*$/;

function StepIndicator({ current }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={3}>
      {STEPS.slice(0, 3).map((label, i) => (
        <Stack key={label} direction="row" alignItems="center" spacing={1}>
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
          {i < 2 && (
            <Box sx={{ width: 24, height: 2, bgcolor: i < current ? tokens.color.brand.primary : tokens.color.border.gray }} />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function PayeeRow({ payee, selected, onSelect }) {
  const initials = (payee.payeeName?.[0] ?? "").toUpperCase();

  return (
    <Box
      onClick={() => onSelect(payee)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: "14px 16px",
        borderBottom: `1px solid ${tokens.color.border.divider}`,
        cursor: "pointer",
        bgcolor: selected ? tokens.color.brand.primaryLight : "transparent",
        borderLeft: selected ? `4px solid ${tokens.color.brand.primary}` : "4px solid transparent",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: selected ? tokens.color.brand.primaryLight : tokens.color.background.stack },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: tokens.color.brand.primary,
            color: tokens.color.text.white,
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            {payee.payeeName}
          </Typography>
          {payee.phoneNumber && (
            <Typography sx={{ color: tokens.color.text.subdued, fontSize: 12 }}>
              {payee.phoneNumber}
            </Typography>
          )}
          <Typography sx={{ color: tokens.color.text.subdued, fontSize: 12 }}>
            {payee.email}
          </Typography>
        </Box>
      </Stack>
    </Box>
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

export function MakeAPayment() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [payees, setPayees] = useState([]);
  const [payeesLoading, setPayeesLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [amountError, setAmountError] = useState("");
  const [memoError, setMemoError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const getHeaderTypography = () => {

      switch (step) {
        case 0:
          setTitle("Send Money");
          setSubtitle("Choose a saved payee to send money to.");
          break;
        case 1:
          setTitle(`Send to ${selectedPayee.payeeName}`);
          setSubtitle("Enter the amount and an optional memo.");
          break;

        case 2:
          setTitle("Confirm Transfer");
          setSubtitle("Review the details before sending.");
          break;
        case 3:
          setTitle("Success!");
          setSubtitle(``)
          break;
      }
    }

    getHeaderTypography();
  }, [step])

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
    const num = parseFloat(val);
    if (!val || isNaN(num)) return "Please enter an amount";
    if (num < MIN_AMOUNT) return "Amount must be at least $0.01";
    if (num > MAX_AMOUNT) return "Amount cannot exceed $3,000.00";
    if (walletBalance !== null && num > walletBalance)
      return `Amount cannot exceed your wallet balance of $${walletBalance.toFixed(2)}`;
    return "";
  };

  const validateMemo = (val) => {
    if (!val) return "";
    if (val.length > MAX_MEMO) return "Memo cannot exceed 100 characters";
    if (!MEMO_PATTERN.test(val)) return "Memo can only contain letters, numbers, and spaces";
    return "";
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(validateAmount(e.target.value));
    setSubmitError("");
  };

  const handleMemoChange = (e) => {
    setMemo(e.target.value);
    setMemoError(validateMemo(e.target.value));
    setSubmitError("");
  };

  const handleStep2Continue = () => {
    const aErr = validateAmount(amount);
    const mErr = validateMemo(memo);
    setAmountError(aErr);
    setMemoError(mErr);
    if (!aErr && !mErr) setStep(2);
  };

  const handleTransfer = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await sendMoney(
        Number(tokenClaims.userId),
        selectedPayee.recipientId,
        parseFloat(parseFloat(amount).toFixed(2)),
        memo.trim() || null
      );
      setTransactionId(result?.transactionId ?? null);
      setWalletBalance((prev) => Math.round((prev - parseFloat(amount)) * 100) / 100);
      setStep(3);
    } catch (err) {
      setSubmitError(err?.message ?? "Transfer failed. Please try again.");
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
      title={title}
      subtitle={subtitle}
    >
      {/* Step 1: Select Payee */}
      <StepIndicator current={step} />

      {step === 0 && (
        <>
          <Card elevation={0} sx={{ border: `1px solid ${tokens.color.border.light}`, overflow: "hidden" }}>
            <Box sx={{ p: "20px 24px", borderBottom: `1px solid ${tokens.color.border.light}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: tokens.color.text.heading }}>Saved Payees</Typography>
              <Typography sx={{ fontSize: 12, color: tokens.color.text.muted, mt: 0.5 }}>Scroll to see all saved payees</Typography>
            </Box>

            {payeesLoading ? (
              <Box sx={{ display: "grid", placeItems: "center", p: 4 }}>
                <CircularProgress size={28} sx={{ color: tokens.color.brand.primary }} />
              </Box>
            ) : payees.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: tokens.color.text.subdued, fontSize: 14 }}>You have no saved payees yet.</Typography>
                <Button variant="outlined" size="small"
                  sx={{ mt: 2, borderColor: tokens.color.brand.primary, color: tokens.color.brand.primary }}
                  onClick={() => navigate("/add-payee")}>
                  Add a Payee
                </Button>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
                {payees.map((p) => (
                  <PayeeRow key={p.payeeId} payee={p}
                    selected={selectedPayee?.payeeId === p.payeeId}
                    onSelect={setSelectedPayee} />
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, p: "20px 24px", borderTop: `1px solid ${tokens.color.border.light}` }}>
              <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderColor: tokens.color.border.medium, color: tokens.color.text.heading }}>Cancel</Button>
              <Button variant="contained" disabled={!selectedPayee} onClick={() => setStep(1)}
                sx={{ bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover } }}>
                Continue
              </Button>
            </Box>
          </Card>
        </>
      )}

      {/* Step 2: Enter Amount & Memo */}
      {step === 1 && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
            {[
              { label: "Available Wallet Balance", value: walletBalance !== null ? `$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" },
              { label: "Selected Payee", value: selectedPayee.payeeName },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ flex: 1, borderRadius: "14px", p: "16px", background: tokens.color.background.panel, border: `1px solid ${tokens.color.border.light}` }}>
                <Typography sx={{ color: tokens.color.text.subdued, fontSize: 12, fontWeight: 700, mb: 0.75 }}>{label}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{value}</Typography>
              </Box>
            ))}
          </Stack>

          <Card elevation={0} sx={{ borderRadius: "18px", border: `1px solid ${tokens.color.border.light}`, p: "24px" }}>
            <Stack spacing={2.5}>
              <TextField label="Dollar Amount" fullWidth type="number"
                inputProps={{ min: 0.01, max: 3000, step: 0.01 }}
                value={amount} onChange={handleAmountChange}
                error={!!amountError}
                helperText={amountError || "Amount must be between $0.01 and $3,000.00"}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Memo (optional)" fullWidth multiline minRows={3}
                value={memo} onChange={handleMemoChange}
                error={!!memoError}
                helperText={memoError || `${memo.length}/100 characters — letters, numbers, and spaces only`}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(0)} sx={{ borderColor: tokens.color.border.medium, color: tokens.color.text.heading }}>Back</Button>
              <Button variant="contained" onClick={handleStep2Continue}
                sx={{ bgcolor: tokens.color.brand.primary, "&:hover": { bgcolor: tokens.color.brand.primaryHover } }}>Continue</Button>
            </Box>
          </Card>
        </>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <>
          <Card elevation={0} sx={{ borderRadius: "18px", border: `1px solid ${tokens.color.border.light}`, overflow: "hidden" }}>
            <ConfirmRow label="Payment Type" value={getRailLabel(RAIL_TYPES.WALLET_TRANSFER)} />
            <ConfirmRow label="Send From" value="SmartPay Wallet" />
            <ConfirmRow label="Send To" value={`${selectedPayee.payeeName} — ${selectedPayee.email}`} />
            <ConfirmRow label="Transfer Amount" value={formattedAmount} />
            <ConfirmRow label="Memo" value={memo.trim() || "—"} />
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
                onClick={() => { setSubmitError(""); setStep(1); }}
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

      {/* Step 4: Success */}
      {step === 3 && (
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
            Return to Dashboard
          </Button>
        </Card>
      )}
    </BasicPageLayout>
  );
}
