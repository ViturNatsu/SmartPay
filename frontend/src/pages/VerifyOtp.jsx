import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert, Grid, Avatar, Link } from "@mui/material";
import { requestResetCode, sendVerifyCode } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import SecurityIcon from "@mui/icons-material/Security";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import logo from "../assets/logo.png";
export const VerifyOtp = () => {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(location.state?.showSuccess || false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type");
  const codeParam = searchParams.get("code");

  const { setAuthFromTokens } = useAuth();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const bulletContainerSx = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "0px",
    gap: "16px",
    width: "427.86px",
    maxWidth: "448px",
    height: "68px",
  };

  const bulletBoxSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0px",
    gap: "4px",
  };

  const bulletBoxHeadingSx = {
    width: "150.39px",
    height: "24px",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "24px",
    display: "flex",
    alignItems: "center",
    color: "#111827",
  };

  const bulletBoxInfoSx = {
    width: "341.13px",
    height: "40px",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "20px",
    display: "flex",
    color: "#4B5563",
    textAlign: "left",
  };

  const submit = async (submittedCode) => {
    setError("");
    if (!/^[0-9]{7}$/.test(submittedCode)) {
      setError("Enter a valid 7-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendVerifyCode({ email: emailParam, code: submittedCode, type: typeParam });
      switch (typeParam) {
        case "login":
          setAuthFromTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
          navigate(`/home`);
          break;
        case "register":
          setShowSuccess(true)
          setSuccessMessage("Email verified successfully! Redirecting to login...");
          await delay(2000)
          navigate(`/login`);
          break;
        case "forgot-password":
          navigate(`/reset-password?email=${encodeURIComponent(emailParam)}&code=${submittedCode}`);
          break;
        default:
          setError("Unknown verification type.");
      }
    } catch (err) {
      if (err.status === 400) setError("Code is invalid.");
      else if (err.status === 401) setError("Code has expired or was already used.");
      else if (err.status === 404) setError("Email not found.");
      else if (err.status === 429) setError("Too many attempts. Please try again later.");
      else setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailParam && typeParam && codeParam) {
      setCode(codeParam);
      submit(codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam, typeParam, codeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(code);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");
    try {
      await requestResetCode({ email: emailParam, type: typeParam });
      setShowSuccess(true)
      setSuccessMessage("Verification code has been resent to your email.");
    } catch (err) {
      if (err.status === 400) setError("Invalid details.");
      else if (err.status === 429) setError("Too many attempts. Please try again later.");
      else setError(err.message || "Failed to resend verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <Grid
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 0 },
          position: "relative",
          overflow: "hidden",
          backgroundImage: `
            radial-gradient(600px 600px at 85% 10%, rgba(193, 232, 255, 0.55), rgba(255,255,255,0) 60%),
            radial-gradient(700px 700px at 15% 95%, rgba(193, 255, 245, 0.55), rgba(255,255,255,0) 60%)
            `,
        }}
      >
        <Box sx={{ textAlign: "center", position: "relative" }}>
          <Box
            component="img"
            src={logo}
            alt="SmartPay Logo"
            sx={{
              width: 100,
              height: "auto",
              mx: "auto",
              display: "block",
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1E40AF",
              mb: 1,
            }}
          >
            SmartPay
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 360,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Join thousands of businessess managing their finances with ease
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 0 },
              padding: "16px 0px 0px",
              gap: "24px",
              width: "427.86px",
              height: "176px",
            }}
          >

          </Box>
        </Box>
      </Box>

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
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 300,
          }}
        >
          <Typography variant="h5" align="center">
            Verify Code
          </Typography>

          <TextField
            label="7-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => {
              if (code && !/^\d{7}$/.test(code)) {
                setError("Enter a valid 7-digit code.");
              }
            }}
            error={Boolean(error)}
            helperText={error || ""}
            inputProps={{ maxLength: 7 }}
            required
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Didn't receive the code?{" "}
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={handleResendCode}
                disabled={resendLoading}
                sx={{ fontWeight: 700, cursor: "pointer" }}
              >
                {resendLoading ? "Resending..." : "Resend Code"}
              </Link>
            </Typography>
          </Box>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Verifying Code..." : "Verify Code"}
          </Button>


          {showSuccess && successMessage && (
            <Alert
              icon={<CheckIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 2 }}
            >
              {successMessage}
            </Alert>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};
