import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Alert,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { requestResetCode, sendVerifyCode } from "../api/authApi";

import { resendCode } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import logo from "../assets/logo.png";

export const VerifyOtp = () => {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(
    location.state?.showSuccess || false,
  );
  const successMessage = location.state?.successMessage;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type");
  const codeParam = searchParams.get("code");

  const { setAuthFromTokens } = useAuth();

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
          setAuthFromTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
          navigate(`/home`);
          break;
        case "register":
          navigate(`/login`);
          break;
        case "forgot-password":
          navigate(
            `/reset-password?email=${encodeURIComponent(emailParam)}&code=${submittedCode}`,
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
      else setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    try {
      setLoadingResend(true);
      const res = await requestResetCode({
        email: emailParam,
        type: typeParam,
      });
    } catch (err) {
      if (err.status === 400) setError("Invalid input.");
      else if (err.status === 429)
        setError("Too many requests. Please try again later.");
      else setError(err.message || "Network error");
    } finally {
      setLoadingResend(false);
    }
  };
  useEffect(() => {
    if (emailParam && typeParam && codeParam) {
      setCode(codeParam);
      submit(codeParam);
    }
  }, [emailParam, typeParam, codeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(code);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#F8FAFC",
        fontFamily: "'Inter', sans-serif",
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
              width: { xs: 71, md: 100 },
              height: "auto",
              mx: "auto",
              display: "block",
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#2563EB",
              mb: 1,
              fontSize: { xs: "30px", md: "48px", lg: "60px" },
            }}
          >
            SmartPay
          </Typography>
          <Typography
            sx={{
              color: "#6B7280",
              maxWidth: 360,
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "14px", md: "20px" },
            }}
          >
            Seamless financial integration for the modern enterprise.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 0 },
          bgcolor: "white",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { xs: "290px", md: "448px" } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: { xs: "24px", md: "12px" },
              backgroundColor: { xs: "#F3F4F6", md: "transparent" },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: "30px",
                fontWeight: "bold",
                color: "#111827",
                textAlign: "center",
                mb: 1,
                display: { xs: "none", md: "block" },
              }}
            >
              Verify Code
            </Typography>
            <Typography
              sx={{
                fontSize: "16px",
                color: "#4B5563",
                textAlign: "center",
                mb: 4,
                display: { xs: "none", md: "block" },
              }}
            >
              Check your email for your one time code
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                  }}
                >
                  Code
                </Typography>
                <TextField
                  fullWidth
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  error={Boolean(error)}
                  helperText={error || ""}
                  placeholder="7-digit code"
                  inputProps={{ maxLength: 7 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: { xs: "50px", md: "54px" },
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: { xs: "#E5E7EB", md: "#D1D5DB" },
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  height: "52px",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#F8FAFC",
                  bgcolor: "#2563EB",
                  background: {
                    xs: "linear-gradient(to right, #06B6D4, #2563EB)",
                    md: "#2563EB",
                  },
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                  "&:hover": {
                    bgcolor: "#1D4ED8",
                  },
                }}
              >
                {loading ? "Verifying Code..." : "Verify Code"}
              </Button>
              <Button
                variant="contained"
                disabled={loadingResend}
                sx={{
                  height: "52px",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#F8FAFC",
                  bgcolor: "#2563EB",
                  background: {
                    xs: "linear-gradient(to right, #06B6D4, #2563EB)",
                    md: "#2563EB",
                  },
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                  "&:hover": {
                    bgcolor: "#1D4ED8",
                  },
                }}
                onClick={resend}
              >
                {loadingResend ? "Resending Code..." : "Resend Code"}
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
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
