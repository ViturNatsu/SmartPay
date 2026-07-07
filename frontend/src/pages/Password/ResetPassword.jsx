import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { resetPassword } from "@/api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SmartPayBanner } from "@/components/SmartPayBanner";

import { tokens } from "@/style/Theme.jsx";
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
          {" "}
          {/* [cite: 12, 13, 19, 20] */}
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
                    color: tokens.color.text.heading,
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
                        borderColor: { xs: tokens.color.border.gray, md: tokens.color.border.grayLight },
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
                    color: tokens.color.text.heading,
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
                        borderColor: { xs: tokens.color.border.gray, md: tokens.color.border.grayLight },
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
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
