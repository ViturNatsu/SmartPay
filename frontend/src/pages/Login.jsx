import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  MenuItem,
} from "@mui/material";
import { InputAdornment, IconButton } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import PasswordIcon from "@mui/icons-material/Key";
import BankIcon from "@mui/icons-material/AccountBalance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png";
import { login } from "../api/authApi"
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [institution, setInstitution] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if(!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setIsLoading(true);

    try {
        await login({ email, password });
        navigate(`/verify?email=${encodeURIComponent(email)}&type=login`);
      } catch (err) {
        if (err.status === 401) setErrorMsg("Incorrect email or password.");
        else if (err.status === 403) setErrorMsg("Please verify your email before signing in.");
        else setErrorMsg(err.message || "Network error. Please try again.");
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
      {/* TODO: Add icons to each of the form entries: Financial Institution, Email, Password, and View password. */}
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
            <Box component="form" onSubmit={handleLogin}>
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
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
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
                    sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}
                >
                    Password
                </Typography>
                <Typography
                    component="a"
                    href="/forgot-password"
                    sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "primary.main",
                    textDecoration: "none",
                    cursor: "pointer",
                    }}
                >
                    Forgot password?
                </Typography>
                </Box>

                <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
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
                <FormControlLabel
                sx={{ mb: 2, userSelect: "none" }}
                control={<Checkbox size="small" />}
                label={
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
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
                <Link href="/register" underline="none" sx={{ fontWeight: 700 }}>
                    Sign up for free
                </Link>
                </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
