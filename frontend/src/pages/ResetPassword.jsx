import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { resetPassword } from "../api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const codeParam = searchParams.get("code");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await resetPassword({
        email: emailParam,
        password1: password,
        password2: confirmPassword,
        "access-code": codeParam,
      });
      navigate("/login");
    } catch (err) {
      let errorMessage;
      switch (err.status) {
        case 400:
          errorMessage = "Passwords do not match";
          break;
        case 401:
          errorMessage = "Reset code has expired";
          break;
        case 404:
          errorMessage = "Email address not found";
          break;
        case 422:
          errorMessage = "Password is too weak";
          break;
        case 429:
          errorMessage = "Too many failed attempts";
          break;
        case 500:
          errorMessage = "An error occurred. Please try again later";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
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
          {" "}
          {/* [cite: 12, 13, 19, 20] */}
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
              Reset Password
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: { xs: 0, md: 4 },
              }}
            >
              <Box>
                <Typography
                  component="label"
                  htmlFor="reset-password-new"
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                  }}
                >
                  {" "}
                  {/* [cite: 10] */}
                  New Password
                </Typography>
                <TextField
                  id="reset-password-new"
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

              <Box>
                <Typography
                  component="label"
                  htmlFor="reset-password-confirm"
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                  }}
                >
                  {" "}
                  {/* [cite: 10] */}
                  Confirm Password
                </Typography>
                <TextField
                  id="reset-password-confirm"
                  fullWidth
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={Boolean(error)}
                  helperText={error || ""}
                  required
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
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
