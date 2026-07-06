import {useState} from "react";
import {useSearchParams} from "react-router-dom";
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
} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import RecurringPayeeCard from "@/components/recurringPayments/RecurringPayeeCard";
import RecurringPayeeForm from "@/components/recurringPayments/RecurringPayeeForm";
import RecurringSubscriptionCard from "@/components/recurringPayments/RecurringSubscriptionCard";
import RecurringEmptyState from "@/components/recurringPayments/RecurringEmptyState";
import Navbar from "@/components/Navbar";
import {tokens} from "@/style/Theme";

const VALID_TABS = new Set(["subscriptions", "bills"]);
const DEFAULT_TAB = "subscriptions";

const SUBSCRIPTIONS_EMPTY_MESSAGE =
  "No subscriptions found. Add or detect subscriptions.";
const BILLS_EMPTY_MESSAGE = "No bills found.";

export default function RecurringPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.has(tabParam) ? tabParam : DEFAULT_TAB;

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

  const [subscriptions] = useState([
    // To be removed upon connecting to the backend
    {
      id: 1,
      name: "Netflix",
      amount: "15",
      schedule: "monthly",
      nextPaymentDate: "2026-07-10",
    },
    {
      id: 2,
      name: "Spotify",
      amount: "10",
      schedule: "monthly",
      nextPaymentDate: "2026-07-10",
    },
  ]);

  const [payees, setPayees] = useState([
    // To be removed upon connecting to the backend
    {
      id: 1,
      name: "Electric Company",
      amount: "120",
      schedule: "monthly",
      date: "2026-07-05",
    },
    {
      id: 2,
      name: "Water Company",
      amount: "20",
      schedule: "monthly",
      date: "2026-07-05",
    },
  ]);

  const handleTabChange = (_, newTab) => {
    if (newTab !== null) {
      setSearchParams({tab: newTab});
    }
  };

  const handleInputChange = event => {
    const {name, value} = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setErrors(prev => ({
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
      payee => payee.name.trim().toLowerCase() === normalizedName,
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

    setPayees(prev => [...prev, newPayee]);
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

  const resetForm = () => {
    setShowForm(false);
    setErrors({});
    setFormData({
      name: "",
      accountNumber: "",
      amount: "",
      schedule: "",
      date: "",
    });
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
        <Container maxWidth={false} sx={{px: {xs: 2, md: 3}}}>
          <Card
            sx={{
              minHeight: "calc(100vh - 120px)",
              p: {xs: 3, md: 5},
            }}
          >
            <Typography variant="h4" sx={{mb: 2}}>
              Recurring Payments
            </Typography>

            <Stack spacing={2} sx={{mb: 3, alignItems: "flex-start"}}>
              <ToggleButtonGroup
                value={activeTab}
                exclusive
                onChange={handleTabChange}
                aria-label="Recurring payment categories"
              >
                <ToggleButton value="subscriptions">Subscriptions</ToggleButton>
                <ToggleButton value="bills">Bills</ToggleButton>
              </ToggleButtonGroup>

              {activeTab === "bills" && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowForm(prev => !prev);
                    setErrors({});
                  }}
                >
                  Add New Payee
                </Button>
              )}
            </Stack>

            {activeTab === "subscriptions" &&
              (subscriptions.length === 0 ? (
                <RecurringEmptyState message={SUBSCRIPTIONS_EMPTY_MESSAGE} />
              ) : (
                subscriptions.map(subscription => (
                  <RecurringSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))
              ))}

            {activeTab === "bills" && showForm && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RecurringPayeeForm
                  formData={formData}
                  errors={errors}
                  isFormComplete={isFormComplete}
                  onInputChange={handleInputChange}
                  onConfirm={handleConfirm}
                  onCancel={resetForm}
                />
              </LocalizationProvider>
            )}

            {successMessage && (
              <Alert
                severity="success"
                sx={{mb: 2}}
                onClose={() => setSuccessMessage("")}
              >
                {successMessage}
              </Alert>
            )}

            {activeTab === "bills" &&
              (payees.length === 0 ? (
                <RecurringEmptyState message={BILLS_EMPTY_MESSAGE} />
              ) : (
                payees.map(payee => (
                  <RecurringPayeeCard key={payee.id} payee={payee} />
                ))
              ))}
          </Card>
        </Container>
      </Box>
    </>
  );
}
