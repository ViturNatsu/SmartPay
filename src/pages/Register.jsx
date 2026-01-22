import { useState } from "react";
import { Box, Button, Grid, TextField, InputLabel, Link } from "@mui/material";
import Alert from '@mui/material/Alert';
import axios from "axios";
export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("passwords do not match. ");
      return;
    }

    const userInfo = {
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };
    const api = "http://localhost:8080/api/v1/registration";

    const auth = {
      username: "admin",
      password: "admin",
    };
    axios
      .post(api, userInfo, auth)
      .then((response) => {
        console.log("success");
        setErrorMessage("")
      })
      .catch((error) => {
        if (!error.response) {
          setErrorMessage("Network error. Please try again later.");
          return;
        }
        
        const status = error.response.status;

        if (status === 429) {
          setErrorMessage("We can’t process your request right now. Please try again later.");
        } else {
          setErrorMessage(
            <>
              We can’t create an account with that email.{" "}
              <Link href="/login" underline="hover">Sign in</Link> or{" "}
              <Link href="/reset-password" underline="hover">reset your password</Link>{" "}
              if you already have an account.
            </>
          );
        }
      });
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
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <InputLabel shrink>Email</InputLabel>
              <TextField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Enter a valid email address (example: name@domain.com).",
                  )
                }
              />
              <InputLabel shrink>Password</InputLabel>
              <TextField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputLabel shrink>Confirm Password</InputLabel>
              <TextField
                type="password"             
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button  variant="contained"  type="submit">
                Create Account
              </Button>
            </Box>
          </form>
          <p>Already have an account?{" "}
            <Link href="/login" underline="hover">
                Sign in
            </Link>
          </p>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2, maxWidth: 420 }}>
              {errorMessage}
            </Alert>
          )}
        
      </Grid>
    </Grid>
  );
};
