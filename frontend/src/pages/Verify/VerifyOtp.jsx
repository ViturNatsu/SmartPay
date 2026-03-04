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
import { requestResetCode, sendVerifyCode } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import { SmartPayBanner } from "@/components/SmartPayBanner";

export const VerifyOtp = () => {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(
    location.state?.showSuccess || false,
  );
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );

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

  // Guard to avoid double submission (React 18 StrictMode may invoke effects twice in dev)
  const submittedRef = useRef(false);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const submit = async (submittedCode) => {
    setError("");
    if (!/^[0-9]{7}$/.test(submittedCode)) {
      setError("Enter a valid 7-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendVerifyCode({
        email: emailParam,
        code: submittedCode,
        type: typeParam,
      });

      switch (typeParam) {
        case "login":
          await setAuthFromTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
          navigate("/home", { replace: true });
          break;
        case "register":
          setShowSuccess(true);
          setSuccessMessage(
            "Email verified successfully! Redirecting to login...",
          );
          await delay(2000);
          navigate(`/login`, { replace: true });
          break;
        case "forgot-password":
          navigate(
            `/reset-password?email=${encodeURIComponent(emailParam)}&code=${submittedCode}`,
            { replace: true },
          );
          break;
        default:
          setError("Unknown verification type.");
      }
    } catch (err) {
      if (err.status === 400) setError("Code is invalid.");
      else if (err.status === 401)
        setError("Code has expired or was already used.");
      else if (err.status === 404) setError("Email not found.");
      else if (err.status === 429)
        setError("Too many attempts. Please try again later.");
      else if (err.status === 410) {
        setError(
          "Too many invalid attempts. Please restart the process. Reidirecting to login...",
        );
        await delay(3000);
        navigate(`/login`, { replace: true });
      } else setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailParam && typeParam && codeParam && !submittedRef.current) {
      submittedRef.current = true;
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
      setShowSuccess(true);
      setSuccessMessage("Verification code has been resent to your email.");
    } catch (err) {
      if (err.status === 400) setError("Invalid details.");
      else if (err.status === 429)
        setError("Too many attempts. Please try again later.");
      else if (err.status === 503)
        setError(
          "Email service is currently unavailable. Please try again later.",
        );
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
