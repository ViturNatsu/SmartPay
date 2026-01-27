import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { requestResetCode } from "../api/authApi";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async(e) => {
    e.preventDefault();
    setTouched(true);
    const validationMessage = validateEmail(email);
    setError(validationMessage);

    if (validationMessage) {
      return;
    }

    // Simulate success
    try {
      await requestResetCode();
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (e) {
      if (e.status === 400) setError("Email not sent or in incorrect format");
      if (e.status === 429) setError("Account Locked")
    } 
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 300,
        margin: "100px auto",
      }}
    >
      <Typography variant="h5" align="center">
        Forgot Password
      </Typography>

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleBlur}             // validate on blur
        error={Boolean(error && touched)} // show red outline if invalid
        helperText={touched ? error : ""} // show message only if touched
        required
      />

      <Button type="submit" variant="contained">
        Send Reset Link
      </Button>
    </Box>
  );
};
