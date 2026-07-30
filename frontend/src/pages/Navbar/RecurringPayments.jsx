import { useEffect, useMemo, useState } from "react";
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
import {
  addRecurringPayee,
  getRecurringPayees,
} from "@/api/recurringPayment/recurringPayeeApi";

const SUBSCRIPTIONS_EMPTY_MESSAGE =
  "No subscriptions found. Add or detect subscriptions.";
const BILLS_EMPTY_MESSAGE = "No bills found.";
const NO_MATCHING_BILLS_MESSAGE = "No matching bills.";
const NO_MATCHING_SUBSCRIPTIONS_MESSAGE = "No matching subscriptions.";

export default function RecurringPayments() {
  const {activeTab, handleTabChange} = useRecurringPaymentsTab();

  const [subscriptionsSearchQuery, setSubscriptionsSearchQuery] = useState("");
  const [billsSearchQuery, setBillsSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "99990001",
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

  const [payees, setPayees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRecurringPayees = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getRecurringPayees();

      const recurringPayees = Array.isArray(data) ? data : [];

      const mappedPayees = recurringPayees.map((payee) => ({
        id: payee.payeeId,
        name: payee.payeeName,
        accountNumber:
          payee.accountNumber ??
          payee.recipientIdentifier ??
          "",
        amount: payee.amount,
        schedule: payee.schedule,
        date: payee.date,
      }));

      setPayees(mappedPayees);
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Unable to load recurring payees. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecurringPayees();
  }, []);

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
    } else if (formData.name.trim().length > 30) {
      newErrors.name = "Payee Name cannot exceed 30 characters.";
    } else if (!/^[A-Za-z0-9 ]+$/.test(formData.name.trim())) {
      newErrors.name = "Payee Name cannot contain special characters.";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account Number is required.";
    }

    const amountValue = Number(formData.amount);

    if (!formData.amount) {
      newErrors.amount = "Amount is required.";
    } else if (Number.isNaN(amountValue)) {
      newErrors.amount = "Amount must be a valid number.";
    } else if (amountValue < 1) {
      newErrors.amount = "Amount must be greater than 1.";
    } else if (!/^\d+(\.\d{1,3})?$/.test(amountText)) {
      newErrors.amount = "Amount can have a maximum of 3 decimal places.";
    }

    if (!formData.schedule) {
      newErrors.schedule = "Please select a schedule.";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date.";
    } else {
      const selectedDate = new Date(`${formData.date}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date =
          "Past dates are not allowed for recurring payments.";
      }
    }


    const duplicateRecurringPayee = payees.some((payee) => {
    const sameName =
      String(payee.name ?? "").trim().toLowerCase() ===
      formData.name.trim().toLowerCase();

    const sameAccountNumber =
      String(payee.accountNumber ?? "").trim().toLowerCase() ===
      formData.accountNumber.trim().toLowerCase();

    const sameAmount =
      Number(payee.amount) === Number(formData.amount);

    const sameSchedule =
      String(payee.schedule ?? "").trim().toUpperCase() ===
      formData.schedule.trim().toUpperCase();

    const sameDate =
      String(payee.date ?? "") === formData.date;

    return (
      sameName &&
      sameAccountNumber &&
      sameAmount &&
      sameSchedule &&
      sameDate
    );
  });

  if (duplicateRecurringPayee) {
    newErrors.name =
      "An identical recurring payment already exists.";
  }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    const payload = {
      payeeName: formData.name.trim(),
      recipientIdentifier: formData.accountNumber,
      amount: Number(formData.amount),
      schedule: formData.schedule.toUpperCase(),
      date: formData.date,
      type: activeTab === "bills" ? "BILL" : "SUBSCRIPTION",
    };

    try {
      setIsSubmitting(true);

      await addRecurringPayee(payload);
      await loadRecurringPayees();
      setSuccessMessage("Recurring payment added successfully.");

      setFormData({
        name: "",
        accountNumber: "99990001",
        amount: "",
        schedule: "",
        date: "",
      });

      setErrors({});
      setShowForm(false);
    } catch (error) {
      if (!error.response) {
        setErrorMessage(
          "Unable to connect to the server. Check your connection and try again.",
        );
      } else if (error.response.status >= 500) {
        setErrorMessage(
          "The server encountered an error. Please try again.",
        );
      } else {
        setErrorMessage(
          error.response.data?.message ||
            "Unable to create the recurring payment.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setErrors({});
    setFormData({
      name: "",
      accountNumber: "99990001",
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

    const filteredSubscriptions = useMemo(
    () => filterItemsByName(subscriptions, subscriptionsSearchQuery),
    [subscriptions, subscriptionsSearchQuery],
  );

 const filteredPayees = useMemo(() => {
    const normalizedQuery = billsSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return payees;
    }

    return payees.filter(payee =>
      String(payee.name ?? "")
        .trim()
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [payees, billsSearchQuery]);

  const hasBillsSearch = billsSearchQuery.trim().length > 0;
  const hasSubscriptionsSearch = subscriptionsSearchQuery.trim().length > 0;

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
                      isSubmitting={isSubmitting}
                      onInputChange={handleInputChange}
                      onConfirm={handleConfirm}
                      onCancel={resetForm}
                    />
                  </LocalizationProvider>
                )}

            {activeTab === "subscriptions" && (
              <RecurringPaymentsSearchBar
                value={subscriptionsSearchQuery}
                onChange={e => setSubscriptionsSearchQuery(e.target.value)}
                onClear={() => setSubscriptionsSearchQuery("")}
                placeholder="Search by subscription name..."
                aria-label="Search subscriptions"
              />
            )}

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
              ) : filteredPayees.length === 0 && hasBillsSearch ? (
                <RecurringEmptyState message={NO_MATCHING_BILLS_MESSAGE} />
              ) : (
                filteredPayees.map(payee => (
                  <RecurringPayeeCard key={payee.id} payee={payee} />
                ))
              ))}
            
            {activeTab === "subscriptions" &&
              (subscriptions.length === 0 && hasSubscriptionsSearch ? (
                <RecurringEmptyState message={SUBSCRIPTIONS_EMPTY_MESSAGE} />
              ) : (
                filteredSubscriptions.map(subscription => (
                  <RecurringSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))
              ))}


                {errorMessage && (
                  <Alert
                    severity="error"
                    onClose={() => setErrorMessage("")}
                  >
                    {errorMessage}
                  </Alert>
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

                {activeTab === "subscriptions" && (
                  <RecurringPaymentsSearchBar
                    value={subscriptionsSearchQuery}
                    onChange={event =>
                      setSubscriptionsSearchQuery(event.target.value)
                    }
                    onClear={() => setSubscriptionsSearchQuery("")}
                    placeholder="Search by subscription name..."
                    aria-label="Search subscriptions"
                  />
                )}

                {activeTab === "bills" && (
                  <RecurringPaymentsSearchBar
                    value={billsSearchQuery}
                    onChange={eventOrValue => {
                      const nextValue =
                        typeof eventOrValue === "string"
                          ? eventOrValue
                          : eventOrValue.target.value;

                      setBillsSearchQuery(nextValue);
                    }}
                    onClear={() => setBillsSearchQuery("")}
                    placeholder="Search by payee name..."
                    aria-label="Search bill payees"
                  />
                )}

                {activeTab === "subscriptions" &&
                  (subscriptions.length === 0 ? (
                    <RecurringEmptyState message={SUBSCRIPTIONS_EMPTY_MESSAGE} />
                  ) : filteredSubscriptions.length === 0 &&
                    hasSubscriptionsSearch ? (
                    <RecurringEmptyState
                      message={NO_MATCHING_SUBSCRIPTIONS_MESSAGE}
                    />
                  ) : (
                    <Stack spacing={2}>
                      {filteredSubscriptions.map(subscription => (
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
