import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import PasswordIcon from "@mui/icons-material/Key";
import BankIcon from "@mui/icons-material/AccountBalance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png";
import { login } from "../api/authApi";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

export const Login = () => {
  const location = useLocation();
  const [institution, setInstitution] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeoutMsgOpen, setTimeoutMsgOpen] = React.useState(
    location?.state?.signoutReason === "inactivity",
  );


  const navigate = useNavigate();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const EMAIL_REQUIRED_MSG = "Email is required. Can't be left blank.";
  const EMAIL_INVALID_MSG = "Enter a valid email address (example: name@domain.com)";

  const validateEmail = (isSubmit = false) => {
    const trimmed = email.trim();

    if (!trimmed) { // clicking sign in with empty email
      setEmailError(isSubmit ? EMAIL_REQUIRED_MSG : EMAIL_INVALID_MSG);
      return false;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(EMAIL_INVALID_MSG);
      return false;
    }

    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required. Can't be left blank.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateEmail(true)) return;
    if (!validatePassword()) return;

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(`/verify?email=${encodeURIComponent(email)}&type=login`, { replace: true });
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      const url = err?.config?.url ?? err?.response?.config?.url ?? "";

      {/* displays login err message over refresh error msg */ }
      if (url.includes("/api/v1/auth/refresh")) {
        if (status === 401) setErrorMsg("Incorrect email or password. Please try again.");
        return;
      }

      if (status === 401) setErrorMsg("Incorrect email or password. Please try again.");
      else if (status === 403) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
      }
      else if (status === 429)
        setErrorMsg("Your account is locked due to multiple failed attempts. Please reset password or try later.");
      else setErrorMsg(err?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
      }}
    >
      {/* Left side */}
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
        {/* Sets up the logo */}
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
          {/* Sets up SmartPay title */}
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
          {/* Sets up brief description. */}
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 360,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Seamless financial integration for the modern enterprise.
          </Typography>
        </Box>
      </Box>

      {/* Right side */}
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
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            {timeoutMsgOpen && (
              <Alert
                severity="info"
                onClose={() => setTimeoutMsgOpen(false)}
                sx={{ mb: 2 }}
              >
                You’ve been signed out due to inactivity. Please sign in again.
              </Alert>
            )}
            <Box component="form" onSubmit={handleLogin} noValidate>
              {/* Sign in title and brief description. */}
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Sign In
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 3 }}>
                Enter your credentials to access your account
              </Typography>

              {/* Financial Institution */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: 1,
                }}
              >
                Financial Institution
              </Typography>
              <TextField
                select
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BankIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Select institution"
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Select institution</MenuItem>
                <MenuItem value="chase">Chase</MenuItem>
                <MenuItem value="boa">Bank of America</MenuItem>
                <MenuItem value="wells">Wells Fargo</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>

              {/* Email */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: 1,
                }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={validateEmail}
                error={Boolean(emailError)}
                helperText={emailError}
                sx={{ mb: 2 }}
                slotProps={{
                  htmlInput: {
                    "aria-label": "email address",
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {/* Password and forgot password link. */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  Password
                </Typography>
                <Typography
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "primary.main",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <TextField
                fullWidth

                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                error={Boolean(passwordError)}
                helperText={passwordError}
                sx={{ mb: 2 }}
                slotProps={{
                  htmlInput: {
                    "aria-label": "password",
                  },
                  input: {

                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon
                          sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <FormControlLabel
                sx={{ mb: 2, userSelect: "none" }}
                control={<Checkbox size="small" />}
                label={
                  <Typography component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
                    Remember me for 30 days
                  </Typography>
                }
              />
              {errorMsg && (
                <Typography sx={{ color: "error.main", fontSize: 13, mb: 2 }}>
                  {errorMsg}
                </Typography>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  mb: 2,
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "center",
                }}
              >
                Don&apos;t have an account?{" "}
                <MuiLink
                  href="/register"
                  underline="none"
                  sx={{ fontWeight: 700 }}
                >
                  Sign up for free
                </MuiLink>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
