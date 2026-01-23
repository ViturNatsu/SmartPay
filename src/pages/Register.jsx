
import axios from "axios";
import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  MenuItem,
} from "@mui/material";
import { InputAdornment, IconButton } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import PasswordIcon from "@mui/icons-material/Key";
import BankIcon from "@mui/icons-material/AccountBalance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from '@mui/icons-material/Check';
import logo from "../assets/logo.png";
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
  const [successMessage, setSuccessMessage] = useState("")
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async(e) => {
    
    e.preventDefault();
    let isEmailInvalid = !emailRegex.test(email);
    let isPasswordInvalid = !passwordRegex.test(password);
    let isConfirmInvalid = password !== confirmPassword;

    setEmailError(isEmailInvalid);
    setPasswordError(isPasswordInvalid);
    setConfirmPasswordError(isConfirmInvalid)
    setSuccessMessage("")

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
      setSuccessMessage(
        <> 
          Successfully created an account! Please verify your account before{" "}
          <Link href="/login" underline="hover">Signing in.</Link>
        </>  
      );
      setEmail("")
      setPassword("")
      setConfirmPassword("")
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
            <Link href="/forgot-password" underline="hover">reset your password</Link>{" "}
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
        {/* Sets up the logo */}
        <Box sx={{ textAlign: "center", position: "relative" }}>
          <Box
            component="img"
            src={logo}
            alt="SmartPay Logo"
            sx={{
              width: 100,
              height: "auto",
              mx: "auto",
              display: "block",
            }}
          />
          {/* Sets up SmartPay title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1E40AF",
              mb: 1,
            }}
          >
            SmartPay
          </Typography>
          {/* Sets up brief description. */}
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 360,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Join thousands of businessess managing their finances with ease
          </Typography>
        </Box>
      </Box>
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
              helperText={passwordError ? "Password must be at least 8 characters and include a mix of letters, numbers, and symbols." : ""}
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
        <p>Already have an account?{" "}
          <Link href="/login" underline="hover">
            Sign in
          </Link>
        </p>
        {
          successMessage && (
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

      </Grid>
    </Grid>
  );
};