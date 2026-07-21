import {
  Alert,
  Box,
  Button, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Snackbar, Stack,
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
        slotProps={{
          paper: {
            sx: {
              width: 700,
              maxWidth: '90vw',
            },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "left" }}>
          {isActive(cardStatus) ? "Lock Virtual Card" : "Unlock Virtual Card"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            divider={
              <Divider
                orientation="vertical"
                flexItem
              />
            }
          >
            <Stack
              flex={1}
              spacing={2}
            >
              <Typography
                align="left"
                sx={{fontSize: 13.5, lineHeight: 1.5}}>
                {isActive(cardStatus) ?
                  "This action will lock the card. A locked card cannot be used until it is unlocked again."
                  : "This action will unlock the card. Unlocked cards are active, and may be used until it is locked or expired." }
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.25,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: theme.palette.warning.main,
                  color: theme.palette.warning.main,
                  backgroundColor: theme.palette.warning.light,
                }}
              >
                <WarningAmberRounded sx={{mt: 0.2}} />
                <Typography sx={{fontSize: 13.5, lineHeight: 1.5}}>
                  The Card Lock and Card Unlock features are unavailable when there is a pending request for a card renewal.
                  <br/>
                  <br/>
                  The Virtual Card is automatically locked when creating a request for a card renewal.
                </Typography>
              </Box>
            </Stack>
            <Stack
              flex={1}
              spacing={2}
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >

                {cardLockRequestError && (
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {cardLockRequestError}
                  </Alert>
                )}

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
              </Box>

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
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>

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