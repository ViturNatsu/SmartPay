import { useEffect, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Box,
  Button,
  Card,
  Container, DialogTitle,
  Divider,
  LinearProgress, Snackbar,
  Stack,
  Typography, useTheme,
} from "@mui/material";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";

import Navbar from "@/components/Navbar";
import LoadWalletDialog from "@/components/LoadWalletDialog";
import WithdrawFundsDialog from "@/components/WithdrawFundsDialog";

import {VirtualCardDisplay} from "@/components/card/VirtualCardDisplay";
import {RevealCardDialog} from "@/components/card/RevealCardDialog";
import {useAuth} from "@/context/AuthContext";
import {getWalletTransactions} from "@/api/wallets/walletApi";
import {getPaymentMethodsForUserWithId} from "@/api/paymentmethods/paymentmethodApi";
import {useWalletData} from "@/hooks/useWalletData.js";
import {useCardReveal} from "@/utils/useCardReveal.js";
import WalletLimitsDialog from "@/components/wallet/WalletLimitsDialog";
import {formatString} from "@/utils/stringFormaters/formatString.js";
import {formatDate} from "@/utils/stringFormaters/formatDate.js";
import {theme} from "@/style/Theme.jsx";
import {LockOpen, LockOutlined} from "@mui/icons-material";
import LockIcon from "@mui/icons-material/Lock";
import {CustomButton} from "@/components/customComponents/CustomButton.jsx";
import {LockCardOtpDialog} from "@/components/customComponents/dialogs/LockCardOtpDialog.jsx";
import {AlertSnackbar} from "@/components/customComponents/snackbar/AlertSnackbar.jsx";
import {LockCardRedirectDialog} from "@/components/customComponents/dialogs/LockCardRedirectDialog.jsx";
import {LockButton} from "@/components/customComponents/buttons/LockButton.jsx";

import { tokens } from "@/style/Theme.jsx";
/**
 * Wallet page — Scenario 1
 *
 * Displays the user's wallet balance, Load Wallet and Withdraw Funds
 * actions. Clicking Withdraw Funds opens the
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

  const theme = useTheme();


  const { user, tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active linked bank accounts — only these may be selected as destinations (Scenario 2)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pmLoading, setPmLoading] = useState(true);

  const [lockCardDialogOpen, setLockCardDialogOpen] = useState(false);
  const [lockCardRedirectDialogOpen, setLockCardRedirectDialogOpen] = useState(false);

  const [loadWalletOpen, setLoadWalletOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [revealDialogOpen, setRevealDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [walletLimitsOpen, setWalletLimitsOpen] = useState(false);

  // Card reveal state — manages blur, 30 s inactivity timer, and navigation re-mask
  const {isRevealed, reveal, mask} = useCardReveal();

  const fetchPaymentMethods = async () => {
    if (!tokenClaims?.userId) return;
    setPmLoading(true);
    try {
      // Page 0; active methods only — filter out inactive ones for the dropdown
      const res = await getPaymentMethodsForUserWithId(tokenClaims.userId, 0);
      const active = (res.content ?? []).filter(m => m.active);
      setPaymentMethods(active);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setPmLoading(false);
    }
  };

  // Custom hook to fetch wallet and card data and manage related state
  const {
    fetchWallet,
    fetchCard,
    wallet,
    card,
    walletLoading,
    cardLoading,
    balance,
    setBalance,
    setWallet
  } = useWalletData(tokenClaims);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");


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

  // Fetch wallet and payment methods on initial load (after auth state is known)
  useEffect(() => {
    const fetchData = async () => {
      await fetchWallet();
      await fetchPaymentMethods();
      await fetchTransactions();
    };

    // Only fetch data once we know whether the user is authenticated or not
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, tokenClaims?.userId]); // Or [] if effect doesn't need props or state

  // Fetch card details once we have the wallet (to get the wallet ID)
  useEffect(() => {
    const fetchData = async () => {
      if (!wallet) {
        return;
      }
      await fetchCard();
    };
    fetchData();
  }, [wallet]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLoadSuccess = newBalance => {
    if (newBalance != null) {
      setBalance(newBalance);
    } else {
      fetchWallet();
    }
    fetchTransactions();
  };

  /** Called by WithdrawFundsDialog on success; refresh balance from withdraw response */
  const handleWithdrawSuccess = (withdrawResponse) => {
    setBalance(withdrawResponse.newBalance ?? 0);
    fetchTransactions();
  };

  const handleWalletLimitsSuccess = (updatedWallet) => {
    setWallet(updatedWallet);
    setBalance(updatedWallet.balance ?? 0);
  };

  const formatTransactionDate = isoDate => {
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
    return ( type === "LOAD" || type === "DEPOSIT") ? `+${formatted}` : `-${formatted}`;
};

  // ── Formatting ────────────────────────────────────────────────────────────

  const formattedBalance = Number(balance).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isLoading = walletLoading || pmLoading || cardLoading;

  return (
    <>
      <Navbar />
      <Box sx={{background: tokens.color.brand.primaryBackground, minHeight: "100vh", py: 4}}>
        <Container maxWidth="lg">
          {/* Page header */}
          <Box sx={{mb: 3}}>
            <Typography
              variant="h4"
              sx={{fontWeight: 800, mb: 0.75, letterSpacing: "-0.04em"}}
            >
              Wallet
            </Typography>
            <Typography sx={{color: tokens.color.text.heading, fontSize: 15}}>
              Manage your SmartPay wallet, view your balance and load funds to
              send money or make payments.
            </Typography>
          </Box>

          {isLoading && <LinearProgress sx={{mb: 2}} />}

          {/* Main wallet panel */}
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${tokens.color.border.blueTint}`,
              borderRadius: "22px",
              p: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            }}
          >
            <Stack
              direction={{xs: "column", md: "row"}}
              spacing={16}
              alignItems={{md: "flex-start"}}
            >

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "24px",
                }}
              >
                <VirtualCardDisplay
                  card={card}
                  user={user}
                  isRevealed={isRevealed}
                  onRevealClick={() => {
                    if (isRevealed) {
                      mask();
                    } else {
                      setRevealDialogOpen(true);
                    }
                  }}
                />

                <LockButton
                  onClick={() => setLockCardDialogOpen(true)}
                  status={card?.cardStatus === "ACTIVE"}
                />
              </Box>

              {/* Balance info + actions */}
              <Box sx={{flex: 1}}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: tokens.color.text.mutedBlue,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    mb: 0.75,
                  }}
                >
                  Wallet Balance
                </Typography>
                <Typography
                  sx={{
                    fontSize: 44,
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                    mb: 1.75,
                  }}
                >
                  {formattedBalance}
                </Typography>

                <Divider sx={{mb: 2.25}} />

                <Typography sx={{fontSize: 13, color: tokens.color.text.mutedBlue, mb: 0.5}}>
                  Available Balance
                </Typography>
                <Typography sx={{fontSize: 21, fontWeight: 800, mb: 3}}>
                  {formattedBalance}
                </Typography>

                {/* Action buttons — Scenario 1: Withdraw Funds visible alongside Load Wallet */}
                <Stack direction="row" spacing={1.5} sx={{mb: 3.5}}>
                  <Button
                    variant="contained"
                    startIcon={<SouthWestIcon />}
                    onClick={() => setLoadWalletOpen(true)}
                    disabled={paymentMethods.length === 0}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      bgcolor: tokens.color.brand.primary,
                      "&:hover": {bgcolor: tokens.color.brand.primaryHover},
                      boxShadow: "0 6px 14px rgba(15,116,144,.3)",
                    }}
                  >
                    Load Wallet
                  </Button>

                  {/* Withdraw Funds — opens the multi-step dialog */}
                  <Button
                    variant="outlined"
                    startIcon={<NorthEastIcon />}
                    onClick={async () => {
                      await fetchWallet();
                      setWithdrawOpen(true);
                    }}
                    disabled={balance <= 0 || paymentMethods.length === 0}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderColor: tokens.color.brand.primaryMid,
                      color: tokens.color.brand.primaryHover,
                      bgcolor: tokens.color.brand.primaryLight,
                      "&:hover": {bgcolor: tokens.color.brand.primaryLighter, borderColor: tokens.color.brand.primaryHover},
                    }}
                  >
                    Withdraw Funds
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setWalletLimitsOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderColor: tokens.color.brand.primaryMid,
                      color: tokens.color.brand.primary,
                      bgcolor: tokens.color.background.surface,
                      "&:hover": {
                        bgcolor: tokens.color.brand.primaryBackground,
                        borderColor: tokens.color.brand.primaryHover,
                      },
                    }}
                  >
                    Wallet Limits
                  </Button>
                </Stack>

                {/* No linked accounts message when Withdraw is unavailable */}
                {!pmLoading && paymentMethods.length === 0 && (
                  <Typography sx={{fontSize: 13, color: tokens.color.text.subdued}}>
                    Link a bank account in Payment Methods to load funds and
                    withdraw.
                  </Typography>
                )}

                {/* Recent wallet activity */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography sx={{fontSize: 16, fontWeight: 900}}>
                      Recent Wallet Activity
                    </Typography>
                    <Typography
                      component={RouterLink}
                      to="/transactions"
                      sx={{
                        color: tokens.color.brand.primary,
                        fontSize: 13,
                        fontWeight: 800,
                        textDecoration: "none",
                        "&:hover": {textDecoration: "underline"},
                      }}
                    >
                      View all transactions →
                    </Typography>
                  </Box>

                  {txLoading ? (
                    <Typography sx={{fontSize: 13, color: tokens.color.text.mutedBlue}}>
                      Loading activity...
                    </Typography>
                  ) : transactions.length === 0 ? (
                    <Typography sx={{fontSize: 13, color: tokens.color.text.mutedBlue}}>
                      No wallet activity yet. Load funds to see your first
                      transaction.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {transactions.map(tx => (
                        <Box
                          key={tx.transactionId}
                          onClick={() => navigate(`/transactions/${tx.transactionId}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              navigate(`/transactions/${tx.transactionId}`);
                            }
                          }}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1.25,
                            borderBottom: `1px solid ${tokens.color.border.divider}`,
                            cursor: "pointer",
                            borderRadius: 1,
                            "&:hover": { background: "#f1f5f9" },
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: tokens.color.text.title,
                              }}
                            >
                              {tx.description}
                            </Typography>
                            <Typography sx={{fontSize: 12, color: tokens.color.text.mutedBlue}}>
                              {formatTransactionDate(tx.createdAt)}
                            </Typography>
                          </Box>
                          <Box sx={{textAlign: "right"}}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color:
                                  ( tx.type === "LOAD" || tx.type === "DEPOSIT") ? tokens.color.status.success : tokens.color.text.number.negative,
                              }}
                            >
                              {formatTransactionAmount(tx.type, tx.amount)}
                            </Typography>
                            <Typography sx={{fontSize: 12, color: tokens.color.text.mutedBlue}}>
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

      <RevealCardDialog
        open={revealDialogOpen}
        email={tokenClaims?.email}
        onSuccess={() => {
          reveal();
          setRevealDialogOpen(false);
        }}
        onClose={() => setRevealDialogOpen(false)}
      />

      <LockCardOtpDialog
        cardStatus={card?.cardStatus}
        open={lockCardDialogOpen}
        onClose={async ()=>{
          setLockCardDialogOpen(false);
        }}
        onSuccess={async (message) => {
          setLockCardDialogOpen(false);
          setSnackbarOpen(true);
          setSnackbarMessage(message);
          await fetchWallet();
        }}
      ></LockCardOtpDialog>

      <LockCardRedirectDialog
        cardStatus={card?.cardStatus}
        open={lockCardRedirectDialogOpen}
        onOpen={setLockCardRedirectDialogOpen}
        onClose={()=>{
          setLockCardRedirectDialogOpen(false);
          }
        }
        onSuccess={async (message) => {
          setLockCardRedirectDialogOpen(false);
          setSnackbarOpen(true);
          setSnackbarMessage(message);
          await fetchWallet();
        }}
      >
      </LockCardRedirectDialog>


      <LoadWalletDialog
        open={loadWalletOpen}
        onClose={() => setLoadWalletOpen(false)}
        onSuccess={handleLoadSuccess}
      />

      <WithdrawFundsDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={handleWithdrawSuccess}
        onRefreshWallet={fetchWallet}
        wallet={wallet}
        walletBalance={balance}
        paymentMethods={paymentMethods}
      />

      <WalletLimitsDialog
        open={walletLimitsOpen}
        onClose={() => setWalletLimitsOpen(false)}
        onSuccess={handleWalletLimitsSuccess}
        wallet={wallet}
        userId={Number(tokenClaims?.userId)}
        paymentMethods={paymentMethods}
      />

      <AlertSnackbar
        open={snackbarOpen}
        onClose={()=>{setSnackbarOpen(false)}}
        message={snackbarMessage}
      />
    </>
  );
}
