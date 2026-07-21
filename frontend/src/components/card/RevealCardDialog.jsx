import {useState, useEffect} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Box, CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {OtpInputField} from "@/components/customComponents/input/OtpInputField.jsx";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import {useCardRevealOtpRequest} from "@/hooks/OtpHooks/OtpRequests/useCardRevealOtpRequest.js";

/**
 * OTP verification dialog for revealing card details.
 *
 * Responsibilities (SRP):
 *  - Request an OTP email when the dialog opens.
 *  - Accept the 7-digit code and verify it against the backend.
 *  - Call onSuccess() when verification passes so the parent can reveal the card.
 *
 * @param {boolean}  open      - Controlled open state
 * @param {string}   email     - User's email address (used to send and verify OTP)
 * @param {function} onSuccess - Called on successful OTP verification
 * @param {function} onClose   - Called when the dialog should close
 */
export function RevealCardDialog({open, email, onSuccess, onClose}) {

  const payload = {email: email, type: "reveal-card"};


  const [code, setCode] = useState("");

  const {
    handleResend: handleRevealOtpResend,
    handleOtpRequest: handleMakeRevealOtpRequest,
    requesting: cardRevealOtpRequesting,
    error: otpRequestError,
    timeLeft: countdownTimeLeft,
    isSent: revealOtpIsSent,
    reset: resetRevealOtpState
  } = useCardRevealOtpRequest();


  // Hook for handling OTP Verify
  const {
    loading: otpVerifyIsLoading,
    sendOtpVerify,
    error: otpError,
    reset: resetOtpVerifyStates,
  } = useOtpVerify();


  const handleClose = () => {
    setCode("");
    resetOtpVerifyStates();
    resetRevealOtpState();
    onClose();
  };

  // Send OTP as soon as the dialog opens
  useEffect(() => {
    if (!open || !email) return;

    const temp = async () => {

      await handleMakeRevealOtpRequest(payload);
    }

    temp().catch(console.error);

  }, [open]);


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1, pb: 1}}>
        <LockOutlinedIcon fontSize="small" color="primary" />
        Verify Your Identity
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          <Typography
            align="left"
            sx={{fontSize: 13.5, lineHeight: 1.5}}>
            This action will briefly display sensitive card detail information.
          </Typography>

          {otpRequestError && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {otpRequestError}
            </Alert>
          )}

          <OtpInputField
            messageFluff={"view your card details"}
            emailTarget={email}
            isSent={revealOtpIsSent}
            isRequesting={cardRevealOtpRequesting}
            otpErrorMessage={otpError}
            isVerifying={otpVerifyIsLoading}
            value={code}
            onChange={setCode}
            timeLeft={countdownTimeLeft}
            handleResend={handleRevealOtpResend}
          />

        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={otpVerifyIsLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={otpVerifyIsLoading || code.length !== 7}
          onClick={()=>{sendOtpVerify({
              "email": email,
              "code": code,
              "type": "reveal-card",
            }
          ) .then(r => {
            resetOtpVerifyStates();
            onSuccess();
            onClose();
          })}}>
          {otpVerifyIsLoading ? "Verifying..." : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
