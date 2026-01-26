import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, TextField, Link } from "@mui/material";
import { register } from "../api/authApi";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const navigate = useNavigate();
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);

  const handleSubmit = async(e) => {
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

    try {
      const result = await register(userInfo);
      console.log(`success: ${result}`);
    } catch (err) {
      console.error(err);
      if (err.status === 409) {
        setDuplicateEmailError(true);
      }
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
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setDuplicateEmailError(false);
              }}

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

            {duplicateEmailError && (
                <Box sx={{ fontSize: "0.9rem", color: "error.main" }} role="alert">
                  We can’t create an account with that email. Please{" "}
                  <Link component="button" underline="hover" onClick={() => navigate("/login")}>
                    Sign in
                  </Link>
                  {" or "}
                  <Link component="button" underline="hover" onClick={() => navigate("/reset-password")}>
                    reset your password
                  </Link>
                  .
                </Box>
              )}

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