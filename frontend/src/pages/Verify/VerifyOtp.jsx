import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Grid,
  Avatar,
  Link,
} from "@mui/material";
import { requestOtpCode, sendVerifyCode } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import { SmartPayBanner } from "@/components/SmartPayBanner";
import {OtpInputField} from "@/components/customComponents/input/OtpInputField.jsx";
import {useOtpRequest} from "@/hooks/OtpHooks/OtpRequests/OtpRequestBase/useOtpRequest.js";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import {useLoginRoleNavigation} from "@/hooks/NavigationHooks/useLoginRoleNavigation.js";
import {useRegisterNavigation} from "@/hooks/NavigationHooks/useRegisterNavigation.js";
import {useResetPasswordNavigation} from "@/hooks/NavigationHooks/useResetPasswordNavigation.js";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";





const determineMessageFluff = (typeParameter) => {
  switch (typeParameter) {
    case "login" : {
      return "login to your account";
    }
    case "register" : {
      return "complete account registration";
    }
    case "forgot-password" : {
      return "reset password";
    }
  }
}



export const VerifyOtp = () => {

  // Get the current URL's parameters. This is done to determine if the page was accessed through a re-direct link.
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type");
  const codeParam = searchParams.get("code");

  const [otp, setOtp] = useState("");

  const submittedRef = useRef(false);

  // NavigationHooks
  const roleNavigation = useLoginRoleNavigation();
  const registerNavigation = useRegisterNavigation();
  const resetPasswordNavigation = useResetPasswordNavigation();


  // Hook for handling all Otp REQUEST related events
  const otpRequestObject = useOtpRequest({
    requestAPI: requestOtpCode,
  })

  const otpVerifyObject = useOtpVerify();

  useEffect(() => {

    void otpRequestObject.handlers.handleMockOtpRequest({
      email: emailParam,
      type: typeParam,
    });

    const submit = async () => {
      submittedRef.current = true;

      return await otpVerifyObject.handlers.sendOtpVerify({
          email: emailParam,
          code: codeParam,
          type: typeParam,
        }
      )
    }
    if (emailParam && typeParam && codeParam && !submittedRef.current) {
      setOtp(codeParam);
      submit().then( async res => {
        switch (typeParam) {
          case "login": {
            await roleNavigation(res)
            break;
          }
          case "register":
            registerNavigation();
            break;
          case "forgot-password":
            resetPasswordNavigation(emailParam, codeParam);
            break;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam, typeParam, codeParam]);


  return (
    <Grid
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <SmartPayBanner />

      <Grid
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 450,
          }}
        >
          <Typography variant="h5" align="center">
            Verify Code
          </Typography>
          <OtpInputField
            messageFluff={determineMessageFluff(typeParam)}
            emailTarget={emailParam}
            otpRequestObject={otpRequestObject}
            otpVerifyObject={otpVerifyObject}
            value={otp}
            onChange={setOtp}
          />

          <Button
            onClick={() => {
              otpVerifyObject.handlers.sendOtpVerify({
                email: emailParam,
                code: otp,
                type: typeParam,
              }).then( async (res) => {
                switch (typeParam) {
                  case "login": {
                    await roleNavigation(res)
                    break;
                  }
                  case "register":
                    registerNavigation();
                    break;
                  case "forgot-password":
                    resetPasswordNavigation(emailParam, codeParam);
                    break;
                }                }
              )
            }}
            variant="contained"
            disabled={otpVerifyObject.state.isVerifying}>
            {otpVerifyObject.state.isVerifying ? "Verifying Code..." : "Verify Code"}
          </Button>
        </Box>

      </Grid>
    </Grid>
  );
}