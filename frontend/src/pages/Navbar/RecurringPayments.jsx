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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import RecurringPayeeCard from "@/components/recurringPayments/RecurringPayeeCard";
import RecurringPayeeForm from "@/components/recurringPayments/RecurringPayeeForm";
import RecurringSubscriptionCard from "@/components/recurringPayments/RecurringSubscriptionCard";
import RecurringSubscriptionForm from "@/components/recurringPayments/RecurringSubscriptionForm";
import RecurringEmptyState from "@/components/recurringPayments/RecurringEmptyState";
import RecurringPaymentsSearchBar from "@/components/recurringPayments/RecurringPaymentsSearchBar";
import Navbar from "@/components/Navbar";
import { tokens } from "@/style/Theme";
import { useAuth } from "@/context/AuthContext";
import { useRecurringPaymentsTab } from "@/utils/useRecurringPaymentsTab";
import { filterItemsByName } from "@/utils/recurringPaymentsSearchUtils";
import {
  addRecurringPayee,
  getRecurringPayees,
  updateRecurringPayee,
  cancelRecurringPayee,
} from "@/api/recurringPayment/recurringPayeeApi";
import { BasicPageLayout } from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
import { getPaymentMethodsForUserWithId } from "@/api/paymentmethods/paymentmethodApi";
import RecurringPaymentEditDialog from "@/components/recurringPayments/RecurringPaymentEditDialog";
import RecurringPaymentCancelDialog from "@/components/recurringPayments/RecurringPaymentCancelDialog";
import RecurringPaymentDetail from "../../components/recurringPayments/RecurringPaymentDetail";
import { FilterAltOutlined } from "@mui/icons-material";
import RecurringBillFilterMenu from "../../components/recurringPayments/RecurringBillFilterMenu";

const SUBSCRIPTIONS_EMPTY_MESSAGE =
  "No subscriptions found. Add or detect subscriptions.";
const BILLS_EMPTY_MESSAGE = "No bills found.";
const NO_MATCHING_BILLS_MESSAGE = "No matching bills.";
const NO_MATCHING_SUBSCRIPTIONS_MESSAGE = "No matching subscriptions.";

export default function RecurringPayments() {
  const { activeTab, handleTabChange } = useRecurringPaymentsTab();
  const { tokenClaims } = useAuth();

  const [editingPayee, setEditingPayee] = useState(null);
  const [cancellingPayee, setCancellingPayee] = useState(null);

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
    endDate: "",
  });

  const [subscriptionFormData, setSubscriptionFormData] = useState({
    name: "",
    amount: "",
    schedule: "",
    date: "",
    paymentMethodId: "",
  });
  const [subscriptionErrors, setSubscriptionErrors] = useState({});

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [payees, setPayees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewingItem, setViewingItem] = useState(null);

  const [billFilters, setBillFilters] = useState({
    status: [],
    schedule: []
  });

  const [showBillFilters, setShowBillFilters] = useState(false);
  const billFilterCount =
    billFilters.status.length +
    billFilters.schedule.length;

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
        endDate: payee.endDate,
        type: payee.type,
        startPaymentDate: payee.startDate,
        nextPaymentDate: payee.date,
        status: payee.status,
        paymentMethodId: payee.paymentMethodId,
        bankDisplayName: payee.paymentMethodBankDisplayName,
        account_type: payee.paymentMethodAccountType,
        account_number: payee.paymentMethodAccountNumberMasked,
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

  const handleEditRecurringPayee = payee => {
    setEditingPayee(payee);
  };

  const handleSaveRecurringPayee = async changes => {
    if (!editingPayee) {
      return;
    }

    setErrorMessage("");

    const payload = {
      payeeName: editingPayee.name,
      recipientIdentifier: editingPayee.accountNumber,
      amount: changes.amount,
      schedule: editingPayee.schedule,
      date: changes.date,
      endDate: changes.endDate,
      type: editingPayee.type,
      paymentMethodId: editingPayee.paymentMethodId,
    };

    try {
      setIsSubmitting(true);

      await updateRecurringPayee(editingPayee.id, payload);

      await loadRecurringPayees();

      setEditingPayee(null);
      setSuccessMessage("Recurring payment updated successfully.");
    } catch (error) {
      setErrorMessage(
        error?.data?.message ||
        error?.message ||
        "Unable to update recurring payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRecurringPayee = payee => {
    setCancellingPayee(payee);
  };

  const handleConfirmCancelRecurringPayee = async () => {
    if (!cancellingPayee) {
      return;
    }

    setErrorMessage("");

    try {
      setIsSubmitting(true);

      await cancelRecurringPayee(cancellingPayee.id);

      await loadRecurringPayees();

      setCancellingPayee(null);
      setViewingItem(null);
      setSuccessMessage("Recurring payment cancelled successfully.");
    } catch (error) {
      setErrorMessage(
        error?.data?.message ||
        error?.message ||
        "Unable to cancel recurring payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPaymentMethods = async () => {
    if (!tokenClaims?.userId) return;

    try {
      const res = await getPaymentMethodsForUserWithId(tokenClaims.userId, 0);
      const active = (res.content ?? []).filter((m) => m.active);
      setPaymentMethods(active);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  useEffect(() => {
    loadRecurringPayees();
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [tokenClaims?.userId]);

  const handleInputChange = event => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubscriptionInputChange = event => {
    const { name, value } = event.target;

    setSubscriptionFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setSubscriptionErrors(prev => ({
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

    if (!formData.amount) {
      newErrors.amount = "Amount is required.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount.trim())) {
      newErrors.amount = "Amount can have a maximum of 2 decimal places.";
    } else {
      const amountValue = Number(formData.amount);

      if (Number.isNaN(amountValue)) {
        newErrors.amount = "Amount must be a valid number.";
      } else if (amountValue < 1) {
        newErrors.amount = "Amount must be at least $1.00.";
      } else if (amountValue > 10000) {
        newErrors.amount = "Amount cannot exceed $10,000.00.";
      }
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

    if (!formData.endDate) {
      newErrors.endDate = "Please select an end date.";
    } else {
      const selectedDate = new Date(`${formData.endDate}T00:00:00`);
      const paymentDate = new Date(`${formData.date}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate <= paymentDate) {
        newErrors.endDate =
          "End date must be after next payment date for recurring payments.";
      }

      if (selectedDate < today) {
        newErrors.endDate =
          "Past dates are not allowed for recurring payments.";
      }
    }

    const duplicateRecurringPayee = billsList.some((payee) => {
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

      const sameEndDate =
        String(payee.endDate ?? "") === formData.endDate;

      return (
        sameName &&
        sameAccountNumber &&
        sameAmount &&
        sameSchedule &&
        sameDate &&
        sameEndDate
      );
    });

    if (duplicateRecurringPayee) {
      newErrors.name =
        "An identical recurring payment already exists.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateSubscriptionForm = () => {
    const newErrors = {};

    if (!subscriptionFormData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (subscriptionFormData.name.trim().length > 30) {
      newErrors.name = "Subscription name cannot exceed 30 characters.";
    } else if (!/^[A-Za-z0-9 ]+$/.test(subscriptionFormData.name.trim())) {
      newErrors.name = "Subscription name cannot contain special characters.";
    }

    if (!subscriptionFormData.amount) {
      newErrors.amount = "Amount is required.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(subscriptionFormData.amount.trim())) {
      newErrors.amount = "Amount can have a maximum of 2 decimal places.";
    } else {
      const amountValue = Number(subscriptionFormData.amount);

      if (Number.isNaN(amountValue)) {
        newErrors.amount = "Amount must be a valid number.";
      } else if (amountValue < 1) {
        newErrors.amount = "Amount must be at least $1.00.";
      } else if (amountValue > 10000) {
        newErrors.amount = "Amount cannot exceed $10,000.00.";
      }
    }

    if (!subscriptionFormData.schedule) {
      newErrors.schedule = "Please select a schedule.";
    }

    if (!subscriptionFormData.date) {
      newErrors.date = "Please select a date.";
    } else {
      const selectedDate = new Date(`${subscriptionFormData.date}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date =
          "Past dates are not allowed for recurring payments.";
      }
    }

    if (!subscriptionFormData.paymentMethodId) {
      newErrors.paymentMethodId = "Please select a payment method.";
    }

    const duplicateSubscription = subscriptionsList.some((subscription) => {
      const sameName =
        String(subscription.name ?? "").trim().toLowerCase() ===
        subscriptionFormData.name.trim().toLowerCase();

      const sameAmount =
        Number(subscription.amount) === Number(subscriptionFormData.amount);

      const sameSchedule =
        String(subscription.schedule ?? "").trim().toUpperCase() ===
        subscriptionFormData.schedule.trim().toUpperCase();

      const sameDate =
        String(subscription.date ?? "") === subscriptionFormData.date;

      return sameName && sameAmount && sameSchedule && sameDate;
    });

    if (duplicateSubscription) {
      newErrors.name = "An identical subscription already exists.";
    }

    setSubscriptionErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  function messageFromError(error) {
    if (error?.status === 0) {
      return "Unable to connect to the server. Check your connection and try again.";
    }
    if (error?.status >= 500) {
      return "The server encountered an error. Please try again.";
    }
    return error?.data?.message || error?.message || "Unable to create the recurring payment.";
  }

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
      endDate: formData.endDate,
      type: "BILL",
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
        endDate: "",
      });

      setErrors({});
      setShowForm(false);
    } catch (error) {
      setErrorMessage(messageFromError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubscription = async () => {
    setErrorMessage("");

    if (!validateSubscriptionForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    const payload = {
      payeeName: subscriptionFormData.name.trim(),
      amount: Number(subscriptionFormData.amount),
      schedule: subscriptionFormData.schedule.toUpperCase(),
      date: subscriptionFormData.date,
      paymentMethodId: Number(subscriptionFormData.paymentMethodId),
      type: "SUBSCRIPTION",
    };

    try {
      setIsSubmitting(true);

      await addRecurringPayee(payload);
      await loadRecurringPayees();
      setSuccessMessage("Subscription added successfully.");

      setSubscriptionFormData({
        name: "",
        amount: "",
        schedule: "",
        date: "",
        paymentMethodId: "",
      });

      setSubscriptionErrors({});
      setShowForm(false);
    } catch (error) {
      setErrorMessage(messageFromError(error));
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
      endDate: "",
    });
  };

  const resetSubscriptionForm = () => {
    setShowForm(false);
    setSubscriptionErrors({});
    setSubscriptionFormData({
      name: "",
      amount: "",
      schedule: "",
      date: "",
      paymentMethodId: "",
    });
  };

  const isFormComplete =
    formData.name.trim() &&
    formData.accountNumber.trim() &&
    formData.amount &&
    // Number(formData.amount) >= 1  &&
    // Number(formData.amount) <= 10000 &&
    formData.schedule &&
    formData.date &&
    formData.endDate;

  const isSubscriptionFormComplete =
    subscriptionFormData.name.trim() &&
    subscriptionFormData.amount &&
    // Number(subscriptionFormData.amount) >= 1 &&
    // Number(subscriptionFormData.amount) <= 10000 &&
    subscriptionFormData.schedule &&
    subscriptionFormData.date &&
    subscriptionFormData.paymentMethodId;

  const billsList = useMemo(
    () => payees.filter((payee) => payee.type !== "SUBSCRIPTION"),
    [payees],
  );

  const subscriptionsList = useMemo(
    () => payees.filter((payee) => payee.type === "SUBSCRIPTION"),
    [payees],
  );

  const filteredSubscriptions = useMemo(
    () => filterItemsByName(subscriptionsList, subscriptionsSearchQuery),
    [subscriptionsList, subscriptionsSearchQuery],
  );

  const filteredPayees = useMemo(() => {
    const normalizedQuery = billsSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return billsList;
    }

    return billsList.filter(payee =>
      String(payee.name ?? "")
        .trim()
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [billsList, billsSearchQuery]);

  const hasBillsSearch = billsSearchQuery.trim().length > 0;
  const hasSubscriptionsSearch = subscriptionsSearchQuery.trim().length > 0;


  const clearBillFilters = () => {
    setBillFilters({
      status: [],
      schedule: []
    });
  }

  const toggleBillFilter = (category, value) => {
    setBillFilters(prev => {

      const selected = prev[category];

      const updated = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];

      return {
        ...prev,
        [category]: updated
      };

    });
  }

  const filterBillsByCategoryAndName = useMemo(() => {
    const filteredBills = filteredPayees;

    if (billFilters.status.length === 0 && billFilters.schedule.length === 0) {
      return filteredBills;
    }

    if (billFilters.schedule.length === 0) {
      return filteredBills.filter(payee =>
        billFilters.status.some(status => status.toLowerCase() === String(payee.status).toLowerCase())
      );
    }

    if (billFilters.status.length === 0) {
      return filteredBills.filter(payee =>
        billFilters.schedule.some(schedule => schedule.toLowerCase() === String(payee.schedule).toLowerCase())
      );
    }

    return filteredBills.filter(payee =>
      billFilters.status.some(status => status.toLowerCase() === String(payee.status).toLowerCase()) &&
      billFilters.schedule.some(schedule => schedule.toLowerCase() === String(payee.schedule).toLowerCase())
    )

  }, [billFilters, billsList, billsSearchQuery])

  function FunnelIcon(props) {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    );
  }

  return (

    <BasicPageLayout
      title={"Recurring Payments"}
      subtitle={
        "Manage your subscriptions and recurring bill payments. Select view to see full details."
      }
    >
      <Stack spacing={3}>
        {/* Top section: controls and add payee */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: tokens.shadow.small,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Manage Recurring Payments
                </Typography>

                <Typography sx={{ color: tokens.color.text.muted }}>
                  Select a category or add a new bill payee.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
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

              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >

                {activeTab === "bills" && (
                  <div className="filter-container">
                    <Button
                      variant="contained"
                      onClick={() => setShowBillFilters(prev => !prev)}
                      sx={{
                        alignSelf: { xs: "stretch", sm: "auto" },
                        gap: "8px",
                      }}
                    >

                      <FunnelIcon className="w-4 h-4" />
                      Filter

                      {billFilterCount > 0 &&
                        <span
                          style={{
                            background: "white",
                            color: tokens.color.button.primaryBg,
                            borderRadius: "999px",
                            padding: "2px 7px",
                            fontSize: "12px",
                            fontWeight: 700,
                            lineHeight: 1
                          }}>
                          {billFilterCount}
                        </span>
                      }
                    </Button>

                    {showBillFilters &&
                      <RecurringBillFilterMenu billFilters={billFilters}
                        toggleBillFilter={toggleBillFilter}
                        clearBillFilters={clearBillFilters}
                      ></RecurringBillFilterMenu>
                    }
                  </div>
                )}

                {activeTab === "bills" && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowForm(prev => !prev);
                      setErrors({});
                    }}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "auto" },
                    }}
                  >
                    Add New Payee
                  </Button>
                )}

                {activeTab === "subscriptions" && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowForm(prev => !prev);
                      setSubscriptionErrors({});
                    }}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "auto" },
                    }}
                  >
                    ＋ Add Subscription
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

              {activeTab === "subscriptions" && showForm && (
                <RecurringSubscriptionForm
                  formData={subscriptionFormData}
                  errors={subscriptionErrors}
                  isFormComplete={isSubscriptionFormComplete}
                  isSubmitting={isSubmitting}
                  paymentMethods={paymentMethods}
                  onInputChange={handleSubscriptionInputChange}
                  onConfirm={handleConfirmSubscription}
                  onCancel={resetSubscriptionForm}
                />
              )}

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
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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
              (subscriptionsList.length === 0 ? (
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
                      onEdit={handleEditRecurringPayee}
                      onCancel={handleCancelRecurringPayee}
                      onView={setViewingItem}
                    />
                  ))}
                </Stack>
              ))}

            {activeTab === "bills" &&
              (billsList.length === 0 ? (
                <RecurringEmptyState message={BILLS_EMPTY_MESSAGE} />
              ) : filterBillsByCategoryAndName.length === 0 && hasBillsSearch ? (
                <RecurringEmptyState message={NO_MATCHING_BILLS_MESSAGE} />
              ) : (
                <Stack spacing={2}>
                  {filterBillsByCategoryAndName.map(payee => (
                    <RecurringPayeeCard
                      key={payee.id}
                      payee={payee}
                      onEdit={handleEditRecurringPayee}
                      onCancel={handleCancelRecurringPayee}
                      onView={setViewingItem}
                    />
                  ))}
                </Stack>
              ))}
          </CardContent>
        </Card>
      </Stack>
      <RecurringPaymentEditDialog
        open={Boolean(editingPayee)}
        payee={editingPayee}
        onClose={() => setEditingPayee(null)}
        onSave={handleSaveRecurringPayee}
        isSaving={isSubmitting}
      />
      <RecurringPaymentCancelDialog
        open={Boolean(cancellingPayee)}
        payee={cancellingPayee}
        onClose={() => setCancellingPayee(null)}
        onConfirm={handleConfirmCancelRecurringPayee}
        isCancelling={isSubmitting}
      />
      <RecurringPaymentDetail
        open={Boolean(viewingItem)}
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onCancelPayment={() => setCancellingPayee(viewingItem)}
      />
    </BasicPageLayout>
  );
}
