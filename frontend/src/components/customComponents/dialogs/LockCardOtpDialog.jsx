import {
  Alert,
  Box,
  Button, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Snackbar,
  Typography,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import { forwardRef, useEffect, useState } from "react";
import { useCardLockRequestData } from "@/hooks/useCardLockRequest.js";
import { useAuth } from "@/context/AuthContext.jsx";
import Slide from "@mui/material/Slide";
import {useOtpVerify} from "@/hooks/useOtpVerify.js";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const isActive = (cardStatus) => {
  return (cardStatus === "ACTIVE");
}

export const LockCardOtpDialog = ({ cardStatus ,open, onClose, onSuccess}) => {
  // Auth
  const { tokenClaims, loading: authLoading } = useAuth();
  const email = tokenClaims?.email;

  // Hook for handling Lock requests
  const {
    handleSendOtp,
    handleResend,
    timeLeft: cardLockResendTimeLeft,
    isSent: cardLockIsSent,
    loading: cardLockRequestIsLoading,
    error: cardLockRequestError,
    reset: cardLockRequestReset,
  } = useCardLockRequestData(email);

  // Hook for handling OTP Verify
  const {
    loading: otpVerifyIsLoading,
    sendOtpVerify,
    error: otpError,
    reset: otpStatesReset,
  } = useOtpVerify();

  // State for tracking input
  const [otp, setOtp] = useState("");

  // Payload formats
  const lockPayload = {"email": tokenClaims?.email, "type": "CARD_LOCK"};
  const unlockPayload = {
    ...lockPayload,
    type: "CARD_UNLOCK",
  };

  const handleReset = () => {
    cardLockRequestReset();
    otpStatesReset();
    setOtp("");
  }

  return (
    <>
      <Dialog
        // slots={{ transition: Transition }}
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          {isActive(cardStatus) ? "Lock Card" : "Unlock Card"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isActive(cardStatus) ?
                "This action will lock the card. A locked card cannot be used until it is unlocked again."
                : "This action will unlock the card. Unlocked cards are active, and may be used until it is locked or expired." }
            </Typography>

            {cardLockRequestError && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {cardLockRequestError}
              </Alert>
            )}



            {/* STEP 1 */}
            {!cardLockIsSent && !cardLockRequestError && (
              <Button
                variant="contained"
                onClick={()=>{
                  isActive(cardStatus) ?
                  handleSendOtp(lockPayload).catch(console.error) :
                  handleSendOtp(unlockPayload).catch(console.error)
                }}
                disabled={cardLockRequestIsLoading || authLoading || !email}
              >
                {cardLockRequestIsLoading ? "Sending OTP..." : "Send verification code"}
              </Button>
            )}
            {cardLockIsSent && cardLockRequestIsLoading && <CircularProgress></CircularProgress>}

            {/* STEP 2 */}
            {cardLockIsSent && !cardLockRequestIsLoading && (
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                <Alert severity="success">
                  Code sent to <strong>{email}</strong>
                </Alert>

                {otpError && !otpVerifyIsLoading && (
                  <Alert severity="error">
                    {otpError}
                  </Alert>
                )}

                <Typography variant="body2" color="text.secondary">
                  Enter the 7-digit code below
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <MuiOtpInput
                    value={otp}
                    onChange={setOtp}
                    length={7}
                    sx={{
                      gap: 1,
                      "& .MuiInputBase-root": {
                        width: 40,
                        height: 44,
                        fontSize: 14,
                      },
                    }}
                  />
                </Box>

                {/* RESEND SECTION */}
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                  Didn’t receive the code?{" "}
                  <Box
                    component="span"
                    onClick={cardLockResendTimeLeft > 0 || cardLockRequestIsLoading ? undefined : handleResend}
                    sx={{
                      color: cardLockResendTimeLeft > 0 || cardLockRequestIsLoading ? "text.disabled" : "primary.main",
                      cursor: cardLockResendTimeLeft > 0 || cardLockRequestIsLoading ? "not-allowed" : "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {cardLockResendTimeLeft > 0 ? `Resend in ${cardLockResendTimeLeft}s` : "Resend code"}
                  </Box>
                </Typography>
              </Box>
            )}

          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>

          <Button
            loading={otpVerifyIsLoading}
            variant="contained"
            disabled={!cardLockIsSent || otp.length < 7}
            onClick={()=>{sendOtpVerify({
                "email": tokenClaims?.email,
                "code": otp,
                "type": isActive(cardStatus) ? "CARD_LOCK" : "CARD_UNLOCK",
              }
            ) .then(r => {
              if(isActive(cardStatus)){
                onSuccess("Card Locked Successfully")
              }
              else{
                onSuccess("Card Unlocked Successfully")
              }
              handleReset();
              onClose();
            })}}>
            {isActive(cardStatus) ? ("Confirm Lock") : "Confirm Unlock"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};