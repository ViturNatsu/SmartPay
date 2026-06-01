import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";

import Navbar from "@/components/Navbar";
import WithdrawFundsDialog from "@/components/WithdrawFundsDialog";
import { useAuth } from "@/context/AuthContext";
import { getWalletByUserId, getWalletTransactions } from "@/api/wallets/walletApi";
import { getPaymentMethodsForUserWithId } from "@/api/paymentmethods/paymentmethodApi";

/**
 * Wallet page — Scenario 1
 *
 * Displays the user's wallet balance, a "Load Wallet" stub and a
 * "Withdraw Funds" button. Clicking Withdraw Funds opens the
 * WithdrawFundsDialog which owns the multi-step withdrawal flow
 * (Details → Review → Success).
 *
 * This component is responsible for:
 *  - Fetching and refreshing wallet balance
 *  - Fetching active payment methods to pass to the dialog
 *  - Owning the open/close state of the dialog
 *
 * It does NOT duplicate the WalletBalance component used on the
 * Home dashboard — instead it fetches balance here so it can
 * refresh it after a successful withdrawal without re-mounting
 * the WalletBalance component.
 */
export function Wallet() {
  const { tokenClaims, loading: authLoading } = useAuth();

  const [balance, setBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  // Active linked bank accounts — only these may be selected as destinations (Scenario 2)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pmLoading, setPmLoading] = useState(true);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchWallet = async () => {
    if (!tokenClaims?.userId) return;
    setWalletLoading(true);
    try {
      const wallet = await getWalletByUserId(Number(tokenClaims.userId));
      setBalance(wallet.balance ?? 0);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!tokenClaims?.userId) return;
    setPmLoading(true);
    try {
      // Page 0; active methods only — filter out inactive ones for the dropdown
      const res = await getPaymentMethodsForUserWithId(tokenClaims.userId, 0);
      const active = (res.content ?? []).filter((m) => m.active);
      setPaymentMethods(active);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setPmLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!tokenClaims?.userId) return;
    setTxLoading(true);
    try {
      const data = await getWalletTransactions(tokenClaims.userId, 5);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wallet transactions:", err);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchWallet();
      fetchPaymentMethods();
      fetchTransactions();
    }
  }, [authLoading, tokenClaims?.userId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Called by WithdrawFundsDialog on success; refresh balance from updated wallet */
  const handleWithdrawSuccess = (updatedWallet) => {
    setBalance(updatedWallet.balance ?? 0);
    fetchTransactions();
  };

  const formatTransactionDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTransactionAmount = (type, amount) => {
    const value = Number(amount ?? 0);
    const formatted = value.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return type === "LOAD" ? `+${formatted}` : `-${formatted}`;
  };

  // ── Formatting ────────────────────────────────────────────────────────────

  const formattedBalance = Number(balance).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isLoading = walletLoading || pmLoading;

  return (
    <>
      <Navbar />
      <Box sx={{ background: "#F8FAFC", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          {/* Page header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75, letterSpacing: "-0.04em" }}>
              Wallet
            </Typography>
            <Typography sx={{ color: "#334155", fontSize: 15 }}>
              Manage your SmartPay wallet, view your balance and load funds
              to send money or make payments.
            </Typography>
          </Box>

          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Main wallet panel */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #DCE4EC",
              borderRadius: "22px",
              p: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems={{ md: "flex-start" }}
            >
              {/* Virtual card visual */}
              <Box
                sx={{
                  width: 300,
                  height: 180,
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #062f3d 0%, #1a3a52 60%, #0f7490 100%)",
                  borderRadius: "16px",
                  p: "22px 24px",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(15,36,54,.35)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>◉ SmartPay</Typography>
                  <Box
                    sx={{
                      fontSize: 10,
                      letterSpacing: ".12em",
                      border: "1px solid rgba(255,255,255,.3)",
                      borderRadius: "999px",
                      px: 1.25,
                      py: 0.5,
                      opacity: 0.8,
                    }}
                  >
                    VIRTUAL
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: 15, letterSpacing: ".18em", opacity: 0.65 }}>
                  •••• •••• •••• ••••
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 10, opacity: 0.75 }}>
                  <Box>
                    <div>VALID THRU</div>
                    <div style={{ opacity: 0.65 }}>••/••</div>
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, fontStyle: "italic" }}>
                    VISA
                  </Typography>
                </Box>
              </Box>

              {/* Balance info + actions */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#8DA0BC", textTransform: "uppercase", letterSpacing: ".08em", mb: 0.75 }}>
                  Wallet Balance
                </Typography>
                <Typography sx={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.05em", mb: 1.75 }}>
                  {formattedBalance}
                </Typography>

                <Divider sx={{ mb: 2.25 }} />

                <Typography sx={{ fontSize: 13, color: "#8DA0BC", mb: 0.5 }}>
                  Available Balance
                </Typography>
                <Typography sx={{ fontSize: 21, fontWeight: 800, mb: 3 }}>
                  {formattedBalance}
                </Typography>

                {/* Action buttons — Scenario 1: Withdraw Funds visible alongside Load Wallet */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 3.5 }}>
                  {/* Load Wallet is a stub for a future story */}
                  <Button
                    variant="contained"
                    startIcon={<SouthWestIcon />}
                    disabled
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      bgcolor: "#0F7490",
                      "&:hover": { bgcolor: "#0A5A70" },
                      boxShadow: "0 6px 14px rgba(15,116,144,.3)",
                    }}
                  >
                    Load Wallet
                  </Button>

                  {/* Withdraw Funds — opens the multi-step dialog */}
                  <Button
                    variant="outlined"
                    startIcon={<NorthEastIcon />}
                    onClick={() => setWithdrawOpen(true)}
                    disabled={balance <= 0 || paymentMethods.length === 0}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderColor: "#B2DDE8",
                      color: "#0A5A70",
                      bgcolor: "#E5F5FA",
                      "&:hover": { bgcolor: "#CCE9F2", borderColor: "#0A5A70" },
                    }}
                  >
                    Withdraw Funds
                  </Button>
                </Stack>

                {/* No linked accounts message when Withdraw is unavailable */}
                {!pmLoading && paymentMethods.length === 0 && (
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                    Link a bank account in Payment Methods to enable withdrawals.
                  </Typography>
                )}

                {/* Recent wallet activity */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
                      Recent Wallet Activity
                    </Typography>
                    <Typography
                      component={RouterLink}
                      to="/transactions"
                      sx={{ color: "#0F7490", fontSize: 13, fontWeight: 800, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                      View all transactions →
                    </Typography>
                  </Box>

                  {txLoading ? (
                    <Typography sx={{ fontSize: 13, color: "#8DA0BC" }}>
                      Loading activity...
                    </Typography>
                  ) : transactions.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#8DA0BC" }}>
                      No wallet activity yet. Load funds to see your first transaction.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {transactions.map((tx) => (
                        <Box
                          key={tx.transactionId}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1.25,
                            borderBottom: "1px solid #EEF2F7",
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                              {tx.description}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#8DA0BC" }}>
                              {formatTransactionDate(tx.createdAt)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: tx.type === "LOAD" ? "#15803D" : "#DC2626",
                              }}
                            >
                              {formatTransactionAmount(tx.type, tx.amount)}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#8DA0BC" }}>
                              {tx.status ?? "Completed"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Withdrawal dialog — owns the 3-step flow (SRP) */}
      <WithdrawFundsDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={handleWithdrawSuccess}
        walletBalance={balance}
        paymentMethods={paymentMethods}
      />
    </>
  );
}
