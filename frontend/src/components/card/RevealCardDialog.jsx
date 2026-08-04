import {useState, useEffect, useCallback} from "react";
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
  Box, CircularProgress, Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {OtpInputField} from "@/components/customComponents/input/OtpInputField.jsx";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import {useCardRevealOtpRequest} from "@/hooks/OtpHooks/OtpRequests/useCardRevealOtpRequest.js";
import {WarningAmberRounded} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

  const theme = useTheme();


  const [code, setCode] = useState("");

  const cardRevealRequestObject = useCardRevealOtpRequest();

  // Hook for handling OTP Verify
  const otpVerifyObject = useOtpVerify();

  const handleReset = () => {
    setCode("");
    otpVerifyObject.handlers.reset();
    cardRevealRequestObject.handlers.reset();
  }

  // optimization
  const getPayload = useCallback(() => ({
    email,
    code,
    type: "reveal-card",
  }), [email, code]);

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
            borderRadius: 4,
          },
        },
        transition: {
          onExited: handleReset,
        },
      }}
    >
      <DialogTitle
        sx={{display: "flex", alignItems: "center", gap: 1, pb: 1}}>
        <VisibilityIcon fontSize="small" color="primary" />
        Verify Your Identity
      </DialogTitle>

      <DialogContent
        sx={{
          px: 6,
          pb: 0,
        }}
      >

        <Stack
          spacing={3}
        >
          <Typography
            align="left"
          >
            This action will briefly display sensitive card detail information.
          </Typography>

          {!cardRevealRequestObject.state.isSent &&
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
                The Card Reveal functionality will allow you to see your active card details.

                <br />
                <br />

                Ensure that only you are able to see your active card details.
              </Typography>
            </Box>}


          <OtpInputField
            messageFluff={"view your card details"}
            emailTarget={email}
            otpRequestObject={cardRevealRequestObject}
            otpVerifyObject={otpVerifyObject}
            value={code}
            onChange={setCode}
            payload={getPayload()}
          />

        </Stack>
      </DialogContent>

      {!cardRevealRequestObject.state.isSent &&
        <DialogActions
          sx={{
            px: 4,
            pb: 4,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              cardRevealRequestObject.handlers
                .handleOtpRequest(getPayload())
                .catch(console.error);
            }}
            disabled={
              cardRevealRequestObject.state.isRequesting ||
              cardRevealRequestObject.state.error
            }
            sx={{
              minHeight: 52,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {cardRevealRequestObject.state.isRequesting ? (
              <CircularProgress
                size={24}
                thickness={5}
                sx={{ color: "inherit" }}
              />
            ) : (
              "Send Verification Code"
            )}
          </Button>

        </DialogActions>
      }

      {cardRevealRequestObject.state.isSent &&
        <DialogActions
          sx={{
            px: 4,
            pb: 4,
          }}
        >
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
            variant="contained"
            disabled={otpVerifyObject.state.isVerifying || code.length !== 7}
            onClick={()=>{
              otpVerifyObject.handlers.sendOtpVerify(getPayload()).then(r => {
                otpVerifyObject.handlers.reset();
                onSuccess();
                onClose();
              })}}
            sx={{
              minHeight: 52,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {otpVerifyObject.state.isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogActions>
      }
    </Dialog>
  );
}
