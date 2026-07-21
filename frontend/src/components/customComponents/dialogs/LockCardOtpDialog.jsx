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
import { useAuth } from "@/context/AuthContext.jsx";
import Slide from "@mui/material/Slide";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import {OtpInputField} from "@/components/customComponents/input/OtpInputField.jsx";
import Divider from "@mui/material/Divider";
import {WarningAmberRounded} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import {useCardLockOtpRequest} from "@/hooks/OtpHooks/OtpRequests/useCardLockOtpRequest.js";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const isActive = (cardStatus) => {
  return (cardStatus === "ACTIVE");
}

export const LockCardOtpDialog = ({ cardStatus ,open, onClose, onSuccess}) => {
  // Auth
  const theme = useTheme();
  const { tokenClaims, loading: authLoading } = useAuth();
  const email = tokenClaims?.email;

  // Hook for handling Lock requests
  const {
    handleOtpRequest,
    handleResend,
    timeLeft: cardLockResendTimeLeft,
    isSent: cardLockIsSent,
    requesting: cardLockRequesting,
    error: cardLockRequestError,
    reset: cardLockRequestReset,
  } = useCardLockOtpRequest();

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
        <DialogTitle sx={{ textAlign: "left" }}>
          {isActive(cardStatus) ? "Lock Virtual Card" : "Unlock Virtual Card"}
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
            <Typography
              align="left"
              sx={{fontSize: 13.5, lineHeight: 1.5}}>
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
            {!cardLockIsSent && !cardLockRequestError && !cardLockRequesting  && (
              <Button
                variant="contained"
                onClick={()=>{
                  isActive(cardStatus) ?
                    handleOtpRequest(lockPayload).catch(console.error) :
                    handleOtpRequest(unlockPayload).catch(console.error)
                }}
                disabled={cardLockRequesting || authLoading || !email}
              >
                {"Send Verification Code"}
              </Button>
            )}

            {/* STEP 2 */}
            <OtpInputField
              messageFluff={isActive(cardStatus) ?
                "lock your card"
                : "unlock your card" }
              emailTarget={email}
              isSent={cardLockIsSent}
              isRequesting={cardLockRequesting}
              otpErrorMessage={otpError}
              isVerifying={otpVerifyIsLoading}
              value={otp}
              onChange={setOtp}
              timeLeft={cardLockResendTimeLeft}
              handleResend={handleResend}
            ></OtpInputField>

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