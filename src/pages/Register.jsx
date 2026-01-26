import axios from "axios";
import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  MenuItem,
  Avatar,
} from "@mui/material";
import { InputAdornment, IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import PasswordIcon from "@mui/icons-material/Key";
import BankIcon from "@mui/icons-material/AccountBalance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import SecurityIcon from "@mui/icons-material/Security";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import logo from "../assets/logo.png";
import Alert from "@mui/material/Alert";
import { register } from "../api/authApi";
import { use } from "react";

export const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [institution, setInstitution] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
    /* identical to box height, or 150% */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isEmailInvalid = !emailRegex.test(email);
    let isPasswordInvalid = !passwordRegex.test(password);
    let isConfirmInvalid = password !== confirmPassword;

    setEmailError(isEmailInvalid);
    setPasswordError(isPasswordInvalid);
    setConfirmPasswordError(isConfirmInvalid);
    setSuccessMessage("");

    if (isEmailInvalid || isPasswordInvalid || isConfirmInvalid) {
      return;
    }

    const userInfo = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };

    const auth = {
      username: "admin",
      password: "admin",
    };
    try {
      const result = await register(userInfo);
      console.log(`success: ${result}`);
      setErrorMessage("");
      setSuccessMessage(
        <>
          Successfully created an account! Please verify your account before{" "}
          <Link href="/login" underline="hover">
            Signing in.
          </Link>
        </>,
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const data = error.data;
      const status = error.status;

      if (status === 429) {
        setErrorMessage(
          "We can't process your request right now. Please try again later.",
        );
      } else if (status === 409) {
        setErrorMessage(
          <>
            We can't create an account with that email.{" "}
            <Link href="/login" underline="hover">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/forgot-password" underline="hover">
              reset your password
            </Link>{" "}
            if you already have an account.
          </>,
        );
      } else {
        const message =
          data?.errors?.[0]?.defaultMessage ||
          data?.message ||
          "Registration failed. Please try again.";
        setErrorMessage(message);
      }

      console.error(`error: ${error.data.message}`);
    }
  };

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
            Join thousands of businessess managing their finances with ease
          </Typography>
          {/* small bullet points section w icons */}
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
            <Box sx={bulletContainerSx}>
              <Avatar
                variant="rounded"
                sx={{ backgroundColor: "#DBEAFE", borderRadius: 2 }}
              >
                <SecurityIcon sx={{ color: "#2563EB" }}></SecurityIcon>
              </Avatar>
              <Box sx={bulletBoxSx}>
                <Typography sx={bulletBoxHeadingSx}>
                  Bank-level Security
                </Typography>
                <Typography sx={bulletBoxInfoSx}>
                  Your data is encrypted and protected with industry-leading
                  security standards.
                </Typography>
              </Box>
            </Box>
            <Box sx={bulletContainerSx}>
              <Avatar
                variant="rounded"
                sx={{ backgroundColor: "#d4fafe", borderRadius: 2 }}
              >
                <FlashOnIcon sx={{ color: "#0891B2" }}></FlashOnIcon>
              </Avatar>
              <Box sx={bulletBoxSx}>
                <Typography sx={bulletBoxHeadingSx}> Instant Setup</Typography>
                <Typography sx={bulletBoxInfoSx}>
                  Get started in minutes and connect your financial institutions
                  seamlessly.
                </Typography>
              </Box>
            </Box>
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
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Create Your Account
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Sign up to start managing your finances with SmartPay
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 1,
                  }}
                >
                  First Name
                </Typography>
                <TextField
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box flex={1}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 1,
                  }}
                >
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
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
              sx={{ mb: 0 }}
            >
              <MenuItem value="">Select institution</MenuItem>
              <MenuItem value="chase">Chase</MenuItem>
              <MenuItem value="boa">Bank of America</MenuItem>
              <MenuItem value="wells">Wells Fargo</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
              }}
            >
              Email Address
            </Typography>
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? "Must use proper email format" : ""}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
              }}
            >
              Password
            </Typography>
            <TextField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={
                "Must be at least 8 characters with uppercase, lowercase, numbers, and symbols"
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
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

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
              }}
            >
              Confirm Password
            </Typography>
            <TextField
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              helperText={confirmPasswordError ? "Passwords must match" : ""}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                      >
                        {showConfirmPassword ? (
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

            <Button
              variant="contained"
              type="submit"
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                mb: 2,
                boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" underline="hover" sx={{ fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>

        {successMessage && (
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 2 }}
          >
            {successMessage}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};
