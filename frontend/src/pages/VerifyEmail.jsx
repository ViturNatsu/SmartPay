import { useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Button, Box, Typography, Paper, Divider } from "@mui/material";
import { requestResetCode } from "../api/authApi";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { SmartPayBanner } from "../components/SmartPayBanner";

export const VerifyEmail = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");


  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");
    try {
      setLoading(true);

      await requestResetCode({ email: emailParam, type: "register" });

      navigate(`/verify?email=${encodeURIComponent(emailParam)}&type=register`, { replace: true }, {
        state: {
          successMessage:
            "Successfully Resent a Verification Email! Please verify your account to continue.",
          showSuccess: true,
        },
      });
    } catch (err) {
      if (err.status === 400) setError("Email not sent or in incorrect format");
      else if (err.status === 409) setError("Email is already verified. Please log in.");
      else if (err.status === 429) setError("Account Locked");
      else setError("An error occurred. Please try again.");
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
        fontFamily: "'Inter', sans-serif"
      }}
    >

      <SmartPayBanner />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 8 }, py: { xs: 6, md: 0 },
          bgcolor: "white"
        }}>
        <Paper elevation={6} sx={{ width: "100%", maxWidth: { xs: "320px", md: "480px" }, borderRadius: 3, p: { xs: 3, md: 4 }, textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ bgcolor: "#EEF2FF", borderRadius: "50%", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MailOutlineIcon sx={{ color: "#2563EB", fontSize: 36 }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>Verify Your Email</Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Your email address isn't verified yet. Please verify your email to continue.</Typography>

          <Box sx={{ bgcolor: "#F3F4F6", borderRadius: 2, p: 2, mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Email:</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mt: 1 }}>{emailParam}</Typography>
          </Box>

          {error && <Typography sx={{ color: "error.main", fontSize: 13 }}>{error}</Typography>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            <Button type="submit" variant="contained" disabled={loading} sx={{ height: 52, borderRadius: 2, textTransform: "none", fontSize: 16, fontWeight: 600, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}>
              {loading ? "Resending Verification Email..." : "Resend Verification Email"}
            </Button>
          </Box>

          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 1 }}>Didn't receive the email? Check your spam folder or wait a few minutes.</Typography>

          <Divider sx={{ my: 1 }} />

          <Button component={RouterLink} to="/login" startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 18 }} />} sx={{ alignSelf: "center", textTransform: "none", color: "#2563EB" }}>
            Back to Sign In
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
