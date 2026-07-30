import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import { WarningAmberRounded } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useNewCardRequestOtpVerify } from "@/hooks/OtpHooks/OtpVerify/useNewCardRequestOtpVerify.js";
import { tokens } from "@/style/Theme.jsx";
import { OtpInputField } from "@/components/customComponents/input/OtpInputField.jsx";
import { useRenewCardOtpRequest } from "@/hooks/OtpHooks/OtpRequests/useRenewCardOtpRequest.js";


const Row = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 13.5,
          color: tokens.color.text.secondary,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 900,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};


export const RequestNewCardDialog = ({
  open,
  onClose,
  onSuccess,
}) => {

  const [acknowledged, setAcknowledged] = useState(false);
  const [otp, setOtp] = useState("");
  const [hasPending, setHasPending] = useState(false);

  const theme = useTheme();

  const { tokenClaims } = useAuth();
  const email = tokenClaims?.email;

  // OTP request hook
  const otpRequestObject = useRenewCardOtpRequest();

  // OTP verification hook
  const otpVerifyObject = useNewCardRequestOtpVerify();

  // Whether verification code has already been sent
  const isOtpSent = otpRequestObject.state.isSent;


  const getPayload = () => {
    return {
      "access-code": otp,
      confirmed: acknowledged,
    };
  };


  const handleReset = () => {
    otpRequestObject.handlers.reset();
    otpVerifyObject.handlers.reset();

    setOtp("");
    setAcknowledged(false);
    setHasPending(false);
  };


  const handleClose = () => {
    handleReset();
    onClose();
  };


  const handleCreateRequest = () => {
    otpVerifyObject.handlers
      .sendOtpVerify(getPayload())
      .then(async () => {
        await onSuccess();
        setHasPending(true);
      })
      .catch(console.error);
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: 600,
            borderRadius: 4,
          },
        },
      }}
    >

      {/* ======================================================
          TITLE
          ====================================================== */}

      <DialogTitle
        sx={{
          textAlign: "left",
          fontSize: 28,
          fontWeight: 800,
          px: 4,
          pt: 4,
          pb: 2,
        }}
      >
        {hasPending
          ? "Request Submitted"
          : "Request New Virtual Card"}
      </DialogTitle>


      {/* ======================================================
          STATE 1
          BEFORE OTP HAS BEEN SENT
          ====================================================== */}

      {!hasPending && !isOtpSent && (
        <DialogContent
          sx={{
            px: 4,
            pt: 1,
            pb: 4,
          }}
        >
          <Stack spacing={3}>

            {/* Current card information */}

            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: tokens.color.border.light,
                overflow: "hidden",
              }}
            >
              <Row
                label="Current Card"
                value="Virtual Visa ending •••• 1234"
              />

              <Divider />

              <Row
                label="New Expiration Timeline"
                value="2 years from regeneration"
              />
            </Box>


            {/* Warning */}

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
                Only request a new card if your current virtual card
                details may be compromised.

                <br />
                <br />

                Your current card will be replaced after regeneration.{" "}

                <strong>
                  Email verification is necessary to complete this action.
                </strong>
              </Typography>
            </Box>


            {/* OTP component initially renders only the
                Send Verification Code button */}

            <OtpInputField
              messageFluff="request a new virtual card"
              emailTarget={email}
              otpVerifyObject={otpVerifyObject}
              otpRequestObject={otpRequestObject}
              value={otp}
              onChange={setOtp}
              payload={getPayload()}
            />

          </Stack>
        </DialogContent>
      )}


      {/* ======================================================
          STATE 2
          OTP HAS BEEN SENT
          ====================================================== */}

      {!hasPending && isOtpSent && (
        <DialogContent
          sx={{
            px: 4,
            pt: 1,
            pb: 1,
          }}
        >
          <Stack spacing={2.5}>

            {/* OTP success message + input + resend */}

            <OtpInputField
              messageFluff="request a new virtual card"
              emailTarget={email}
              otpVerifyObject={otpVerifyObject}
              otpRequestObject={otpRequestObject}
              value={otp}
              onChange={setOtp}
              payload={getPayload()}
            />


            {/* Acknowledgement */}

            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <Checkbox
                checked={acknowledged}
                onChange={(e) =>
                  setAcknowledged(e.target.checked)
                }
                sx={{
                  p: 0.5,
                  mt: 0.1,
                }}
                inputProps={{
                  "aria-label":
                    "Acknowledge virtual card replacement",
                }}
              />

              <Typography
                sx={{
                  color: tokens.color.text.primary,
                  lineHeight: 1.5,
                  fontSize: 13,
                }}
              >
                I understand that requesting a new virtual card
                will replace my current card details and reset
                the card expiration timeline.
              </Typography>
            </Stack>

          </Stack>
        </DialogContent>
      )}


      {/* ======================================================
          STATE 2 ACTIONS
          ====================================================== */}

      {!hasPending && isOtpSent && (
        <DialogActions
          sx={{
            display: "flex",
            gap: 2,
            px: 4,
            pt: 2,
            pb: 4,

            "& > :not(style) ~ :not(style)": {
              ml: 0,
            },
          }}
        >

          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
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
            disabled={
              !acknowledged ||
              otp.length !== 7
            }
            onClick={handleCreateRequest}
            sx={{
              minHeight: 52,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Create Request
          </Button>

        </DialogActions>
      )}


      {/* ======================================================
          STATE 3
          REQUEST SUCCESSFULLY SUBMITTED
          ====================================================== */}

      {hasPending && (
        <>
          <DialogContent
            sx={{
              px: 4,
              pt: 1,
              pb: 2,
            }}
          >
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                textAlign: "center",
                py: 2,
              }}
            >

              {/* Success icon */}

              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  backgroundColor:
                    tokens.color.status.successBg,
                  color:
                    tokens.color.status.success,
                  borderColor:
                    tokens.color.status.successBorder,
                  border: "1px solid",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 34,
                }}
              >
                ✓
              </Box>


              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                New Virtual Card Requested
              </Typography>


              {/* Replacement policy */}

              <Box
                sx={{
                  width: "100%",
                  p: 2,
                  boxSizing: "border-box",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    mb: 0.5,
                  }}
                >
                  Card replacement policy
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                  }}
                >
                  Your request has been submitted and is now
                  pending approval. Once approved, your replacement
                  SmartPay virtual card uses new card details.

                  <br />
                  <br />

                  The new card&apos;s{" "}
                  <strong>expiration</strong> will be{" "}
                  <strong>
                    2 years from the time of regeneration
                  </strong>.
                </Typography>
              </Box>

            </Stack>
          </DialogContent>


          <DialogActions
            sx={{
              px: 4,
              pb: 4,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                minHeight: 52,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Return To Wallet
            </Button>
          </DialogActions>
        </>
      )}

    </Dialog>
  );
};