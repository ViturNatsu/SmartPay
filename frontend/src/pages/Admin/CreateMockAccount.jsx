import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

function CreateMockAccount({ open, onClose, onSuccess }) {
  const { tokenClaims } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const accountTypes = ["CHECKING", "SAVINGS"];

  const [formData, setFormData] = useState({
    userId: "",
    accountName: "",
    accountNumber: "",
    institutionNumber: "",
    transitNumber: "",
    balance: "",
    type: accountTypes[0],
  });

  const [errors, setErrors] = useState({});
  const [serverResponse, setServerResponse] = useState(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.userId.trim()) {
      newErrors.userId = "Account user id is required";
    }

    if (!/^\d{3}$/.test(formData.institutionNumber)) {
      newErrors.institutionNumber =
        "Institution number must be exactly 3 digits";
    }

    if (!/^\d{5}$/.test(formData.transitNumber)) {
      newErrors.transitNumber = "Transit number must be exactly 5 digits";
    }

    if (!/^\d{7,12}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 7 to 12 digits";
    }

    if (formData.balance === "" || !/^\d+(\.\d{1,2})?$/.test(formData.balance) || Number(formData.balance) < 0) {
      newErrors.balance = "Balance must be a non-negative number with up to 2 decimal places";
}

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // only allow up to 2 decimal places for balance
    if (name === "balance") {
    if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
  }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      userId: "",
      accountName: "",
      accountNumber: "",
      institutionNumber: "",
      transitNumber: "",
      balance: "",
      active: true,
      type: accountTypes[0],
    });
    setErrors({});
    setServerError("");
    setServerResponse(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");
    setServerResponse(null);

    formData.userId === "" ? "1" : formData.userId; // Default to 1 if userId is empty

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Create Account object that matches backend CheckingAccount entity
      const accountPayload = {
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber,
        institutionNumber: formData.institutionNumber,
        transitNumber: formData.transitNumber,
        balance: parseFloat(formData.balance),
        type: formData.type,
        user: {
          id: Number(formData.userId),
        },
      };

      const response = await axiosInstance.post(
        "/api/v1/accounts",
        accountPayload,
      );

      setServerResponse(response.data);

      // Reset form
      setFormData({
        userId: "",
        accountName: "",
        accountNumber: "",
        institutionNumber: "",
        transitNumber: "",
        balance: "",
        active: true,
        type: accountTypes[0],
      });

      setErrors({});

      // Call the onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
          handleClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error creating account:", error);

      if (error.response?.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "Backend validation failed.";
        setServerError(errorMessage);
      } else if (error.response?.status === 403) {
        setServerError(
          "Access denied: You do not have permission to create accounts.",
        );
      } else if (error.response?.status === 401) {
        setServerError("Unauthorized: Please log in again.");
      } else if (error.response?.status === 404) {
        setServerError("User not found. Please ensure you are logged in.");
      } else {
        setServerError("Failed to connect to backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
        Create Mock Account
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Box>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  label="Account Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Select account type"
                  error={!!errors.type}
                  fullWidth
                >
                  {accountTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="User ID"
                name="userId"
                type="text"
                value={formData.userId}
                onChange={handleChange}
                placeholder="1"
                error={!!errors.userId}
                helperText={errors.userId}
                disabled={loading}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Account Name"
                name="accountName"
                type="text"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="e.g., Primary Checking"
                error={!!errors.accountName}
                helperText={errors.accountName}
                disabled={loading}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Institution Number"
                name="institutionNumber"
                type="text"
                value={formData.institutionNumber}
                onChange={handleChange}
                placeholder="123"
                error={!!errors.institutionNumber}
                helperText={errors.institutionNumber || "3 digits"}
                disabled={loading}
                inputProps={{ maxLength: "3", pattern: "[0-9]*" }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Transit Number"
                name="transitNumber"
                type="text"
                value={formData.transitNumber}
                onChange={handleChange}
                placeholder="12345"
                error={!!errors.transitNumber}
                helperText={errors.transitNumber || "5 digits"}
                disabled={loading}
                inputProps={{ maxLength: "5", pattern: "[0-9]*" }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="1234567"
                error={!!errors.accountNumber}
                helperText={errors.accountNumber || "7-12 digits"}
                disabled={loading}
                inputProps={{ maxLength: "12", pattern: "[0-9]*" }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Balance"
                name="balance"
                type="text"
                inputMode="decimal"
                value={formData.balance}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.balance}
                helperText={errors.balance || "Balance of the account"}
                disabled={loading}
                inputProps={{ step: "0.01" }}
              />
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="active"
                  value={formData.active === true ? true : false}
                  onChange={handleChange}
                  placeholder="Select account status"
                  error={!!errors.active}
                  fullWidth
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {serverError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {serverError}
            </Alert>
          )}

          {serverResponse && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Account created successfully! ID: {serverResponse.id}
            </Alert>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default CreateMockAccount;
