import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  MenuItem,
  TextField,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import { tokens } from "@/style/Theme";

export default function RecurringPayments() {
  const [tab, setTab] = useState("bills");
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    amount: "",
    schedule: "",
    date: "",
  });

  const [payees, setPayees] = useState([
    {
        id: 1,
        name: "Electric Company",
        amount: "120",
        schedule: "monthly",
        date: "2026-07-05",
    },
  ]);

  const handleTabChange = (_, newTab) => {
    if (newTab !== null) {
      setTab(newTab);
    }
  };
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
        ...prev,
        [name]: value,
    }));

    setErrors((prev) => ({
        ...prev,
        [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
        newErrors.name = "Name is required.";
    }

    if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = "Account Number is required.";
    }

    const amountValue = Number(formData.amount);

    if (!formData.amount) {
    newErrors.amount = "Amount is required.";
    } else if (Number.isNaN(amountValue)) {
    newErrors.amount = "Amount must be a valid number.";
    } else if (amountValue <= 0) {
    newErrors.amount = "Amount must be greater than 0.";
    }

    if (!formData.schedule) {
        newErrors.schedule = "Please select a schedule.";
    }

    if (!formData.date) {
        newErrors.date = "Please select a date.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
        return;
    }
    const newPayee = {
        id: Date.now(),
        ...formData,
    };

    setPayees((prev) => [...prev, newPayee]);
    setSuccessMessage("Payee added successfully!");

    setFormData({
        name: "",
        accountNumber: "",
        amount: "",
        schedule: "",
        date: "",
    });

    setShowForm(false);
  };

  const formatSchedule = (schedule) => {
    if (schedule === "monthly") return "Monthly";
    if (schedule === "yearly") return "Yearly";
    return schedule;
  };

    const formatDueDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    });
  };

  return (
    <>
  <Navbar />

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: tokens.color.background.app,
          py: tokens.layout.sectionGap,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              backgroundColor: tokens.color.background.surface,
              border: `1px solid ${tokens.color.border.light}`,
              borderRadius: tokens.borderRadius.xl,
              p: 4,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              Recurring Payments
            </Typography>

            <Stack spacing={2} sx={{ mb: 3, alignItems: "flex-start" }}>
            <ToggleButtonGroup
                value={tab}
                exclusive
                onChange={handleTabChange}
            >
                <ToggleButton value="subscriptions">Subscriptions</ToggleButton>
                <ToggleButton value="bills">Bills</ToggleButton>
            </ToggleButtonGroup>

            {tab === "bills" && (
                <Button
                variant="contained"
                onClick={() => {
                    setShowForm((prev) => !prev);
                    setErrors({});
                }}
                >
                Add New Payee
                </Button>
            )}
            </Stack>

            {tab === "subscriptions" && (
              <Card sx={{ p: tokens.card.padding }}>
                <Typography fontWeight={tokens.typography.fontWeight.bold}>
                  Netflix
                </Typography>
                <Typography variant="body2">$15 • Monthly</Typography>
                <Typography variant="body2">Next payment: July 10</Typography>

                <Stack direction="row" spacing={tokens.card.actionGap} sx={{ mt: 1.5 }}>
                  <Button variant="contained" size="small">
                    View
                  </Button>
                  <Button variant="outlined" size="small">
                    Edit
                  </Button>
                  <Button variant="outlined" size="small">
                    Cancel
                  </Button>
                </Stack>
              </Card>
            )}

            {tab === "bills" && showForm && (
                <Card
                    sx={{
                    p: tokens.layout.pagePadding,
                    mb: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                    Add New Payee
                    </Typography>

                    <Stack spacing={2}>
                    <TextField
                    label="Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    />

                    <TextField
                    label="Account Number *"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                    fullWidth
                    />

                    <TextField
                        label="Amount *"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        fullWidth
                        type="number"
                        inputProps={{
                            min: 0,
                            step: "0.01",
                        }}
                    />

                    <TextField
                    select
                    label="Recurring Schedule *"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    error={!!errors.schedule}
                    helperText={errors.schedule}
                    fullWidth
                    >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    </TextField>

                    <TextField
                    label="Date *"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    error={!!errors.date}
                    helperText={errors.date}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    />

                    <Button
                    variant="contained"
                    sx={{ width: "fit-content" }}
                    onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                    </Stack>
                </Card>
            )}

            {/* ✅ Success message goes HERE */}
            {successMessage && (
            <Alert
                severity="success"
                sx={{ mb: 2 }}
                onClose={() => setSuccessMessage("")}
            >
                {successMessage}
            </Alert>
            )}

            
            {tab === "bills" &&
            payees.map((payee) => (
                <Card key={payee.id} sx={{ p: tokens.card.padding, mb: 2 }}>
                <Typography fontWeight={tokens.typography.fontWeight.bold}>
                    {payee.name}
                </Typography>

                <Typography variant="body2">${payee.amount}</Typography>

                <Typography variant="body2">
                    Due {formatDueDate(payee.date)} • {formatSchedule(payee.schedule)}
                </Typography>

                <Stack direction="row" spacing={tokens.card.actionGap} sx={{ mt: 1.5 }}>
                    <Button variant="contained" size="small">
                    View
                    </Button>
                    <Button variant="outlined" size="small">
                    Edit
                    </Button>
                    <Button variant="outlined" size="small">
                    Cancel
                    </Button>
                </Stack>
                </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </>
  );
}