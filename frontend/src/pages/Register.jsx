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
import SecurityIcon from "@mui/icons-material/Security";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import logo from "../assets/logo.png";
import Alert from "@mui/material/Alert";
import { register } from "../api/authApi";

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

  const bulletContainerSx = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "0px",
    gap: "16px",
    width: "427.86px",
    maxWidth: "448px",
    height: "68px",
  };

  const bulletBoxSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0px",
    gap: "4px",
  };

  const bulletBoxHeadingSx = {
    width: "150.39px",
    height: "24px",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "24px",
    /* identical to box height, or 150% */
    display: "flex",
    alignItems: "center",
    color: "#111827",
  };

  const bulletBoxInfoSx = {
    width: "341.13px",
    height: "40px",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "20px",
    display: "flex",
    color: "#4B5563",
    textAlign: "left",
  };

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
      setEmailErrorMessage("Email required.");
      setErrorMessage(
        "We can't process your request right now because you have errors that need to be fixed",
      );
      errors.push("Email required.");
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
          {/* small bullet points section w icons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 0 },
              padding: "16px 0px 0px",
              gap: "24px",
              width: "427.86px",
              height: "176px",
            }}
          >
            <Box sx={bulletContainerSx}>
              <Avatar
                variant="rounded"
                sx={{
                  backgroundColor: "#DBEAFE",
                  borderRadius: 2,
                }}
              >
                <SecurityIcon sx={{ color: "#2563EB" }}></SecurityIcon>
              </Avatar>
              <Box sx={bulletBoxSx}>
                <Typography sx={bulletBoxHeadingSx}>
                  Bank-level Security
                </Typography>
                <Typography sx={bulletBoxInfoSx}>
                  Your data is encrypted and protected with industry-leading
                  security standards.
                </Typography>
              </Box>
            </Box>
            <Box sx={bulletContainerSx}>
              <Avatar
                variant="rounded"
                sx={{
                  backgroundColor: "#d4fafe",
                  borderRadius: 2,
                }}
              >
                <FlashOnIcon sx={{ color: "#0891B2" }}></FlashOnIcon>
              </Avatar>
              <Box sx={bulletBoxSx}>
                <Typography sx={bulletBoxHeadingSx}> Instant Setup</Typography>
                <Typography sx={bulletBoxInfoSx}>
                  Get started in minutes and connect your financial institutions
                  seamlessly.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
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
                      <PasswordIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
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
                        sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  "data-testid": "password-input"
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
                      <PasswordIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  "data-testid": "confirm-password-input"
                },
              }}
            />

            {/* STEP 1 BUTTON - Continue (Takes you to Step 2 - Detailed Personal Info)*/}
            <Button
              variant="contained"
              type="button"
              onClick={handleContinue}
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                mb: 2,
                boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
              }}
            >
              Continue →
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
          </>
        )}

        {step === 2 && (
          <>
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
                  Social Insurance Number
                </Typography>
                <TextField
                  fullWidth
                  value={socialInsuranceNumber}
                  onChange={(e) => {
                    setSocialInsuranceNumber(e.target.value);
                    clearStep2Error("socialInsuranceNumber");
                  }}
                  error={Boolean(step2Errors.socialInsuranceNumber)}
                  helperText={step2Errors.socialInsuranceNumber || ""}
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
                  Occupation
                </Typography>
                <TextField
                  fullWidth
                  value={occupation}
                  onChange={(e) => {
                    setOccupation(e.target.value);
                    clearStep2Error("occupation");
                  }}
                  error={Boolean(step2Errors.occupation)}
                  helperText={step2Errors.occupation || ""}
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
              Government ID Type
            </Typography>
            <TextField
              select
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GovtIDIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                    </InputAdornment>
                  ),
                  "data-testid": "governmentIDType-input"
                },

              }}
              value={governmentIdType}
              onChange={(e) => {
                setGovernmentIdType(e.target.value);
                clearStep2Error("governmentIdNumber");
              }}
              placeholder="Select GovernmentID Type"
              sx={{ mb: 0 }}
            >
              <MenuItem value="PASSPORT">Passport</MenuItem>
              <MenuItem value="DRIVER_LICENSE">License</MenuItem>
              <MenuItem value="PRCARD_NUMBER">Resident Card</MenuItem>
            </TextField>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
              }}
            >
              Government ID Number
            </Typography>
            <TextField
              type="governmentID Number"
              value={governmentIdNumber}
              onChange={(e) => {
                setGovernmentIdNumber(e.target.value);
                clearStep2Error("governmentIdNumber");
              }}
              error={Boolean(step2Errors.governmentIdNumber)}
              helperText={step2Errors.governmentIdNumber || ""}
            />

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
                  Date of Birth
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    clearStep2Error("dob");
                  }}
                  error={Boolean(step2Errors.dob)}
                  helperText={step2Errors.dob || ""}
                  slotProps={{ inputLabel: { shrink: true } }}
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
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    clearStep2Error("phoneNumber");
                  }}
                  error={Boolean(step2Errors.phoneNumber)}
                  helperText={step2Errors.phoneNumber || ""}
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
              Address Line 1
            </Typography>
            <TextField
              type="address 1"
              value={addressLine1}
              onChange={(e) => {
                setAddressLine1(e.target.value);
                clearStep2Error("addressLine1");
              }}
              error={Boolean(step2Errors.addressLine1)}
              helperText={step2Errors.addressLine1 || ""}
            />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                mb: -1,
              }}
            >
              Address Line 2
            </Typography>
            <TextField
              type="address 2"
              value={addressLine2}
              onChange={(e) => {
                setAddressLine2(e.target.value);
                clearStep2Error("addressLine2");
              }}
              error={Boolean(step2Errors.addressLine2)}
              helperText={step2Errors.addressLine2 || ""}
            />

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
                  City
                </Typography>
                <TextField
                  fullWidth
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    clearStep2Error("city");
                  }}
                  error={Boolean(step2Errors.city)}
                  helperText={step2Errors.city || ""}
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
                  Province
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    clearStep2Error("province");
                  }}
                  error={Boolean(step2Errors.province)}
                  helperText={step2Errors.province || ""}
                >
                  <MenuItem value="">Select Province</MenuItem>
                  {CANADA_PROVINCES.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

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
                  Postal Code
                </Typography>
                <TextField
                  fullWidth
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    clearStep2Error("postalCode");
                  }}
                  error={Boolean(step2Errors.postalCode)}
                  helperText={step2Errors.postalCode || ""}
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
                  Country
                </Typography>
                <TextField
                  fullWidth
                  value={country}
                  disabled
                />
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                textAlign: "left",
                mt: -1,
                mb: -1,
              }}
            >
              <p>
                  <input type="checkbox" id="terms" required></input>
                  <label for="terms">
                    {" "}
                    I agree to the{' '}  
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}              
                    and
                    {' '}              
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </p>
            </Typography>

            {/* STEP 2 BUTTONS - Create Account and Back(Takes you back to Step 1)*/}
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
            <Button
              variant="contained"
              onClick={() => setStep(1)}
              sx={{
                alignSelf: "flex-start",
                mb: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              ← Back
            </Button>
          </Box>
          </>
        )}


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
                <p>
                  <input type="checkbox" id="terms" required></input>
                  <label for="terms">
                    {" "}
                    I agree to the{' '}  
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}              
                    and
                    {' '}              
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </p>
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
