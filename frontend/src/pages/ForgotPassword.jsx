import { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { requestResetCode } from "../api/authApi";
import logo from "../assets/logo.png";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // stores validation message
  const [touched, setTouched] = useState(false); // track if user interacted
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Basic email regex
  const validateEmail = (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required.";
    if (!pattern.test(value)) return "Please enter a valid email.";
    return "";
  };

  // Run validation on blur
  const handleBlur = () => {
    setTouched(true);
    const validationMessage = validateEmail(email);
    setError(validationMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setResetEmailSent(false);
    const validationMessage = validateEmail(email);
    setError(validationMessage);

    if (validationMessage) {
      return;
    }

    try {
      await requestResetCode({ email });
      setResetEmailSent(true);
    } catch (e) {
      if (e.status === 400) setError("Email not sent or in incorrect format");
      else if (e.status === 429) setError("Account Locked");
      else setError("An error occurred. Please try again.");
    }
  };

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
              width: { xs: 71, md: 127 },
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
              fontSize: { xs: "30px", md: "60px" },
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
              Forgot Password
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
              Enter your email to receive a verification code.
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
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur} // validate on blur
                  error={Boolean(error && touched)} // show red outline if invalid
                  helperText={touched ? error : ""} // show message only if touched
                  required
                  placeholder="Enter your email"
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
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                Send Reset Link
              </Button>
              <p style={{ display: resetEmailSent ? "block" : "none" }}>
                If an account exists for that email, we've sent password reset
                instructions.
              </p>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
