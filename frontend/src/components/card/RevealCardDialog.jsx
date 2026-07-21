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

  const cardRevealRequestObject = useCardRevealOtpRequest();

  // Hook for handling OTP Verify
  const otpVerifyObject = useOtpVerify();

  const handleClose = () => {
    setCode("");
    otpVerifyObject.handlers.reset();
    cardRevealRequestObject.handlers.reset();
    onClose();
  };

  const getPayload = () => {
    return {
      "email": email,
      "code": code,
      "type": "reveal-card",
    }
  }

  // Send OTP as soon as the dialog opens
  useEffect(() => {
    if (!open || !email) return;

    const temp = async () => {
      await cardRevealRequestObject.handlers.handleOtpRequest(payload);
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

          <OtpInputField
            messageFluff={"view your card details"}
            emailTarget={email}
            otpRequestObject={cardRevealRequestObject}
            otpVerifyObject={otpVerifyObject}
            value={code}
            onChange={setCode}
            payload={getPayload()}
          />

        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={handleClose} disabled={otpVerifyObject.state.isVerifying}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={otpVerifyObject.state.isVerifying || code.length !== 7}
          onClick={()=>{
            otpVerifyObject.handlers.sendOtpVerify(getPayload()).then(r => {
            otpVerifyObject.handlers.reset();
            onSuccess();
            onClose();
          })}}
        >
          {otpVerifyObject.state.isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
