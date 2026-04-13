import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useAuth } from "@/context/AuthContext";

const steps = ["Account Details", "Terms & Conditions", "Review & Submit"];

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

const accountTypes = ["Chequing", "Savings"];

export const OpenAccountForm = ({
  open,
  onClose,
  onSubmit,
  dialogTitle = "Open a New Account",
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    accountType: "",
    accountName: "",
    firstName: user?.firstName ?? "",
    middleName: "",
    lastName: user?.lastName ?? "",
    addressLine1: user?.addressLine1 ?? "",
    addressLine2: user?.addressLine2 || "",
    city: user?.city ?? "",
    province: user?.province ?? "",
    postalCode: user?.postalCode ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    sin: user?.socialInsuranceNumber ?? "",
    governmentId: user?.governmentIdNumber ?? "",
  });

  // Prefill form any time the dialog opens or when user data becomes available
  useEffect(() => {
    if (!open) return;
    setFormData({
      accountType: "",
      accountName: "",
      firstName: user?.firstName ?? "",
      middleName: "",
      lastName: user?.lastName ?? "",
      addressLine1: user?.addressLine1 ?? "",
      addressLine2: user?.addressLine2 ?? "",
      city: user?.city ?? "",
      province: user?.province ?? "",
      postalCode: user?.postalCode ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      sin: user?.socialInsuranceNumber ?? "",
      governmentId: user?.governmentIdNumber ?? "",
    });
  }, [open, user]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSubmit(formData);
      handleClose();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setTermsAccepted(false);
    setFormData({
      accountType: "",
      accountName: "",
      firstName: "",
      middleName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      phoneNumber: "",
      sin: "",
      governmentId: "",
    });
    onClose();
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        formData.accountType &&
        formData.accountName &&
        formData.firstName &&
        formData.lastName &&
        formData.addressLine1 &&
        formData.city &&
        formData.province &&
        formData.postalCode &&
        formData.phoneNumber &&
        formData.sin &&
        formData.governmentId
      );
    }
    if (activeStep === 1) {
      return termsAccepted;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Account Type and Name */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Account Type"
                required
                value={formData.accountType}
                onChange={handleChange("accountType")}
                fullWidth
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type.toUpperCase()}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Account Name"
                placeholder="e.g. Primary Chequing"
                required
                value={formData.accountName}
                onChange={handleChange("accountName")}
                fullWidth
              />
            </Box>

            {/* Legal Name */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Legal Name
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleChange("middleName")}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  fullWidth
                  disabled
                />
              </Box>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Address Line 1"
                    required
                    value={formData.addressLine1}
                    onChange={handleChange("addressLine1")}
                    fullWidth
                    disabled
                  />
                  <TextField
                    label="Address Line 2"
                    value={formData.addressLine2}
                    onChange={handleChange("addressLine2")}
                    fullWidth
                    disabled
                  />
                  <TextField
                    label="City"
                    required
                    value={formData.city}
                    onChange={handleChange("city")}
                    fullWidth
                    disabled
                  />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Province / Territory"
                    required
                    value={formData.province}
                    onChange={handleChange("province")}
                    fullWidth
                    disabled
                  >
                    {provinces.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Postal Code"
                    required
                    value={formData.postalCode}
                    onChange={handleChange("postalCode")}
                    fullWidth
                    disabled
                  />
                  <TextField
                    label="Phone Number"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    fullWidth
                    disabled
                  />
                </Box>
              </Box>
            </Box>

            {/* Identification Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Identification Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Social Insurance Number (SIN)"
                  required
                  value={formData.sin}
                  onChange={handleChange("sin")}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Government Issued ID Number"
                  placeholder="License, Passport, or Residence Card"
                  required
                  value={formData.governmentId}
                  onChange={handleChange("governmentId")}
                  fullWidth
                  disabled
                />
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Terms and Conditions
            </Typography>

            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                p: 3,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                1. Account Agreement
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                By opening an account with SmartPay, you agree to be bound by these Terms
                and Conditions, which constitute a legally binding agreement between you and
                SmartPay Financial Services. This agreement governs your use of chequing
                and savings accounts.
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                2. Eligibility
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                To open an account, you must be at least 18 years of age, a resident of
                Canada, and possess a valid government-issued identification document.
                SmartPay reserves the right to verify your identity and decline applications that
                do not meet our requirements.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              }
              label="I have read and accept the Terms and Conditions."
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Review & Submit
            </Typography>

            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      Account Type
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {formData.accountType}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      Account Name
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {formData.accountName}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      Legal Name
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {`${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {`${formData.addressLine1}, ${formData.addressLine2}, ${formData.city} ${formData.province}, Canada`.replace(
                        ", ,",
                        ","
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      Phone Number
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {formData.phoneNumber}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>
                      SIN
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {formData.sin.replace(/./g, "*").slice(0, -3) +
                        formData.sin.slice(-3)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Government ID</TableCell>
                    <TableCell>
                      {formData.governmentId.replace(/./g, "*").slice(0, -3) +
                        formData.governmentId.slice(-3)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
              Please review your information carefully before submitting. By submitting, you confirm
              that all information provided is accurate and complete.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: "center" }}>
          {dialogTitle}
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            "& .MuiStepLabel-label": {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                StepIconComponent={
                  index < activeStep
                    ? () => (
                        <CheckCircleRoundedIcon
                          sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                        />
                      )
                    : undefined
                }
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            onClick={activeStep === 0 ? handleClose : handleBack}
            variant="outlined"
            sx={{ textTransform: "none", px: 3 }}
          >
            {activeStep === 0 ? "Cancel" : "Previous"}
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid()}
            sx={{ textTransform: "none", px: 3 }}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OpenAccountForm;
