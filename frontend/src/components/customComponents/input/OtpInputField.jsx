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
      paddingY={1}

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

          {/* Request error */}
          {otpVerifyObject.state.error && (
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
        </Box>
      )}


      {otpRequestObject.state.isSent && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              mb: 3,
              minHeight: 88,
              display: "flex",
              alignItems: "center",
            }}
          >
            {otpRequestObject.state.isRequesting && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}

            {!otpRequestObject.state.isRequesting && !otpVerifyObject.state.error && !otpRequestObject.state.error && (
              <Alert
                severity="success"
                sx={{
                  width: "100%",
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
                  }}
                >
                  A 7-digit code has been sent to{" "}
                  <Box component="span" sx={{ fontWeight: 800 }}>
                    {emailTarget}
                  </Box>
                  .
                  <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                    Enter it below to {messageFluff}.
                  </Box>
                </Typography>
              </Alert>
            )}

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

            {/* Verification error */}
            {otpVerifyObject.state.error && !otpRequestObject.state.error &&
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
          </Box>


          {/* OTP label */}
          <Typography
            component="label"
            htmlFor="otp-code"
            textAlign="left"
            sx={{
              fontSize: 15,
              fontWeight: 550,
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
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.5rem",
                fontFamily: "monospace",
              },

              "& input::placeholder": {
                fontSize: "1rem",
                letterSpacing: "0.125rem",
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