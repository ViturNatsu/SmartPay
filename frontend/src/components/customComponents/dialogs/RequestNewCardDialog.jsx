import {
  Alert,
  Box,
  Button,
  Checkbox, CircularProgress, colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import Divider from "@mui/material/Divider";
import {WarningAmberRounded} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import {useState} from "react";
import {useAuth} from "@/context/AuthContext.jsx";
import {useNewCardRequestOtpVerify} from "@/hooks/OtpHooks/OtpVerify/useNewCardRequestOtpVerify.js";
import { tokens } from "@/style/Theme.jsx";
import {OtpInputField} from "@/components/customComponents/input/OtpInputField.jsx";
import {useRenewCardOtpRequest} from "@/hooks/OtpHooks/OtpRequests/useRenewCardOtpRequest.js";


const Row = ({label, value}) => {
  return (
      <Box sx={{display: "flex", justifyContent: "space-between", gap: 2, px: 2, py: 1.5}}>
        <Typography sx={{fontSize: 13.5, color: tokens.color.text.secondary, fontWeight: 700}}>{label}</Typography>
        <Typography sx={{fontSize: 13.5, fontWeight: 900, textAlign: "right"}}>{value}</Typography>
      </Box>
    );
}

export const RequestNewCardDialog = ({open, onClose, onSuccess}) => {

  const [acknowledged, setAcknowledged] = useState(false);
  const theme = useTheme();
  const { tokenClaims, loading: authLoading } = useAuth();
  const email = tokenClaims?.email;
  const [otp, setOtp] = useState("");
  const [hasPending, setHasPending] = useState(false);

  const {
    handleResend,
    handleOtpRequest,
    requesting: cardRequestIsRequesting ,
    error: cardRequestError,
    timeLeft: cardRequestTimeLeft,
    isSent: cardRequestIsSent,
    reset: cardRequestReset,
  } = useRenewCardOtpRequest()

  const {
    sendOtpVerify,
    loading: otpVerifying,
    error: otpVerifyError,
    reset: ResetOtpVerifyState,
  } = useNewCardRequestOtpVerify()

  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: 700,
            maxWidth: '90vw',
          },
        },
      }}>
      <DialogTitle sx={{ textAlign: "left" }}>
        {"Request New Virtual Card"}
      </DialogTitle>

      {!hasPending &&
        <DialogContent>
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
            {/*left side*/}
            <Stack
              flex={1}
              spacing={2}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  overflow: "hidden"
                }}
              >
                <Row label="Current Card" value={`Virtual Visa ending •••• 1234`} />
                <Divider />
                <Row label="New Expiration Timeline" value="2 years from regeneration" />
              </Box>

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
                  Only request a new card if your current virtual card details may be compromised. Your current card will
                  be replaced after regeneration. <strong>Email verification is necessary to complete this action</strong>.
                </Typography>
              </Box>
            </Stack>
            {/*right side*/}
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
                {!cardRequestIsSent && !cardRequestError && !cardRequestIsRequesting && (
                  <Button
                    variant="contained"
                    onClick={()=>{handleOtpRequest().then(r =>{
                        console.log(r);
                      }
                    );}}
                    disabled={cardRequestIsRequesting || authLoading || !email}
                  >
                    {cardRequestIsRequesting ? "Sending OTP..." : "Send Verification Code"}
                  </Button>
                )}

                {cardRequestError &&
                  <Alert severity="error">
                    {cardRequestError}
                  </Alert>
                }

              </Box>

              <OtpInputField
                messageFluff="request a new virtual card"
                emailTarget={email}
                otpErrorMessage={otpVerifyError}
                isSent={cardRequestIsSent}
                isRequesting={cardRequestIsRequesting}
                isVerifying={otpVerifying}
                value={otp}
                onChange={setOtp}
                timeLeft={cardRequestTimeLeft}
                handleResend={handleResend}
              />

              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
              >
                <Checkbox
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  sx={{
                    p: 0.5,
                    mt: 0.1,
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: tokens.color.text.primary,
                    lineHeight: 1.5,
                    fontSize: 12,
                  }}
                >
                  I understand that requesting a new virtual card will replace my
                  current card details and reset the card expiration timeline.
                </Typography>
              </Stack>
            </Stack>
          </Stack>

        </DialogContent>

      }

      {hasPending &&
        <DialogContent>
          <Stack spacing={1.25} alignItems="center" sx={{textAlign: "center", py: 3}}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: tokens.color.status.successBg,
                color: tokens.color.status.success,
                borderColor: tokens.color.status.successBorder,
                border: "1px solid",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 34,
                mb: 1,
              }}
            >
              ✓
            </Box>
            <Typography sx={{fontSize: 22, fontWeight: 900}}>New Virtual Card Requested</Typography>

            <Box
              sx={{
                p: 2,
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
                  mb: 0.5
                }}
              >
                Card replacement policy
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  lineHeight: 1.5
                }}
              >
                Your request has been submitted and is now pending approval. Once approved, your replacement SmartPay virtual card uses new card details.
                <br></br>
                <br></br>
                The new card's <strong>expiration</strong> will be <strong>2 years from the time of regeneration</strong>.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      }

      { !hasPending &&
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            >
            Cancel
          </Button>
          <Button
            loading={otpVerifying}
            disabled={!cardRequestIsSent || !acknowledged || otp.length < 7}
            onClick={
            ()=>{
              sendOtpVerify({"access-code": otp, "confirmed": acknowledged,}).then(async (r) => {
                await onSuccess();
                setHasPending(true);
              })
            }}
            variant="contained"
          >
          Create Request
          </Button>
        </DialogActions>
      }

      {hasPending &&
        <DialogActions sx={{px: 3, pb: 3}}>
          <Button
            variant="contained"
            onClick={onClose}
          >
            Return To Wallet
          </Button>
        </DialogActions>
      }
    </Dialog>
  );

}