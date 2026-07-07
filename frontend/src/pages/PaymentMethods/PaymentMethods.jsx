import { useEffect, useMemo, useRef, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { getPaymentMethodsForUserWithId, updatePaymentMethodStatus} from "../../api/paymentmethods/paymentmethodApi";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


import { tokens } from "@/style/Theme.jsx";
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
  const [currentPageNumber, setCurrentPageNumber] = useState(0);
  const [pageData, setPageData] = useState({last: false, first: false});
  const topOfDisplayRef = useRef(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [methodToRemove, setMethodToRemove] = useState(null);

  const activeMethods = useMemo(
    () => paymentMethods.filter((method) => method.active),
    [paymentMethods],
  );

  const fetchPaymentMethods = async (userId) => {
    if (!userId) return;

    setLoading(true);
    setError("");
    try {
      const START_PAGE = 0;
      const res = await getPaymentMethodsForUserWithId(userId, START_PAGE);
      /*const data = await getUserAccounts(Number(userId));
      const methods = Array.isArray(data) ? data : data?.accounts || [];
      setPaymentMethods(normalizePaymentMethods(methods));*/
      setPaymentMethods(res.content);
      setPageData(res);

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

  useEffect(() => {
    if (topOfDisplayRef.current && typeof topOfDisplayRef.current.scrollIntoView === 'function') {
      topOfDisplayRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start"
      })
    }
  }, [currentPageNumber]);

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

  const handlePageChange = async (page) => {
    try {
      const res = await getPaymentMethodsForUserWithId(tokenClaims.userId, page);
      setPaymentMethods(res.content);
      setCurrentPageNumber(page);
      setPageData(res);
      
    } catch (err) {
      setError(err?.message || "Unable to load payment methods");
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmDialog = (paymentMethodId) => {
    setMethodToRemove(paymentMethodId);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDeactivate = async () => {
    setOpenConfirmDialog(false);
    if (!methodToRemove) return;

    try {
      await updatePaymentMethodStatus(methodToRemove, false);
      await fetchPaymentMethods(tokenClaims.userId);
      setSuccessSnackbar(true);
    } catch (err) {
      setError(err?.message || "Failed to remove payment method");
    } finally {
      setMethodToRemove(null);
    }
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setMethodToRemove(null);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.color.brand.primaryBackground, py: 4 }}>
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
              ref={topOfDisplayRef}
              sx={{
                borderRadius: 2,
                boxShadow: tokens.shadow.small,
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
                boxShadow: tokens.shadow.small,
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
                      border: `1px dashed ${tokens.color.border.medium}`,
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
                          border: `1px solid ${tokens.color.border.light}`,
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
                        {/* TODO: Display any other fields as needed */}
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {method.bankDisplayName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontVariantLigatures: "Normal"}}>
                              {method.accountIdentifierMasked.substring(2)}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                              {method.accountName}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                          {/*<Typography sx={{ fontWeight: 600 }}>
                            Payment Method ID: {method.payment_method_id}
                          </Typography>*/}
                          <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleConfirmDialog(method.paymentMethodId)}>
                            Remove
                          </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
              }}
            >
              <Button
                onClick={() => handlePageChange(currentPageNumber - 1)}
                disabled={pageData.first}
                variant="outlined"
                startIcon={<ArrowBackIosNewIcon />}
                sx={{
                  textTransform: "none",
                  borderColor: tokens.color.brand.purple,
                  color: tokens.color.brand.purple,
                  "&:hover": {
                    borderColor: tokens.color.brand.purpleHover,
                    backgroundColor: tokens.color.background.purpleTint,
                  },
                  mr: 1.5,
                }}
              >
                Previous
              </Button>

              <Button
                onClick={() => handlePageChange(currentPageNumber + 1)}
                disabled={pageData.last}
                variant="outlined"
                endIcon={<ArrowForwardIosIcon />}
                sx={{
                  textTransform: "none",
                  borderColor: tokens.color.brand.purple,
                  color: tokens.color.brand.purple,
                  "&:hover": {
                    borderColor: tokens.color.brand.purpleHover,
                    backgroundColor: tokens.color.background.purpleTint,
                  },
                }}
              >
                Next
              </Button>
            </Box>

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

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Remove this Payment Method?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this payment method? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button 
            onClick={handleCloseConfirmDialog} 
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDeactivate} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ textTransform: "none" }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

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
          Payment method removed successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
