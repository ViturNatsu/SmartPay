import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import OpenAccountForm from "@/pages/Accounts/OpenAccountForm";
import LinkBankAccount from "./LinkBankAccount";
import {
  createAccount,
  getUserAccounts,
} from "@/api/accounts/accountApi";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const normalizePaymentMethods = (accounts = []) =>
  accounts.map((account) => ({
    id: account.id,
    accountName:
      account.accountName ||
      ((account.accountType || account.type) === "SAVINGS"
        ? "Savings Account"
        : "Chequing Account"),
    accountNumber: String(account.accountNumber ?? account.id ?? "0000"),
    type: account.accountType || account.type || "CHECKING",
    balance: Number(account.balance) || 0,
    active: account.active ?? true,
  }));

export default function PaymentMethods() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openBankAccountForm, setOpenBankAccountForm] = useState(false);
  const [openLinkBankAccountForm, setOpenLinkBankAccountForm] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState(false);

  const activeMethods = useMemo(
    () => paymentMethods.filter((method) => method.active),
    [paymentMethods],
  );

  const fetchPaymentMethods = async (userId) => {
    if (!userId) return;

    setLoading(true);
    setError("");
    try {
      const data = await getUserAccounts(Number(userId));
      const methods = Array.isArray(data) ? data : data?.accounts || [];
      setPaymentMethods(normalizePaymentMethods(methods));
    } catch (err) {
      setError(err?.message || "Unable to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && tokenClaims?.userId) {
      fetchPaymentMethods(tokenClaims.userId);
    }
  }, [authLoading, tokenClaims?.userId]);

  const handleOpenLinkBankAccount = () => {
    setOpenLinkBankAccountForm(true);
  }

  const handleOpenBankAccount = () => {
    setOpenBankAccountForm(true);
  };

  const handleCloseBankAccount = () => {
    setOpenBankAccountForm(false);
  };

  const handleCloseLinkBankAccount = () => {
    setOpenLinkBankAccountForm(false);
  }

  const handleSubmitBankAccount = async (formData) => {
    try {
      const payload = {
        type:
          formData.accountType?.toLowerCase() === "chequing"
            ? "CHECKING"
            : "SAVINGS",
        accountName: formData.accountName,
        balance: 0,
        user: { id: Number(tokenClaims?.userId) },
      };

      await createAccount(payload);
      await fetchPaymentMethods(tokenClaims?.userId);
      setOpenBankAccountForm(false);
      setSuccessSnackbar(true);
    } catch (err) {
      setError(err?.message || "Unable to save payment method");
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Payment Methods
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Manage your funding sources for payments and add new bank
                accounts when needed.
              </Typography>
            </Box>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Add Payment Method
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      Select a payment method type to register a new funding
                      source.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AccountBalanceOutlinedIcon />}
                    onClick={handleOpenLinkBankAccount}
                    sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" } }}
                  >
                    Connect Bank Account
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Existing Payment Methods
                </Typography>

                {loading ? (
                  <LinearProgress />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : activeMethods.length === 0 ? (
                  <Box
                    sx={{
                      border: "1px dashed #CBD5E1",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      No payment methods yet
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 2 }}>
                      Add a bank account to start using it as a funding source
                      for payments.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenLinkBankAccount}
                      sx={{ textTransform: "none" }}
                    >
                      Connect Bank Account
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {activeMethods.map((method) => (
                      <Box
                        key={method.id}
                        sx={{
                          border: "1px solid #E2E8F0",
                          borderRadius: 2,
                          p: 2.5,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {method.accountName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                              Bank Account • {method.type === "SAVINGS" ? "Savings" : "Chequing"} •
                              {" "}...{method.accountNumber.slice(-4)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatCurrency(method.balance)}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <OpenAccountForm
        open={openBankAccountForm}
        onClose={handleCloseBankAccount}
        onSubmit={handleSubmitBankAccount}
        dialogTitle="Account Details"
      />

      <LinkBankAccount
        open={openLinkBankAccountForm}
        onClose={handleCloseLinkBankAccount}
      />

      <Snackbar
        open={successSnackbar}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          Payment method saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
