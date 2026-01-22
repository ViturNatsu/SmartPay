import axios from "axios";
import { useState } from "react";
import { Box, Button, Grid, TextField, InputLabel } from "@mui/material";
import Alert from '@mui/material/Alert';
import axios from "axios";
export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("passwords do not match. ");
      return;
    }

    const userInfo = {
      email: email,
      password: password,
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
      })
      .catch((error) => {
        console.log("error");
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
          <p>Already have an account? Sign in</p>
        
      </Grid>
    </Grid>
  );
};
