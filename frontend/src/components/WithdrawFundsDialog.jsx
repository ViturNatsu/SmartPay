import { useState, useEffect } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { withdrawFromWallet } from "@/api/wallets/walletApi";
import { validateWithdrawAmount } from "@/utils/validateWithdrawAmount";
import WithdrawDetailsStep from "@/components/withdraw/WithdrawDetailsStep";
import WithdrawReviewStep from "@/components/withdraw/WithdrawReviewStep";
import WithdrawSuccessStep from "@/components/withdraw/WithdrawSuccessStep";

/**
 * Withdrawal dialog step identifiers.
 * DETAILS  → enter amount and destination account
 * REVIEW   → confirm before submitting
 * SUCCESS  → shown after a successful API call
 */
const STEPS = { DETAILS: "DETAILS", REVIEW: "REVIEW", SUCCESS: "SUCCESS" };

const STEP_TITLES = {
  [STEPS.DETAILS]: "Withdraw Funds",
  [STEPS.REVIEW]:  "Confirm Withdrawal",
  [STEPS.SUCCESS]: null,
};

/**
 * WithdrawFundsDialog — orchestrator.
 *
 * Owns all dialog state and delegates rendering to the three focused
 * step components (SRP). Receives wallet data as props so it does not
 * reach directly into global state (DIP).
 *
 * Props:
 *  open           {boolean}  - Controls dialog visibility
 *  onClose        {Function} - Called when the dialog should dismiss
 *  onSuccess      {Function} - Called with the updated Wallet on success
 *  walletBalance  {number}   - Current wallet balance for display + validation
 *  paymentMethods {Array}    - Active linked bank accounts for the dropdown
 */

function WithdrawFundsDialog({ open, onClose, onSuccess, wallet, walletBalance, paymentMethods }) {
  const { tokenClaims } = useAuth();

  const [step, setStep]                     = useState(STEPS.DETAILS);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amountInput, setAmountInput]       = useState("");
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError]             = useState(null);
  const [submitting, setSubmitting]         = useState(false);

  // Pre-select the first active payment method (Scenario 2)
  useEffect(() => {
    if (paymentMethods.length > 0 && selectedMethodId === "") {
      setSelectedMethodId(paymentMethods[0].paymentMethodId);
    }
  }, [paymentMethods]);

  // Reset all state when the dialog opens fresh
  useEffect(() => {
    if (open) {
      setStep(STEPS.DETAILS);
      setAmountInput("");
      setValidationError(null);
      setApiError(null);
      setSubmitting(false);
      if (paymentMethods.length > 0) setSelectedMethodId(paymentMethods[0].paymentMethodId);
    }
  }, [open]);

  // ── Derived values ────────────────────────────────────────────────────────
  const parsedAmount    = parseFloat(amountInput.replace(/^\$/, "")) || 0;
  const remainingBalance = walletBalance - parsedAmount;
  const selectedMethod  = paymentMethods.find((m) => m.paymentMethodId === selectedMethodId);
  const dailyLimit = wallet?.dailySpendingLimit;
  const perTransactionLimit = wallet?.perTransactionLimit;
  const dailySpentToday = wallet?.dailySpentAmount ?? 0;

  const dailyRemaining =
    dailyLimit == null
      ? null
      : dailyLimit - dailySpentToday;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAmountChange = (e) => {
    setAmountInput(e.target.value);
    setValidationError(validateWithdrawAmount(e.target.value, walletBalance));
  };

  const handleContinue = () => {
    const error = validateWithdrawAmount(amountInput, walletBalance);
    if (error) { setValidationError(error); return; }
    if (!selectedMethodId) { setValidationError("Please select a destination bank account."); return; }
    setApiError(null);
    setStep(STEPS.REVIEW);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const updated = await withdrawFromWallet(Number(tokenClaims.userId), {
        paymentMethodId: selectedMethodId,
        amount: parsedAmount,
      });
      console.log(updated);
      onSuccess(updated);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      // Surface the backend error message inline (Scenarios 7 & 8)
      setApiError(err?.message || "An error occurred. Please try again.");
      setStep(STEPS.DETAILS);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { if (!submitting) onClose(); };

  // ── Render ────────────────────────────────────────────────────────────────

  const sharedProps = { selectedMethod, parsedAmount };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      {STEP_TITLES[step] && (
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em" }}>
          {STEP_TITLES[step]}
        </DialogTitle>
      )}

      {step === STEPS.DETAILS && (
        <WithdrawDetailsStep
          {...sharedProps}
          walletBalance={walletBalance}
          paymentMethods={paymentMethods}
          selectedMethodId={selectedMethodId}
          onSelectMethod={setSelectedMethodId}
          amountInput={amountInput}
          onAmountChange={handleAmountChange}
          validationError={validationError}
          apiError={apiError}
          onCancel={handleClose}
          onContinue={handleContinue}
        />
      )}

      {step === STEPS.REVIEW && (
        <WithdrawReviewStep
          {...sharedProps}
          remainingBalance={remainingBalance}
          dailyLimit={dailyLimit}
          perTransactionLimit={perTransactionLimit}
          dailySpentToday={dailySpentToday}
          dailyRemaining={dailyRemaining}
          submitting={submitting}
          onBack={() => setStep(STEPS.DETAILS)}
          onConfirm={handleConfirm}
        />
      )}

      {step === STEPS.SUCCESS && (
        <WithdrawSuccessStep {...sharedProps} onClose={handleClose} />
      )}
    </Dialog>
  );
}

export default WithdrawFundsDialog;
