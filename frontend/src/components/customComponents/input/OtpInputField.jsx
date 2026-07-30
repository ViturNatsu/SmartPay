import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

export const OtpInputField = ({
  otpRequestObject,
  otpVerifyObject,
  messageFluff,
  emailTarget,
  value,
  onChange,
  payload,
}) => {
  const hasTimeLeft = () => {
    return otpRequestObject.state.timeLeft > 0;
  };

  const handleOtpChange = (event) => {
    // Only allow numbers and limit the code to 7 digits
    const numericValue = event.target.value
      .replace(/\D/g, "")
      .slice(0, 7);

    onChange(numericValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {!otpRequestObject.state.isSent && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Request error */}
          {otpRequestObject.state.error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              Request Error: {otpRequestObject.state.error}
            </Alert>
          )}

          {/* Send verification button */}
          {!otpRequestObject.state.error &&
            !otpRequestObject.state.isRequesting && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  otpRequestObject.handlers
                    .handleOtpRequest(payload)
                    .catch(console.error);
                }}
                disabled={!emailTarget}
                sx={{
                  minHeight: 52,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                Send Verification Code
              </Button>
            )}

          {/* Loading state */}
          {otpRequestObject.state.isRequesting && (
            <Box
              sx={{
                minHeight: 52,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}
        </Box>
      )}


      {otpRequestObject.state.isSent && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Success message */}
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              alignItems: "flex-start",

              "& .MuiAlert-icon": {
                mt: 0.25,
              },

              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              A 7-digit code has been sent to{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                }}
              >
                {emailTarget}
              </Box>
              .
              <Box
                component="span"
                sx={{
                  display: "block",
                  mt: 0.5,
                }}
              >
                Enter it below to {messageFluff}.
              </Box>
            </Typography>
          </Alert>

          {/* Verification error */}
          {otpVerifyObject.state.error &&
            !otpVerifyObject.state.isVerifying && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                Verification Error: {otpVerifyObject.state.error}
              </Alert>
            )}

          {/* OTP label */}
          <Typography
            component="label"
            htmlFor="otp-code"
            textAlign="left"
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            Enter the 7-digit code below
          </Typography>

          {/* OTP input */}
          <TextField
            id="otp-code"
            fullWidth
            placeholder="Enter Code"
            value={value}
            onChange={handleOtpChange}
            slotProps={{
              htmlInput: {
                maxLength: 7,
                inputMode: "numeric",
                pattern: "[0-9]*",
                autoComplete: "one-time-code",
                "aria-label": "7-digit verification code",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 56,
                borderRadius: 2,
              },

              "& input": {
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.25rem",
              },

              "& input::placeholder": {
                fontSize: "1rem",
                letterSpacing: "normal",
                fontWeight: 400,
              },
            }}
          />

          {/* Resend */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{
              mt: 1,
            }}

          >
            Didn&apos;t receive a code?{" "}

            <Box
              component="span"
              onClick={
                hasTimeLeft()
                  ? undefined
                  : otpRequestObject.handlers.handleResend
              }
              sx={{
                color: hasTimeLeft()
                  ? "text.disabled"
                  : "primary.main",

                cursor: hasTimeLeft()
                  ? "default"
                  : "pointer",

                fontWeight: 600,
              }}
            >
              {hasTimeLeft()
                ? `Resend in ${otpRequestObject.state.timeLeft}s`
                : "Resend code"}
            </Box>
          </Typography>
        </Box>
      )}
    </Box>
  );
};