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
  const {
    handleResend,
    mockOtpRequest,
    isSent,
    timeLeft,
    requesting: otpRequesting,
    error: otpRequestError,
    reset
  } = useOtpRequest({
    requestAPI: requestOtpCode,
  });

  // Hook for handling all Otp VERIFICATION related events
  const {
    sendOtpVerify,
    loading: otpVerifying,
    error: otpVerifyError,
  } = useOtpVerify();

  useEffect(() => {

    mockOtpRequest({
      email: emailParam,
      type: typeParam,
    })

    const submit = async () => {
      submittedRef.current = true;

      return await sendOtpVerify({
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
            isRequesting={otpRequesting}
            isSent={isSent}
            emailTarget={emailParam}
            otpErrorMessage={otpVerifyError}
            isVerifying={otpVerifying}
            value={otp}
            onChange={setOtp}
            timeLeft={timeLeft}
            handleResend={handleResend}
          />

          <Button
            onClick={() => {
              sendOtpVerify({
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
            disabled={otpVerifying}>
            {otpVerifying ? "Verifying Code..." : "Verify Code"}
          </Button>
        </Box>

      </Grid>
    </Grid>
  );
}

// export const VerifyOtp = () => {
//   const location = useLocation();
//   const [showSuccess, setShowSuccess] = useState(
//     location.state?.showSuccess || false,
//   );
//   const [successMessage, setSuccessMessage] = useState(
//     location.state?.successMessage || "",
//   );
//
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false); // related to OTP Verifying
//   const [resendLoading, setResendLoading] = useState(false);
//
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const emailParam = searchParams.get("email");
//   const typeParam = searchParams.get("type");
//   const codeParam = searchParams.get("code");
//
//   const { setAuthFromTokens, tokenClaims } = useAuth();
//
//   // Guard to avoid double submission (React 18 StrictMode may invoke effects twice in dev)
//   const submittedRef = useRef(false);
//
//   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//
//   // const {
//   //   sendOtpVerify,
//   //   loading,
//   //   error
//   // } = useOtpVerify();
//
//   const typeParameterBranching = async (res, typeParam, submittedCode) => {
//     switch (typeParam) {
//       case "login": {
//         const newClaims = await setAuthFromTokens({
//           accessToken: res.accessToken,
//           refreshToken: res.refreshToken,
//         });
//         // redirect after login based on user role; use returned claims since
//         // the context state may not have updated yet
//         const role = newClaims?.role || tokenClaims?.role;
//         if (role === "ADMIN") {
//           console.log("Redirecting to admin dashboard");
//           navigate("/admin/dashboard", { replace: true });
//         } else {
//           console.log("Redirecting to user dashboard");
//           navigate("/home", { replace: true });
//         }
//         break;
//       }
//       case "register":
//         setShowSuccess(true);
//         setSuccessMessage(
//           "Email verified successfully! Redirecting to login...",
//         );
//         await delay(2000);
//         navigate(`/login`, { replace: true });
//         break;
//       case "forgot-password":
//         navigate(
//           `/reset-password?email=${encodeURIComponent(emailParam)}&code=${submittedCode}`,
//           { replace: true },
//         );
//         break;
//       default:
//         setError("Unknown verification type.");
//     }
//   }
//
//   const submit = async (submittedCode) => {
//     setError("");
//     if (!/^[0-9]{7}$/.test(submittedCode)) {
//       setError("Enter a valid 7-digit code.");
//       return;
//     }
//
//     try {
//       setLoading(true);
//       const res = await sendVerifyCode({
//         email: emailParam,
//         code: submittedCode,
//         type: typeParam,
//       });
//
//       await typeParameterBranching(res, typeParam);
//
//     } catch (err) {
//       if (err.status === 400) setError("Code is invalid.");
//       else if (err.status === 401)
//         setError("Code has expired or was already used.");
//       else if (err.status === 404) setError("Email not found.");
//       else if (err.status === 429)
//         setError("Too many attempts. Please try again later.");
//       else if (err.status === 410) {
//         setError(
//           "Too many invalid attempts. Please restart the process. Redirecting to login...",
//         );
//         await delay(3000);
//         navigate(`/login`, { replace: true });
//       } else setError(err.message || "Verification failed.");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // auto submit if this page was reached through a re-direct link.
//   useEffect(() => {
//     if (emailParam && typeParam && codeParam && !submittedRef.current) {
//       submittedRef.current = true;
//       setCode(codeParam);
//       submit(codeParam);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [emailParam, typeParam, codeParam]);
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await submit(code);
//   };
//
//   const handleResendCode = async () => {
//     setResendLoading(true);
//     setError("");
//     try {
//       await requestResetCode({ email: emailParam, type: typeParam });
//       setShowSuccess(true);
//       setSuccessMessage("Verification code has been resent to your email.");
//     } catch (err) {
//       if (err.status === 400) setError("Invalid details.");
//       else if (err.status === 429)
//         setError("Too many attempts. Please try again later.");
//       else if (err.status === 503)
//         setError(
//           "Email service is currently unavailable. Please try again later.",
//         );
//       else setError(err.message || "Failed to resend verification code.");
//     } finally {
//       setResendLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     if (showSuccess) {
//       const timer = setTimeout(() => setShowSuccess(false), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccess]);
//
//   return (
//     <Grid
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: { xs: "column", md: "row" },
//       }}
//     >
//       <SmartPayBanner />
//
//       <Grid
//         sx={{
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           px: { xs: 3, md: 8 },
//           py: { xs: 6, md: 0 },
//         }}
//       >
//         <Box
//           component="form"
//           onSubmit={handleSubmit}
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//             width: 450,
//           }}
//         >
//           <Typography variant="h5" align="center">
//             Verify Code
//           </Typography>
//           <OtpInputField
//             messageFluff={"continue"}
//             emailTarget={emailParam}
//           />
//
//
//
//           <TextField
//             label="7-digit code"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             onBlur={() => {
//               if (code && !/^\d{7}$/.test(code)) {
//                 setError("Enter a valid 7-digit code.");
//               }
//             }}
//             error={Boolean(error)}
//             helperText={error || ""}
//             inputProps={{ maxLength: 7 }}
//             required
//           />
//
//           <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
//             <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
//               Didn't receive the code?{" "}
//               <Link
//                 component="button"
//                 type="button"
//                 underline="hover"
//                 onClick={handleResendCode}
//                 disabled={resendLoading}
//                 sx={{ fontWeight: 700, cursor: "pointer" }}
//               >
//                 {resendLoading ? "Resending..." : "Resend Code"}
//               </Link>
//             </Typography>
//           </Box>
//
//           <Button type="submit" variant="contained" disabled={loading}>
//             {loading ? "Verifying Code..." : "Verify Code"}
//           </Button>
//
//           {showSuccess && successMessage && (
//             <Alert
//               icon={<CheckIcon fontSize="inherit" />}
//               severity="success"
//               sx={{ mb: 2 }}
//             >
//               {successMessage}
//             </Alert>
//           )}
//         </Box>
//
//       </Grid>
//     </Grid>
//   );
// };
