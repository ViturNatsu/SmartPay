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
import GovtIDIcon from '@mui/icons-material/AccountBox';

const CANADA_POSTAL_CODE_REGEX =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const OCCUPATION_REGEX = /^[A-Za-z0-9 .'-]+$/;
const CITY_REGEX = /^[A-Za-z0-9 .'-]+$/;
const MAX_OCCUPATION_LENGTH = 80;
const MAX_PHONE_LENGTH = 25;
const MAX_ADDRESS_LINE1_LENGTH = 120;
const MAX_ADDRESS_LINE2_LENGTH = 120;
const MAX_CITY_LENGTH = 80;

const CANADA_PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

const normalizeSin = (value) => value.replace(/[\s-]/g, "");
const normalizePhoneDigits = (value) => value.replace(/\D/g, "");
const normalizeIdNumber = (value) => value.trim().replace(/-/g, "").toUpperCase();
const normalizePostalCode = (value) => {
  const condensed = value.toUpperCase().replace(/\s+/g, "");
  if (condensed.length === 6) return `${condensed.slice(0, 3)} ${condensed.slice(3)}`;
  return value.toUpperCase().trim();
};

const isGovernmentIdValid = (governmentIdType, governmentIdNumber) => {
  const normalized = normalizeIdNumber(governmentIdNumber);
  if (governmentIdType === "PASSPORT") return /^[A-Z0-9]{6,11}$/.test(normalized);
  if (governmentIdType === "DRIVER_LICENSE") return /^[A-Z0-9]{5,15}$/.test(normalized);
  if (governmentIdType === "PRCARD_NUMBER") return /^[A-Z0-9]{9,12}$/.test(normalized);
  return false;
};

const getGovernmentIdValidationMessage = (governmentIdType) => {
  if (governmentIdType === "PASSPORT") {
    return "Passport number must be 6-11 alphanumeric characters (letters and numbers only).";
  }
  if (governmentIdType === "DRIVER_LICENSE") {
    return "Driver's licence number must be 5-15 alphanumeric characters (letters and numbers only).";
  }
  if (governmentIdType === "PRCARD_NUMBER") {
    return "PR card number must be 9-12 alphanumeric characters (letters and numbers only).";
  }
  return "Government ID Number is invalid.";
};

const isValidCanadianPhone = (value) => {
  const digits = normalizePhoneDigits(value);
  if (digits.length === 10) return true;
  return digits.length === 11 && digits.startsWith("1");
};

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
  const NAME_REGEX = /^[A-Za-z]+$/;
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

  const [step, setStep] = useState(1);

  const [socialInsuranceNumber, setSocialInsuranceNumber] = useState("");
  const [governmentIdType, setGovernmentIdType] = useState("PASSPORT");
  const [governmentIdNumber, setGovernmentIdNumber] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [dob, setDob] = useState("");
  const [country] = useState("Canada");
  const [step2Errors, setStep2Errors] = useState({});

  const validateStep1 = () => {
    setErrorMessage("");
    setFormError([]);
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
    } else if (!NAME_REGEX.test(firstName.trim())) {
      setFirstNameError(true);
      setFirstNameErrorMessage("First name must contain only letters.");
      errors.push("First name must contain only letters.");
    } else {
      setFirstNameError(false);
      setFirstNameErrorMessage("");
    }
    if (!lastName.trim()) {
      setLastNameError(true);
      setLastNameErrorMessage("Last name is required.");
      errors.push("Last name is required.");
    } else if (!NAME_REGEX.test(lastName.trim())) {
      setLastNameError(true);
      setLastNameErrorMessage("Last name must contain only letters.");
      errors.push("Last name must contain only letters.");
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
    // setSuccessMessage("");

    //     if (isEmailInvalid || isPasswordInvalid || isConfirmInvalid) {
    //       setErrorMessage("Please fill the required fields correctly before continuing.");
    //       return false;
    //     }
    //
    //     setErrorMessage("");
    //     return true;
    //   };
    if (errors.length > 0) {
      setFormError(errors);
      if (firstInvalidRef?.current) {
        firstInvalidRef.current.focus();
      }
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      return;
    }

    setStep(2);
  };

  const validateStep2 = () => {
    const errors = {};
    const normalizedSin = normalizeSin(socialInsuranceNumber);
    const normalizedPostalCode = normalizePostalCode(postalCode);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!normalizedSin) {
      errors.socialInsuranceNumber = "Social Insurance Number is required.";
    } else if (!/^\d{9}$/.test(normalizedSin)) {
      errors.socialInsuranceNumber = "SIN must be exactly 9 digits.";
    }

    const trimmedOccupation = occupation.trim();
    if (!trimmedOccupation) {
      errors.occupation = "Occupation is required.";
    } else if (trimmedOccupation.length < 2 || trimmedOccupation.length > MAX_OCCUPATION_LENGTH) {
      errors.occupation = `Occupation must be 2-${MAX_OCCUPATION_LENGTH} characters.`;
    } else if (!/[A-Za-z]/.test(trimmedOccupation)) {
      errors.occupation = "Occupation must include at least one letter.";
    } else if (!OCCUPATION_REGEX.test(trimmedOccupation)) {
      errors.occupation = "Occupation contains invalid characters.";
    }

    if (!governmentIdNumber.trim()) {
      errors.governmentIdNumber = "Government ID Number is required.";
    } else if (!isGovernmentIdValid(governmentIdType, governmentIdNumber)) {
      errors.governmentIdNumber = getGovernmentIdValidationMessage(governmentIdType);
    }

    if (!dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      const dobDate = new Date(dob);
      if (Number.isNaN(dobDate.getTime())) {
        errors.dob = "Date of Birth is invalid.";
      } else {
        dobDate.setHours(0, 0, 0, 0);
        if (dobDate > now) {
          errors.dob = "Date of Birth cannot be in the future.";
        }
      }
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      errors.phoneNumber = "Phone Number is required.";
    } else if (trimmedPhone.length > MAX_PHONE_LENGTH) {
      errors.phoneNumber = `Phone Number cannot exceed ${MAX_PHONE_LENGTH} characters.`;
    } else if (!isValidCanadianPhone(trimmedPhone)) {
      errors.phoneNumber = "Phone Number must be 10 digits (optional +1).";
    }

    const trimmedAddressLine1 = addressLine1.trim();
    if (!trimmedAddressLine1) {
      errors.addressLine1 = "Address Line 1 is required.";
    } else if (
      trimmedAddressLine1.length < 5 ||
      trimmedAddressLine1.length > MAX_ADDRESS_LINE1_LENGTH
    ) {
      errors.addressLine1 = `Address Line 1 must be 5-${MAX_ADDRESS_LINE1_LENGTH} characters.`;
    }

    if (addressLine2.trim().length > MAX_ADDRESS_LINE2_LENGTH) {
      errors.addressLine2 = `Address Line 2 cannot exceed ${MAX_ADDRESS_LINE2_LENGTH} characters.`;
    }

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      errors.city = "City is required.";
    } else if (trimmedCity.length < 2 || trimmedCity.length > MAX_CITY_LENGTH) {
      errors.city = `City must be 2-${MAX_CITY_LENGTH} characters.`;
    } else if (!CITY_REGEX.test(trimmedCity)) {
      errors.city = "City contains invalid characters.";
    }

    if (!province) {
      errors.province = "Province is required.";
    }

    if (!postalCode.trim()) {
      errors.postalCode = "Postal Code is required.";
    } else if (!CANADA_POSTAL_CODE_REGEX.test(normalizedPostalCode)) {
      errors.postalCode = "Postal Code must match Canadian format (A1A 1A1).";
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearStep2Error = (fieldName) => {
    setStep2Errors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!validateStep2()) {
      setErrorMessage("Please correct the highlighted fields.");
      return;
    }

    setIsLoading(true);
    setStep2Errors({});

    const userInfo = {
      firstName: firstName,
      lastName: lastName,
      institution: institution,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      customer: {
        socialInsuranceNumber: normalizeSin(socialInsuranceNumber),
        occupation: occupation.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        province,
        postalCode: normalizePostalCode(postalCode),
        country,
        phoneNumber: normalizePhoneDigits(phoneNumber),
        governmentIdType,
        governmentIdNumber: normalizeIdNumber(governmentIdNumber),
        dob,
      },
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
              <Box sx={{ fontSize: "0.9rem", color: "error.main" }} role="alert">
                We can’t create an account with that email. Please{" "}
                <Link component="button" underline="hover" sx={{ fontSize: "inherit", verticalAlign: "baseline" }} onClick={() => navigate("/login")}>
                  Sign in
                </Link>
                {" or "}
                <Link component="button" underline="hover" sx={{ fontSize: "inherit", verticalAlign: "baseline" }} onClick={() => navigate("/reset-password")}>
                  reset your password
                </Link>
                .
              </Box>
            )}


            {step === 1 && (
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
                                sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                              />
                            </InputAdornment>
                          ),
                          "data-testid": "first-name-input"
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
                                sx={{ color: "rgba(15, 23, 42, 0.45)" }}
                              />
                            </InputAdornment>
                          ),
                          "data-testid": "last-name-input"
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
                          <BankIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                        </InputAdornment>
                      ),
                      "data-testid": "institution-input"
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
                  <MenuItem value="World">World Bank of Canada</MenuItem>
                  <MenuItem value="TD">TD Bank</MenuItem>
                  <MenuItem value="FDM">FDM Bank</MenuItem>
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
                          <MailIcon sx={{ color: "rgba(15, 23, 42, 0.45)" }} />
                        </InputAdornment>
                      ),
                      "data-testid": "email-input"
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
            )}

            {step === 2 && (
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

                <Typography component="div"
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "left",
                    mt: -1,
                    mb: -1,
                  }}
                >
                  <Box component="span">
                    <input type="checkbox" id="terms" required></input>
                    <label htmlFor="terms">
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
                  </Box>
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
    </Grid>
  );
};
