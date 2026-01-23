
import axios from "axios";
import { useState } from "react";
import { Box, Button, Grid, TextField, InputLabel, Link } from "@mui/material";
import Alert from '@mui/material/Alert';
import { register } from "../api/authApi";
export const Register = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async(e) => {
    
    e.preventDefault();





    e.preventDefault();
    let isEmailInvalid = !emailRegex.test(email);
    let isPasswordInvalid = !passwordRegex.test(password);
    let isConfirmInvalid = password !== confirmPassword;

    setEmailError(isEmailInvalid);
    setPasswordError(isPasswordInvalid);
    setConfirmPasswordError(isConfirmInvalid)

    if (isEmailInvalid || isPasswordInvalid || isConfirmInvalid) {
      return;
    }


    const userInfo = {
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };


    const auth = {
      username: "admin",
      password: "admin",
    };
    try {
  const result = await register(userInfo);
  console.log(`success: ${result}`);
  setErrorMessage("");
} catch (error) {
  const data = error.data;
  const status = error.status;

  if (status === 429) {
    setErrorMessage("We can't process your request right now. Please try again later.");
  } else if (status === 409) {
    setErrorMessage(
      <>
        We can't create an account with that email.{" "}
        <Link href="/login" underline="hover">Sign in</Link> or{" "}
        <Link href="/reset-password" underline="hover">reset your password</Link>{" "}
        if you already have an account.
      </>
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
    <Grid container height="100vh">
      <Grid size={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <h1>SmartPay</h1>
        <p>Join thousands of business managing their finances with ease.</p>
      </Grid>
      <Grid size={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
        <h1>Create Your Account</h1>
        <p>Sign up to start managing your finances with SmartPay</p>

              {errorMessage && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {errorMessage}
  </Alert>
)}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? "Must use proper email format" : ""}
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordError ? "Must meet password requirements" : ""}
            />

            <TextField
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              helperText={confirmPasswordError ? "Passwords must match" : ""}
            />

            <Button variant="contained" type="submit">
              Create Account
            </Button>
          </Box>
        </form>
        <p>Already have an account? Sign in</p>

      </Grid>
    </Grid>
  );
};