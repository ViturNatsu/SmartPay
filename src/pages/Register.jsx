import { useState } from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
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
    <Grid container spacing={2}>
      <Grid size={6}>
        <h1>Register</h1>
      </Grid>
      <Grid size={6}>
        <Box display="flex" flexDirection="column" alignItems={"center"}  gap={2}>
          <h1>Create Your Account</h1>
          <p>Sign up to start managing your finances with SmartPay</p>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Enter a valid email address (example: name@domain.com).",
                  )
                }
              />

              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <TextField
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button  variant="contained"  type="submit">
                Create Account
              </Button>
            </Box>
          </form>
          <p>Already have an account? Sign in</p>
        </Box>
      </Grid>
    </Grid>
  );
};
