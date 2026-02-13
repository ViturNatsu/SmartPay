import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  MenuItem,
  Avatar,
} from "@mui/material";
import { InputAdornment, IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import PasswordIcon from "@mui/icons-material/Key";
import BankIcon from "@mui/icons-material/AccountBalance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import { register } from "../api/authApi";
import { SmartPayBanner } from "../components/SmartPayBanner";

export const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const navigate = useNavigate();
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [formError, setFormError] = useState([]);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [institutionError, setInstitutionError] = useState(false);

  const [firstNameErrorMessage, setFirstNameErrorMessage] = useState("");
  const [lastNameErrorMessage, setLastNameErrorMessage] = useState("");
  const [institutionErrorMessage, setInstitutionErrorMessage] = useState("");

  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setDuplicateEmailError(false);

    setFirstNameError(false);
    setLastNameError(false);
    setInstitutionError(false);
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);

    setFirstNameErrorMessage("");
    setLastNameErrorMessage("");
    setInstitutionErrorMessage("");
    setEmailErrorMessage("");
    setPasswordErrorMessage("");

    setApiErrorMessage("");
    const errors = [];
    let firstInvalidRef = null;

    if (!email) {
      setEmailError(true);
      setEmailErrorMessage("Email is required.");
      setErrorMessage(
        "We can't process your request right now because you have errors that need to be fixed",
      );
      errors.push("Email is required.");
      if (!firstInvalidRef) firstInvalidRef = emailRef;
    } else if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Email must match required format.");
      setErrorMessage(
        "We can't process your request right now because you have errors that need to be fixed",
      );
      errors.push("Email must match required format.");
      if (!firstInvalidRef) firstInvalidRef = emailRef;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!firstName.trim()) {
      setFirstNameError(true);
      setFirstNameErrorMessage("First name is required.");
      errors.push("First name is required.");
    } else {
      setFirstNameError(false);
      setFirstNameErrorMessage("");
    }
    if (!lastName.trim()) {
      setLastNameError(true);
      setLastNameErrorMessage("Last name is required.");
      errors.push("Last name is required.");
    } else {
      setLastNameError(false);
      setLastNameErrorMessage("");
    }
    if (!institution) {
      setInstitutionError(true);
      setInstitutionErrorMessage("Please select a financial institution.");
      errors.push("Financial institution is required.");
    } else {
      setInstitutionError(false);
      setInstitutionErrorMessage("");
    }

    let isPasswordInvalid = !passwordRegex.test(password);
    let isConfirmInvalid = password !== confirmPassword;

    if (isConfirmInvalid) {
      setConfirmPasswordError(true);
      setPasswordErrorMessage("Passwords must match.");
      setErrorMessage(
        "We can't process your request right now because you have errors that need to be fixed",
      );
      errors.push("Passwords must match.");
      if (!firstInvalidRef) firstInvalidRef = passwordRef;
    } else if (isPasswordInvalid) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.",
      );
      setErrorMessage(
        "We can't process your request right now because you have errors that need to be fixed",
      );
      errors.push(
        "Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.",
      );
      if (!firstInvalidRef) firstInvalidRef = passwordRef;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    setPasswordError(isPasswordInvalid);
    setConfirmPasswordError(isConfirmInvalid);

    if (errors.length > 0) {
      setFormError(errors);
      if (firstInvalidRef?.current) {
        firstInvalidRef.current.focus();
      }
      return;
    }

    setErrorMessage("");

    setIsLoading(true);
    const userInfo = {
      firstName: firstName,
      lastName: lastName,
      institution: institution,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };

    try {
      await register(userInfo);
      setErrorMessage("");
      setDuplicateEmailError(false);

      navigate(`/verify?email=${encodeURIComponent(email)}&type=register`, {
        state: {
          successMessage:
            "Successfully created an account! Please verify your account to continue.",
          showSuccess: true,
        },
      });
    } catch (error) {
      const data = error.data;
      const status = error.status;

      if (status === 429) {
        setApiErrorMessage(
          "We can't process your request right now. Please try again later.",
        );
      } else if (status === 409) {
        setDuplicateEmailError(true);
        setApiErrorMessage("That email is already in use.");
      } else {
        const message =
          data?.errors?.[0]?.defaultMessage ||
          data?.message ||
          "Registration failed. Please try again.";
        setApiErrorMessage(message);
      }

      console.error(`error: ${error.data.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <SmartPayBanner onRegisterPage={true} showBulletPoints={true} />

      <Box display="flex" flexDirection="column" gap={2}>
        <Grid
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 0 },
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Create Your Account
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Sign up to start managing your finances with SmartPay
            </Typography>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
                {formError.length > 0 && (
                  <ul>
                    {formError.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}
            {duplicateEmailError && (
              <Box
                sx={{ fontSize: "0.9rem", color: "error.main" }}
                role="alert"
              >
                We can’t create an account with that email. Please{" "}
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Link>
                {" or "}
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => navigate("/reset-password")}
                >
                  reset your password
                </Link>
                .
              </Box>
            )}
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={firstNameError}
                    helperText={firstNameErrorMessage}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon
                              sx={{
                                color: "rgba(15, 23, 42, 0.45)",
                              }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={lastNameError}
                    helperText={lastNameErrorMessage}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon
                              sx={{
                                color: "rgba(15, 23, 42, 0.45)",
                              }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: -1,
                }}
              >
                Financial Institution
              </Typography>
              <TextField
                select
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BankIcon
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                error={institutionError}
                helperText={institutionErrorMessage}
                placeholder="Select institution"
                sx={{ mb: 0 }}
              >
                <MenuItem value="">Select institution</MenuItem>
                <MenuItem value="chase">Chase</MenuItem>
                <MenuItem value="boa">Bank of America</MenuItem>
                <MenuItem value="wells">Wells Fargo</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: -1,
                }}
              >
                Email Address
              </Typography>
              <TextField
                inputRef={emailRef}
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDuplicateEmailError(false);
                }}
                error={emailError}
                helperText={emailError ? emailErrorMessage : ""}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        />
                      </InputAdornment>
                    ),
                    "data-testid": "email-input",
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: -1,
                }}
              >
                Password
              </Typography>
              <TextField
                inputRef={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError || confirmPasswordError}
                helperText={
                  passwordError || confirmPasswordError
                    ? passwordErrorMessage
                    : ""
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: -1,
                }}
              >
                Confirm Password
              </Typography>
              <TextField
                inputRef={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError}
                helperText={confirmPasswordError ? passwordErrorMessage : ""}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          sx={{
                            color: "rgba(15, 23, 42, 0.45)",
                          }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "left",
                  mt: -1,
                  mb: -1,
                }}
              >
                <Box component="span">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    {" "}
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </Box>
              </Typography>
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  mb: 2,
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                }}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              {apiErrorMessage && (
                <Typography
                  sx={{ color: "error.main", fontSize: 13, mt: 1 }}
                  role="alert"
                >
                  {apiErrorMessage}
                </Typography>
              )}
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link href="/login" underline="hover" sx={{ fontWeight: 700 }}>
              Sign in
            </Link>
          </Typography>
        </Grid>
      </Box>
    </Grid>
  );
};
