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
import {useNewCardRequest} from "@/hooks/useNewCardRequest.js";
import {useAuth} from "@/context/AuthContext.jsx";
import {MuiOtpInput} from "mui-one-time-password-input";
import {useNewCardRequestOtpVerify} from "@/hooks/useNewCardRequestOtpVerify.js";
import { tokens } from "@/style/Theme.jsx";


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
    handleSendOtp,
    loading: cardRequestIsLoading,
    error: cardRequestError,
    timeLeft: cardRequestTimeLeft,
    isSent: cardRequestIsSent,
    reset: cardRequestReset,
  } = useNewCardRequest()

  const {
    verifyNewCardRequestOtp,
    loading: OtpVerifying,
    error: OtpVerifyError,
    reset: ResetOtpVerifyState,
  } = useNewCardRequestOtpVerify()

  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: 500,
            maxWidth: '90vw',
          },
        },
      }}>
      <DialogTitle sx={{ textAlign: "left" }}>
        {"Request New Virtual Card"}
      </DialogTitle>

      {!hasPending &&
        <DialogContent>
          <Stack spacing={2}>

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

            { !cardRequestIsSent && <Box
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
            </Box>}

            {/* STEP 1 */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              {!cardRequestIsSent && !cardRequestError && (
                <Button
                  variant="contained"
                  onClick={()=>{handleSendOtp().then(r =>{
                      console.log(r);
                    }
                  );}}
                  disabled={cardRequestIsLoading || authLoading || !email}
                >
                  {cardRequestIsLoading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              )}
              {cardRequestIsSent && cardRequestIsLoading && <CircularProgress></CircularProgress>}

              {cardRequestError &&
                <Alert severity="error">
                  {cardRequestError}
                </Alert>
              }

            </Box>

            {/* STEP 2 */}
            {cardRequestIsSent && !cardRequestIsLoading && (
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                <Alert severity="success">
                  Code sent to <strong>{email}</strong>
                </Alert>

                {OtpVerifyError && !OtpVerifying && (
                  <Alert severity="error">
                    {OtpVerifyError}
                  </Alert>
                )}

                <Typography variant="body2" color="text.secondary"
                            sx={{
                              paddingX: "4px",
                            }}>
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
                    onClick={cardRequestTimeLeft > 0 || cardRequestIsLoading ? undefined : handleResend}
                    sx={{
                      color: cardRequestTimeLeft > 0 || cardRequestIsLoading ? "text.disabled" : "primary.main",
                      cursor: cardRequestTimeLeft > 0 || cardRequestIsLoading ? "not-allowed" : "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {cardRequestTimeLeft > 0 ? `Resend in ${cardRequestTimeLeft}s` : "Resend code"}
                  </Box>
                </Typography>
                <Box sx={{display: "flex", gap: 1.25, alignItems: "flex-start"}}>

                  <Checkbox
                    checked={acknowledged}
                    onChange={e => setAcknowledged(e.target.checked)} sx={{p: 0.5, mt: 0.2}} />
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: tokens.color.text.secondary,
                      lineHeight: 1.5}}
                  >
                    I understand that requesting a new virtual card will replace my current card details and reset the card
                    expiration timeline.
                  </Typography>
                </Box>
              </Box>

            )}



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
        <DialogActions sx={{px: 3, pb: 3}}>
          <Button
            onClick={onClose}
            variant="outlined"
            >
            Cancel
          </Button>
          <Button
            loading={OtpVerifying}
            disabled={!acknowledged || otp.length < 7}
            onClick={
            ()=>{
              verifyNewCardRequestOtp(otp, acknowledged).then(async (r) => {
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