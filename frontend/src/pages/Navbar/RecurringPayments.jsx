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
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import RecurringPayeeCard from "@/components/recurringPayments/RecurringPayeeCard";
import RecurringPayeeForm from "@/components/recurringPayments/RecurringPayeeForm";
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

    const normalizedName = formData.name.trim().toLowerCase();

    const duplicatePayee = payees.some(
      (payee) => payee.name.trim().toLowerCase() === normalizedName
    );

    if (duplicatePayee) {
      newErrors.name = "A payee with this name already exists.";
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

  const formatAmount = (amount) => {
    return Number(amount).toFixed(2);
  };

  const isFormComplete =
    formData.name.trim() &&
    formData.accountNumber.trim() &&
    formData.amount &&
    Number(formData.amount) > 0 &&
    formData.schedule &&
    formData.date;

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
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RecurringPayeeForm
                  formData={formData}
                  errors={errors}
                  isFormComplete={isFormComplete}
                  onInputChange={handleInputChange}
                  onConfirm={handleConfirm}
                  onCancel={() => {
                    setShowForm(false);
                    setErrors({});
                    setFormData({
                      name: "",
                      accountNumber: "",
                      amount: "",
                      schedule: "",
                      date: "",
                    });
                  }}
                />
              </LocalizationProvider>
            )}

            {/* Success message  */}
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
              <RecurringPayeeCard
                key={payee.id}
                payee={payee}
                formatAmount={formatAmount}
                formatDueDate={formatDueDate}
                formatSchedule={formatSchedule}
              />
            ))}
          </Box>
        </Container>
      </Box>
    </>
  );
}