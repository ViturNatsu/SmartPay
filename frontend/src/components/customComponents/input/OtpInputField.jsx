import {Alert, Box, Button, CircularProgress, Link, TextField, Typography} from "@mui/material";
import {MuiOtpInput} from "mui-one-time-password-input";
import CheckIcon from "@mui/icons-material/Check";
import {useState} from "react";


export const OtpInputField = (
  {
    messageFluff,
    emailTarget,
    otpErrorMessage,
    isSent,
    isRequesting,
    isVerifying,
    value,
    onChange,
    timeLeft,
    handleResend
  }) => {

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        // border: "1px solid",
        paddingX: "2rem",
        boxSizing: "border-box",
        borderRadius: 2
      }}
    >



      {!isRequesting && isSent &&
        <Alert
          severity="success"
          sx={{
            justifyContent: "center",
            textAlign: "center",
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
              sx={{
                fontWeight: "bold",

              }}
            >
              {emailTarget}
            </Box>
            . Enter it below to {messageFluff}.
          </Typography>
        </Alert>
      }
      {isRequesting &&
        <Box
          sx={{
            justifyContent: "center",
            textAlign: "center",
          }}>
          <CircularProgress
          />
        </Box>
      }

      {otpErrorMessage && !isVerifying && (
        <Alert
          severity="error"
          sx={{
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {otpErrorMessage}
        </Alert>
      )}

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
          placeholder="Enter code"
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
          onClick={timeLeft > 0 ? undefined : handleResend}
          sx={{
            color: timeLeft > 0 ? "text.disabled" : "primary.main",
            cursor: timeLeft > 0 ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend code"}
        </Box>
      </Typography>
    </Box>
  )

}