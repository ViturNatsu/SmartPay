import React, { useEffect, useMemo, useState } from "react";
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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Navbar from "../components/Navbar";
import OpenAccountForm from "./OpenAccountForm";
import { useAuth } from "../context/AuthContext";
import { getUserAccounts, createAccount } from "/src/api/accounts/accountApi.js";

const formatCurrency = (value) =>
    value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });


export const Accounts = () => {
    const { tokenClaims, loading: authLoading } = useAuth();
    // const acc = getUserAccounts(2).then(res => console.log(res)).catch(err => console.error(err));
    const theme = useTheme();
    const isMediumDown = useMediaQuery(theme.breakpoints.down("md"));
    const [selectedTab, setSelectedTab] = useState(0);
    const [openAccountFormOpen, setOpenAccountFormOpen] = useState(false);
    const [accountsState, setAccountsState] = useState({ chequing: [], savings: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBalances, setShowBalances] = useState(true);

    const allAccounts = useMemo(
        () => [...accountsState.chequing, ...accountsState.savings],
        [accountsState]
    );

    const totalBalance = useMemo(
        () => allAccounts.reduce((sum, account) => sum + account.balance, 0),
        [allAccounts]
    );

    const filteredAccounts = useMemo(() => {
        if (selectedTab === 1) return accountsState.chequing;
        if (selectedTab === 2) return accountsState.savings;
        return allAccounts;
    }, [selectedTab, allAccounts, accountsState.chequing, accountsState.savings]);

    const calculateProgress = (current, goal) => Math.min(100, (current / goal) * 100);

    const displayAmount = (value) => (showBalances ? formatCurrency(value) : "••••••");

    const handleOpenAccountForm = () => {
        setOpenAccountFormOpen(true);
    };

    const handleCloseAccountForm = () => {
        setOpenAccountFormOpen(false);
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

            // console.log("Creating account with payload:", JSON.stringify(payload));
            await createAccount(payload);

            // Refresh from server to reflect authoritative data
            await fetchAccounts();
            setOpenAccountFormOpen(false);
        } catch (err) {
            console.error("Failed to create account:", err);
        }
    };

    // Normalize API accounts into chequing/savings buckets
    const normalizeAccounts = (accounts = []) => {
        const chequing = [];
        const savings = [];
        accounts.forEach((acct) => {
            const rawType = (acct.type || acct.accountType || "").toLowerCase();
            const type = rawType === "checking" ? "chequing" : rawType; // map API CHECKING to UI chequing
            const base = {
                id: acct.id,
                name: acct.accountName || acct.name || (type === "savings" ? "Savings Account" : "Chequing Account"),
                accountNumber: (acct.accountNumber ?? acct.id ?? "----").toString(),
                balance: Number(acct.balance) || 0,
            };

            if (type === "chequing") {
                chequing.push({ ...base, type: "chequing" });
            } else if (type === "savings") {
                savings.push({ ...base, type: "savings", goal: Number(acct.goal) || 0 });
            }
        });
        return { chequing, savings };
    };

    const fetchAccounts = async () => {
        if (!tokenClaims?.userId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getUserAccounts(Number(tokenClaims.userId));
            setAccountsState(normalizeAccounts(Array.isArray(data) ? data : data?.accounts || []));
        } catch (err) {
            setError(err?.message || "Unable to load accounts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !tokenClaims?.userId) return; // Wait for auth to settle
        fetchAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenClaims?.userId, authLoading]);

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
                                <IconButton
                                    size="small"
                                    onClick={() => setShowBalances((prev) => !prev)}
                                    aria-label={showBalances ? "Hide balances" : "Show balances"}
                                >
                                    {showBalances ? (
                                        <VisibilityOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    ) : (
                                        <VisibilityOffIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    )}
                                </IconButton>

                            </Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 700, fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, lineHeight: 1 }}
                            >
                                {displayAmount(totalBalance)}
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
                                        bgcolor: "#fff",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        No accounts yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                        Create a new account to get started.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddRoundedIcon />}
                                        onClick={handleOpenAccountForm}
                                        sx={{ textTransform: "none", borderRadius: 1 }}
                                    >
                                        Open New Account
                                    </Button>
                                </Box>
                            ) : (
                                <>
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
                                        <Tab label={`Chequing Accounts (${accountsState.chequing.length})`} />
                                        <Tab label={`Savings Accounts (${accountsState.savings.length})`} />
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
                                {accountsState.savings.map((account) => (
                                    <Box key={account.id}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                            {account.name}
                                        </Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                Progress
                                            </Typography>
                                            <Typography variant="body2">
                                                Goal Amount: {displayAmount(account.goal)}
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