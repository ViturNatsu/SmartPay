import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import Navbar from "../components/Navbar";
import OpenAccountForm from "./OpenAccountForm";

const formatCurrency = (value) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const mockAccounts = {
  chequing: [
    {
      id: 1,
      name: "Primary Chequing",
      accountNumber: "8379",
      balance: 2082.25,
      type: "chequing",
    },
  ],
  savings: [
    {
      id: 2,
      name: "High Yield Savings",
      accountNumber: "0328",
      balance: 12150.25,
      type: "savings",
      goal: 20000,
    },
    {
      id: 3,
      name: "Emergency Savings",
      accountNumber: "7351",
      balance: 7200,
      type: "savings",
      goal: 15000,
    },
    {
      id: 4,
      name: "Travel Savings",
      accountNumber: "4226",
      balance: 3150,
      type: "savings",
      goal: 10000,
    },
  ],
};

export const Accounts = () => {
  const theme = useTheme();
  const isMediumDown = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAccountFormOpen, setOpenAccountFormOpen] = useState(false);

  const allAccounts = useMemo(
    () => [...mockAccounts.chequing, ...mockAccounts.savings],
    []
  );

  const totalBalance = useMemo(
    () => allAccounts.reduce((sum, account) => sum + account.balance, 0),
    [allAccounts]
  );

  const filteredAccounts = useMemo(() => {
    if (selectedTab === 1) return mockAccounts.chequing;
    if (selectedTab === 2) return mockAccounts.savings;
    return allAccounts;
  }, [selectedTab, allAccounts]);

  const calculateProgress = (current, goal) => Math.min(100, (current / goal) * 100);

  const handleOpenAccountForm = () => {
    setOpenAccountFormOpen(true);
  };

  const handleCloseAccountForm = () => {
    setOpenAccountFormOpen(false);
  };

  const handleSubmitAccountForm = (formData) => {
    console.log("New account submitted:", formData);
    // Here you would typically send the data to your backend
    // For now, we'll just log it
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 6 }}>
        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Total Balance
                </Typography>
                <VisibilityOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, lineHeight: 1 }}
              >
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Available across all accounts
              </Typography>
            </Box>

            <Button
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
              Open New Account
            </Button>
          </Box>

          {isMediumDown && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenAccountForm}
              fullWidth
              sx={{ textTransform: "none", borderRadius: 1, py: 1.4, my: 1 }}
            >
              Open New Account
            </Button>
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
              <Tabs
                value={selectedTab}
                onChange={(_, value) => setSelectedTab(value)}
                sx={{
                  mb: 3,
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 0, px: 1.5 },
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                <Tab label={`All Accounts (${allAccounts.length})`} />
                <Tab label={`Chequing Accounts (${mockAccounts.chequing.length})`} />
                <Tab label={`Savings Accounts (${mockAccounts.savings.length})`} />
              </Tabs>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(260px, 1fr))" },
                }}
              >
                {filteredAccounts.map((account) => (
                  <Card
                    key={account.id}
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem", mb: 0.4 }}>
                            {account.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {account.type === "chequing" ? "Chequing" : "Savings"} ...{account.accountNumber}
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <MoreHorizRoundedIcon />
                        </IconButton>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.4 }}>
                          Current Balance
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
                          {formatCurrency(account.balance)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Goal tracker */}
            <Paper
              sx={{
                borderRadius: 2,
                p: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                position: { md: "sticky" },
                top: 20,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Savings Goal Tracker
                </Typography>
                <IconButton size="small">
                  <AddRoundedIcon />
                </IconButton>
              </Box>

            
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {mockAccounts.savings.map((account) => (
                  <Box key={account.id}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {account.name}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Progress
                      </Typography>
                      <Typography variant="body2">
                        Goal Amount: {formatCurrency(account.goal)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(account.balance, account.goal)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "#1976d2" },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      <OpenAccountForm
        open={openAccountFormOpen}
        onClose={handleCloseAccountForm}
        onSubmit={handleSubmitAccountForm}
      />
    </>
  );
};

export default Accounts;