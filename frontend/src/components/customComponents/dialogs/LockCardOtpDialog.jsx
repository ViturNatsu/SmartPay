import {
  Box,
  Button, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { forwardRef, useState } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import Slide from "@mui/material/Slide";
import { useOtpVerify } from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import { OtpInputField } from "@/components/customComponents/input/OtpInputField.jsx";
import { WarningAmberRounded } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useCardLockOtpRequest } from "@/hooks/OtpHooks/OtpRequests/useCardLockOtpRequest.js";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const isActive = (cardStatus) => {
  return cardStatus === "ACTIVE";
};

export const LockCardOtpDialog = ({
  cardStatus,
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  // Auth
  const { tokenClaims } = useAuth();
  const email = tokenClaims?.email;

  // Hook for handling Lock/Unlock OTP requests
  const cardLockRequestObject = useCardLockOtpRequest();

  // Hook for handling OTP verification
  const otpVerifyObject = useOtpVerify();

  // OTP input state
  const [otp, setOtp] = useState("");

  // Whether the verification code has been sent
  const isOtpSent = cardLockRequestObject.state.isSent;

  // Payload formats
  const lockPayload = {
    email: tokenClaims?.email,
    type: "CARD_LOCK",
  };

  const unlockPayload = {
    ...lockPayload,
    type: "CARD_UNLOCK",
  };

  const getPayload = () => (isActive(cardStatus) ? lockPayload : unlockPayload);

  const handleReset = () => {
    cardLockRequestObject.handlers.reset();
    otpVerifyObject.handlers.reset();
    setOtp("");
  };

  const handleConfirm = () => {
    otpVerifyObject.handlers
      .sendOtpVerify({
        email: tokenClaims?.email,
        code: otp,
        type: isActive(cardStatus)
          ? "CARD_LOCK"
          : "CARD_UNLOCK",
      })
      .then(() => {
        if (isActive(cardStatus)) {
          onSuccess("Card Locked Successfully");
        } else {
          onSuccess("Card Unlocked Successfully");
        }

        handleReset();
        onClose();
      })
      .catch(console.error);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: 600,
            borderRadius: 4,
          },
        },
        transition: {
          onExited: handleReset,
        },
      }}
    >


      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pt: 4,
          px: 4,
          pb: 1
      }}
      >
        <LockOutlinedIcon fontSize="small" color="primary" />
        {isActive(cardStatus)
          ? "Lock Virtual Card"
          : "Unlock Virtual Card"}
      </DialogTitle>

      <DialogContent
        sx={{
          px: 8,
          pb: 0,
        }}
      >

        <Stack spacing={3}>
          {/* Description */}

          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "text.primary",
            }}
          >
            {isActive(cardStatus)
              ? "This action will lock the card. A locked card cannot be used until it is unlocked again."
              : "This action will unlock the card. Unlocked cards are active, and may be used until they are locked or expired."}
          </Typography>

          {/* Warning */}

          {!isOtpSent && (

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
                backgroundColor: theme.palette.warning.light,
              }}
            >
              <WarningAmberRounded
                sx={{
                  mt: 0.2,
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                The Card Lock and Card Unlock features are unavailable
                when there is a pending request for a card renewal.

                <br />
                <br />

                The Virtual Card is automatically locked when creating
                a request for a card renewal.
              </Typography>
            </Box>
          )}

          <OtpInputField
            messageFluff={
              isActive(cardStatus)
                ? "lock your card"
                : "unlock your card"
            }
            emailTarget={email}
            otpRequestObject={cardLockRequestObject}
            otpVerifyObject={otpVerifyObject}
            value={otp}
            onChange={setOtp}
            payload={getPayload()}
          />
        </Stack>


      </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            pb: 4,
            position: "sticky",
          }}
        >

        {!isOtpSent && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              cardLockRequestObject.handlers
                .handleOtpRequest(getPayload())
                .catch(console.error);
            }}
            disabled={
              cardLockRequestObject.state.isRequesting ||
              cardLockRequestObject.state.error
            }
            sx={{
              minHeight: 52,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {cardLockRequestObject.state.isRequesting ? (
              <CircularProgress
                size={24}
                thickness={5}
                sx={{ color: "inherit" }}
              />
            ) : (
              "Send Verification Code"
            )}
          </Button>
        )}

        {isOtpSent && (
          <>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={otpVerifyObject.state.isVerifying}
              sx={{
                minHeight: 52,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              loading={otpVerifyObject.state.isVerifying}
              variant="contained"
              disabled={otp.length !== 7}
              onClick={handleConfirm}
              sx={{
                minHeight: 52,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {isActive(cardStatus)
                ? "Confirm Lock"
                : "Confirm Unlock"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};