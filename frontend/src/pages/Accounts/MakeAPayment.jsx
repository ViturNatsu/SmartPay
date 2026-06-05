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
              bgcolor: i <= current ? "#0f7490" : "#E5E7EB",
              color: i <= current ? "#fff" : "#9CA3AF",
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
              color: i === current ? "#0f7490" : i < current ? "#374151" : "#9CA3AF",
            }}
          >
            {label}
          </Typography>
          {i < 2 && (
            <Box sx={{ width: 24, height: 2, bgcolor: i < current ? "#0f7490" : "#E5E7EB" }} />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function PayeeRow({ payee, selected, onSelect }) {
  const initials = `${payee.firstName?.[0] ?? ""}${payee.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <Box
      onClick={() => onSelect(payee)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: "14px 16px",
        borderBottom: "1px solid #EDF2F7",
        cursor: "pointer",
        bgcolor: selected ? "#e5f5fa" : "transparent",
        borderLeft: selected ? "4px solid #0f7490" : "4px solid transparent",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: selected ? "#e5f5fa" : "#F9FAFB" },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#0f7490",
            color: "#fff",
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
            {payee.firstName} {payee.lastName}
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 12 }}>
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
        borderBottom: "1px solid #EEF2F3",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: 14 }}>{label}</Typography>
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
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [amountError, setAmountError] = useState("");
  const [memoError, setMemoError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !tokenClaims?.userId) return;

    Promise.all([getPayees(), getWalletByUserId(Number(tokenClaims.userId))])
      .then(([payeeList, wallet]) => {
        setPayees(payeeList);
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
  };

  const handleMemoChange = (e) => {
    setMemo(e.target.value);
    setMemoError(validateMemo(e.target.value));
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
      await sendMoney(
        Number(tokenClaims.userId),
        selectedPayee.recipientId,
        parseFloat(parseFloat(amount).toFixed(2)),
        memo.trim() || null
      );
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

  const formattedAmount = amount
    ? `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

  return (
    <>
      <Navbar />
      <Box sx={{ background: "#F8FAFC", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 720, mx: "auto" }}>

          {/* Step 1: Select Payee */}
          {step === 0 && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Send Money</Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 3 }}>
                Choose a saved payee to send money to.
              </Typography>
              <StepIndicator current={0} />
              <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <Box sx={{ p: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Saved Payees</Typography>
                  <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.5 }}>Scroll to see all saved payees</Typography>
                </Box>

                {payeesLoading ? (
                  <Box sx={{ display: "grid", placeItems: "center", p: 4 }}>
                    <CircularProgress size={28} sx={{ color: "#0f7490" }} />
                  </Box>
                ) : payees.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>You have no saved payees yet.</Typography>
                    <Button variant="outlined" size="small"
                      sx={{ mt: 2, borderColor: "#0f7490", color: "#0f7490" }}
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

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, p: "20px 24px", borderTop: "1px solid #E2E8F0" }}>
                  <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderColor: "#CBD5E1", color: "#374151" }}>Cancel</Button>
                  <Button variant="contained" disabled={!selectedPayee} onClick={() => setStep(1)}
                    sx={{ bgcolor: "#0f7490", "&:hover": { bgcolor: "#0a5a70" } }}>
                    Continue
                  </Button>
                </Box>
              </Card>
            </>
          )}

          {/* Step 2: Enter Amount & Memo */}
          {step === 1 && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Send to {selectedPayee.firstName} {selectedPayee.lastName}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 3 }}>Enter the amount and an optional memo.</Typography>
              <StepIndicator current={1} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
                {[
                  { label: "Available Wallet Balance", value: walletBalance !== null ? `$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" },
                  { label: "Selected Payee", value: `${selectedPayee.firstName} ${selectedPayee.lastName}` },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ flex: 1, borderRadius: "14px", p: "16px", background: "#F7FAFB", border: "1px solid #E2E8F0" }}>
                    <Typography sx={{ color: "#64748b", fontSize: 12, fontWeight: 700, mb: 0.75 }}>{label}</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{value}</Typography>
                  </Box>
                ))}
              </Stack>

              <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #E2E8F0", p: "24px" }}>
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
                  <Button variant="outlined" onClick={() => setStep(0)} sx={{ borderColor: "#CBD5E1", color: "#374151" }}>Back</Button>
                  <Button variant="contained" onClick={handleStep2Continue}
                    sx={{ bgcolor: "#0f7490", "&:hover": { bgcolor: "#0a5a70" } }}>Continue</Button>
                </Box>
              </Card>
            </>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Confirm Transfer</Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 3 }}>Review the details before sending.</Typography>
              <StepIndicator current={2} />

              <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <ConfirmRow label="Send From" value="SmartPay Wallet" />
                <ConfirmRow label="Send To" value={`${selectedPayee.firstName} ${selectedPayee.lastName} — ${selectedPayee.email}`} />
                <ConfirmRow label="Transfer Amount" value={formattedAmount} />
                <ConfirmRow label="Memo" value={memo.trim() || "—"} />
                {remainingBalance !== null && (
                  <ConfirmRow label="Remaining Wallet Balance"
                    value={`$${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                )}

                {submitError && (
                  <Box sx={{ mx: 2, mb: 2, p: "14px 16px", borderRadius: "12px", border: "1px solid #fca5a5", bgcolor: "#fee2e2", color: "#b91c1c", fontSize: 13 }}>
                    {submitError}
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, p: "20px 24px", borderTop: "1px solid #EEF2F3" }}>
                  <Button variant="outlined" onClick={() => setStep(1)} disabled={submitting} sx={{ borderColor: "#CBD5E1", color: "#374151" }}>Back</Button>
                  <Button variant="contained" onClick={handleTransfer} disabled={submitting}
                    sx={{ bgcolor: "#0f7490", "&:hover": { bgcolor: "#0a5a70" } }}>
                    {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Complete Transfer"}
                  </Button>
                </Box>
              </Card>
            </>
          )}

          {/* Step 4: Success */}
          {step === 3 && (
            <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #E2E8F0", p: { xs: "40px 24px", md: "54px 44px" }, textAlign: "center" }}>
              <Box sx={{ width: 82, height: 82, borderRadius: "50%", bgcolor: "#dcfce7", border: "1px solid #86efac", color: "#15803d", display: "grid", placeItems: "center", mx: "auto", mb: 2.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Money Sent</Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 3.5, lineHeight: 1.6 }}>
                {formattedAmount} has been sent to {selectedPayee.firstName} {selectedPayee.lastName} from your SmartPay wallet.
              </Typography>
              <Button variant="contained" onClick={() => navigate("/home")}
                sx={{ bgcolor: "#0f7490", "&:hover": { bgcolor: "#0a5a70" }, px: 3 }}>
                Return to Dashboard
              </Button>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
}
