import {useMemo, useState} from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import RecurringPaymentsSearchBar from "@/components/recurringPayments/RecurringPaymentsSearchBar";
import Navbar from "@/components/Navbar";
import {tokens} from "@/style/Theme";
import {useRecurringPaymentsTab} from "@/utils/useRecurringPaymentsTab";
import {filterItemsByName} from "@/utils/recurringPaymentsSearchUtils";

const SUBSCRIPTIONS_EMPTY_MESSAGE =
  "No subscriptions found. Add or detect subscriptions.";
const BILLS_EMPTY_MESSAGE = "No bills found.";
const NO_MATCHING_BILLS_MESSAGE = "No matching bills.";

export default function RecurringPayments() {
  const {activeTab, handleTabChange} = useRecurringPaymentsTab();

  const [billsSearchQuery, setBillsSearchQuery] = useState("");
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

  const filteredPayees = useMemo(
    () => filterItemsByName(payees, billsSearchQuery),
    [payees, billsSearchQuery],
  );

  const hasBillsSearch = billsSearchQuery.trim().length > 0;

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
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{fontWeight: 700, mb: 1}}>
                Recurring Payments
              </Typography>

              <Typography sx={{color: tokens.color.text.muted}}>
                Manage your subscriptions and recurring bill payments.
              </Typography>
            </Box>

            {/* Top section: controls and add payee */}
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: tokens.shadow.small,
              }}
            >
              <CardContent sx={{p: 3}}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" sx={{fontWeight: 600, mb: 0.5}}>
                      Manage Recurring Payments
                    </Typography>

                    <Typography sx={{color: tokens.color.text.muted}}>
                      Select a category or add a new bill payee.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{xs: "column", sm: "row"}}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{xs: "stretch", sm: "center"}}
                  >
                    <ToggleButtonGroup
                      value={activeTab}
                      exclusive
                      onChange={handleTabChange}
                      aria-label="Recurring payment categories"
                    >
                      <ToggleButton value="subscriptions">
                        Subscriptions
                      </ToggleButton>

                      <ToggleButton value="bills">
                        Bills
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {activeTab === "bills" && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setShowForm(prev => !prev);
                          setErrors({});
                        }}
                        sx={{
                          alignSelf: {xs: "stretch", sm: "auto"},
                        }}
                      >
                        Add New Payee
                      </Button>
                    )}
                  </Stack>

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
                      onClose={() => setSuccessMessage("")}
                    >
                      {successMessage}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Bottom section: existing items */}
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: tokens.shadow.small,
              }}
            >
              <CardContent sx={{p: 3}}>
                <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                  {activeTab === "subscriptions"
                    ? "Existing Subscriptions"
                    : "Existing Bill Payees"}
                </Typography>

                {activeTab === "bills" && (
                  <RecurringPaymentsSearchBar
                    value={billsSearchQuery}
                    onChange={event => setBillsSearchQuery(event.target.value)}
                    onClear={() => setBillsSearchQuery("")}
                    placeholder="Search by payee name..."
                    aria-label="Search bill payees"
                  />
                )}

                {activeTab === "subscriptions" &&
                  (subscriptions.length === 0 ? (
                    <RecurringEmptyState message={SUBSCRIPTIONS_EMPTY_MESSAGE} />
                  ) : (
                    <Stack spacing={2}>
                      {subscriptions.map(subscription => (
                        <RecurringSubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                        />
                      ))}
                    </Stack>
                  ))}

                {activeTab === "bills" &&
                  (payees.length === 0 ? (
                    <RecurringEmptyState message={BILLS_EMPTY_MESSAGE} />
                  ) : filteredPayees.length === 0 && hasBillsSearch ? (
                    <RecurringEmptyState message={NO_MATCHING_BILLS_MESSAGE} />
                  ) : (
                    <Stack spacing={2}>
                      {filteredPayees.map(payee => (
                        <RecurringPayeeCard
                          key={payee.id}
                          payee={payee}
                        />
                      ))}
                    </Stack>
                  ))}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
