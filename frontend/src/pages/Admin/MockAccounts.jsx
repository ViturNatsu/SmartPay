import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  LinearProgress,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SettingsIcon from "@mui/icons-material/Settings";

import Navbar from "@/components/Navbar";
import OpenAccountForm from "./OpenMockAccountForm";
import CreateMockAccount from "./CreateMockAccount";
import { useAuth } from "@/context/AuthContext";
import { tokens } from "@/style/Theme.jsx";
import {
  getUserAccounts,
  createAccount,
} from "/src/api/accounts/accountApi.js";

const formatCurrency = (value) =>
  value.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " CAD";

export const MockAccounts = () => {
  const { user, tokenClaims, loading: authLoading } = useAuth();
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(
    "Account opened successfully!",
  );
  const theme = useTheme();
  const isMediumDown = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAccountFormOpen, setOpenAccountFormOpen] = useState(false);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [mockSavingsOpen, setMockSavingsOpen] = useState(false);
  const [accountsState, setAccountsState] = useState({
    chequing: [],
    savings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBalances, setShowBalances] = useState(true);

  const allAccounts = useMemo(
    () => [...accountsState.chequing, ...accountsState.savings],
    [accountsState],
  );

  const filteredAccounts = useMemo(() => {
    if (selectedTab === 1) return accountsState.chequing;
    if (selectedTab === 2) return accountsState.savings;
    return allAccounts;
  }, [selectedTab, allAccounts, accountsState.chequing, accountsState.savings]);

  const displayAmount = (value) =>
    showBalances ? formatCurrency(value) : "••••••";

  const handleOpenAccountForm = () => {
    setOpenAccountFormOpen(true);
  };

  const handleCloseAccountForm = () => {
    setOpenAccountFormOpen(false);
  };

  const handleOpenAdminForm = () => {
    setAdminFormOpen(true);
  };

  const handleCloseAdminForm = () => {
    setAdminFormOpen(false);
  };

  const handleOpenMockSavings = () => {
    setMockSavingsOpen(true);
  };

  const handleCloseMockSavings = () => {
    setMockSavingsOpen(false);
  };

  const handleAdminFormSuccess = (data) => {
    fetchMockAccounts(tokenClaims?.userId);
    setSnackbarMessage("Account created successfully!");
    setSuccessSnackbar(true);
  };

  const handleMockSavingsSuccess = () => {
    setSnackbarMessage("success.");
    setSuccessSnackbar(true);
  };

  const handleSubmitAccountForm = async (formData) => {
    try {
      const type =
        formData.accountType?.toLowerCase() === "chequing"
          ? "CHECKING"
          : "SAVINGS";

      const payload = {
        type,
        accountName: formData.accountName,
        balance: 0,
        user: { id: Number(tokenClaims?.userId) },
      };

      await fetchMockAccounts(tokenClaims?.userId);
      setOpenAccountFormOpen(false);
      setSnackbarMessage("Account opened successfully!");
      setSuccessSnackbar(true);
    } catch (err) {
      console.error("Failed to create account:", err);
    }
  };

  const normalizeAccounts = (accounts = []) => {
    const chequing = [];
    const savings = [];
    accounts.forEach((acct) => {
      const rawType = (acct.type || acct.accountType || "").toLowerCase();
      const type = rawType === "checking" ? "chequing" : rawType;
      const base = {
        id: acct.id,
        name:
          acct.accountName ||
          acct.name ||
          (type === "savings" ? "Savings Account" : "Chequing Account"),
        accountNumber: (acct.accountNumber ?? acct.id ?? "----").toString(),
        balance: Number(acct.balance) || 0,
      };

      if (type === "chequing") {
        chequing.push({ ...base, type: "chequing" });
      } else if (type === "savings") {
        savings.push({
          ...base,
          type: "savings",
        });
      }
    });
    return { chequing, savings };
  };

  const fetchMockAccounts = async (userId) => {
    if (!userId) {
      console.log("no userId, returning early");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserAccounts(userId);
      setAccountsState(
        normalizeAccounts(Array.isArray(data) ? data : data?.accounts || []),
      );
    } catch (err) {
      setError(err?.message || "Unable to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && tokenClaims?.userId) {
      fetchMockAccounts(tokenClaims.userId);
    }
  }, [authLoading, tokenClaims?.userId]);

  return (
    <>
      <Navbar isAdmin />
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.color.background.lightGray, pb: 6 }}>
        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/*<Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenAccountForm}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                textTransform: "none",
                borderRadius: 1,
                px: 3,
                py: 1.2,
                my: 4.5,
              }}
            >
              Open New Mock Account
            </Button>*/}

            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={handleOpenAdminForm}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                textTransform: "none",
                borderRadius: 1,
                px: 3,
                py: 1.2,
                my: 4.5,
              }}
            >
              Create Mock Account
            </Button>
          </Box>

          {isMediumDown && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
            >
              {/*<Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenAccountForm}
                fullWidth
                sx={{ textTransform: "none", borderRadius: 1, py: 1.4 }}
              >
                Open New Mock Account
              </Button>*/}
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handleOpenAdminForm}
                fullWidth
                sx={{ textTransform: "none", borderRadius: 1, py: 1.4 }}
              >
                Create Mock Account
              </Button>
            </Box>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
              gap: { xs: 2.5, md: 3 },
              alignItems: "start",
            }}
          >
            <Box>
              {loading ? (
                <LinearProgress sx={{ mb: 2 }} />
              ) : error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              ) : allAccounts.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: tokens.color.background.surface,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No mock accounts yet
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 2 }}
                  >
                    Create a new mock account to get started.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/*<Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenAccountForm}
                      sx={{ textTransform: "none", borderRadius: 1 }}
                    >
                      Open New Account
                    </Button>*/}
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={handleOpenAdminForm}
                      sx={{ textTransform: "none", borderRadius: 1 }}
                    >
                      Create Mock Checking
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Tabs
                    value={selectedTab}
                    onChange={(_, value) => setSelectedTab(value)}
                    sx={{
                      mb: 3,
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        minHeight: 0,
                        px: 1.5,
                      },
                      "& .MuiTabs-indicator": { display: "none" },
                    }}
                  >
                    <Tab label={`All Accounts (${allAccounts.length})`} />
                    <Tab
                      label={`Chequing Accounts (${accountsState.chequing.length})`}
                    />
                    <Tab
                      label={`Savings Accounts (${accountsState.savings.length})`}
                    />
                  </Tabs>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(auto-fit, minmax(260px, 1fr))",
                      },
                    }}
                  >
                    {filteredAccounts.map((account) => (
                      <Card
                        key={account.id}
                        sx={{
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  mb: 0.4,
                                }}
                              >
                                {account.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                {account.type === "chequing"
                                  ? "Chequing"
                                  : "Savings"}{" "}
                                ...{account.accountNumber}
                              </Typography>
                            </Box>
                            <IconButton size="small">
                              <MoreHorizRoundedIcon />
                            </IconButton>
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mb: 0.4 }}
                            >
                              Current Balance
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: 700, fontSize: "1.5rem" }}
                            >
                              {displayAmount(account.balance)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <OpenAccountForm
        open={openAccountFormOpen}
        onClose={handleCloseAccountForm}
        onSubmit={handleSubmitAccountForm}
      />

      <CreateMockAccount
        open={adminFormOpen}
        onClose={handleCloseAdminForm}
        onSuccess={handleAdminFormSuccess}
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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MockAccounts;
