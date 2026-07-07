import { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { requestResetCode } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { SmartPayBanner } from "@/components/SmartPayBanner";

import { tokens } from "@/style/Theme.jsx";
export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // stores validation message
  const [touched, setTouched] = useState(false); // track if user interacted

  const navigate = useNavigate();

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
    const validationMessage = validateEmail(email);
    setError(validationMessage);

    if (validationMessage) {
      return;
    }

    try {
      await requestResetCode({ email, type: "forgot-password" });

      navigate(`/verify?email=${encodeURIComponent(email)}&type=forgot-password`, { replace: true });
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
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: tokens.color.brand.primaryBackground,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SmartPayBanner />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 0 },
          bgcolor: tokens.color.background.surface,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { xs: "290px", md: "448px" } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: { xs: "24px", md: "12px" },
              backgroundColor: { xs: tokens.color.background.appLight, md: "transparent" },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: "30px",
                fontWeight: "bold",
                color: tokens.color.text.primaryDark,
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
                color: tokens.color.text.secondary,
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
                    color: tokens.color.text.heading,
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
                        borderColor: { xs: tokens.color.border.gray, md: tokens.color.border.grayLight },
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
                  color: tokens.color.brand.primaryBackground,
                  bgcolor: tokens.color.link.primary,
                  background: {
                    xs: tokens.color.button.forgotGradient,
                    md: tokens.color.link.primary,
                  },
                  boxShadow: tokens.shadow.linkButton,
                  "&:hover": { bgcolor: tokens.color.link.primaryHover },
                }}
              >
                Send Reset Link
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
