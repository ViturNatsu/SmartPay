import {Alert, Box, Button, CircularProgress, Link, TextField, Typography} from "@mui/material";
import {MuiOtpInput} from "mui-one-time-password-input";
import CheckIcon from "@mui/icons-material/Check";
import {useState} from "react";

export const OtpInputField = (
  {
    otpRequestObject,
    otpVerifyObject,
    messageFluff,
    emailTarget,
    value,
    onChange,
    payload
  }) => {

  const hasTimeLeft = () => {
    return otpRequestObject.state.timeLeft > 0;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        // border: "1px solid",
        paddingX: "2rem",
        boxSizing: "border-box",
        borderRadius: 2
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={120}
        height="100%"
        // border="1px solid"
      >

        {otpRequestObject.state.error && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {otpRequestObject.state.error}
          </Alert>
        )}

        {!otpRequestObject.state.isSent && !otpRequestObject.state.error && !otpRequestObject.state.isRequesting  && (
          <Button
            variant="contained"
            onClick={()=>{
                otpRequestObject.handlers.handleOtpRequest(payload).catch(console.error);
            }}
            disabled={otpRequestObject.state.isRequesting || !emailTarget}
          >
            {"Send Verification Code"}
          </Button>
        )}

        {
          !otpRequestObject.state.isRequesting
          && otpRequestObject.state.isSent &&
          <Alert
            severity="success"
            sx={{
              "& .MuiAlert-icon": {
                alignItems: "center",
              },
              "& .MuiAlert-message": {
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <Typography
              variant="caption"
              align="left"
              fontSize="small"
              color="success"
            >
              A 7-digit code has been sent to{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold" }}
              >
                {emailTarget}
              </Box>
              .
              <Box
                component="span"
                sx={{
                  display: "block",
                  marginTop: 1,
                }}
              >
                Enter it below to {messageFluff}.
              </Box>
            </Typography>
          </Alert>
        }

        {otpRequestObject.state.isRequesting &&
          <Box
            sx={{
              justifyContent: "center",
              textAlign: "center",
            }}>
            <CircularProgress
            />
          </Box>
        }

        {otpVerifyObject.state.error && !otpVerifyObject.state.isVerifying && (
          <Alert
            severity="error"
            sx={{
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {otpVerifyObject.state.error}
          </Alert>
        )}
      </Box>


      <Box
        display="flex"
        flexDirection="column"
        // border="1px solid"
      >
        <Typography
          variant="caption"
          align="left"
          color="text.primary"
        >
          <strong>Enter the 7-digit code below</strong>
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <TextField
            fullWidth
            placeholder="Enter Code"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 7,
                inputMode: "numeric",
                pattern: "[0-9]*",
                autoComplete: "one-time-code",
              },
            }}
            sx={{
              "& input": {
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.5rem",
                fontFamily: "monospace",
              },
              "& input::placeholder": {
                fontSize: "1rem",
                letterSpacing: "normal",
                fontWeight: 400,
              },
            }}
          />
        </Box>

        {/* RESEND SECTION */}
        <Typography
          variant="caption"
          color="text.secondary" sx={{ textAlign: "center" }}
        >
          Didn’t receive a code?{" "}
          <Box
            component="span"
            onClick={hasTimeLeft() ? undefined : otpRequestObject.handlers.handleResend}
            sx={{
              color: hasTimeLeft() ? "text.disabled" : "primary.main",
              cursor: hasTimeLeft() ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {hasTimeLeft() ? `Resend in ${otpRequestObject.state.timeLeft}s` : "Resend code"}
          </Box>
        </Typography>
      </Box>
    </Box>
  )

}