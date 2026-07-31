import { useEffect, useId, useState } from "react";
import { Alert, AlertTitle, Box, Button, Card, Stack, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { getWalletByUserId } from "@/api/wallets/walletApi";

import { tokens } from "@/style/Theme.jsx";

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function WalletBalance({ refreshKey = 0 }) {
  const { tokenClaims, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const balanceHeadingId = useId();
  const limitHeadingId = useId();
  const availableHeadingId = useId();

  useEffect(() => {
    if (authLoading) return;
    if (!tokenClaims?.userId) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchWalletBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWalletByUserId(Number(tokenClaims.userId));
        if (!cancelled) {
          setWallet(data);
          setBalance(data.balance ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load wallet balance");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWalletBalance();

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenClaims?.userId, refreshKey, retryCount]);

  if (error) {
    return (
      <Card
        elevation={0}
        sx={{
          width: "100%",
          minHeight: "154px",
          p: "26px",
          boxSizing: "border-box",
          borderRadius: "16px",
        }}
      >
        <Alert
          severity="error"
          action={
            <Button
              color="error"
              size="small"
              onClick={() => setRetryCount((c) => c + 1)}
              data-testid="wallet-balance-retry-button"
            >
              Try again
            </Button>
          }
        >
          <AlertTitle>Failed to load wallet balance</AlertTitle>
          {error}
        </Alert>
      </Card>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const dailyUsage =
    wallet?.dailySpentDate === today ? (wallet?.dailySpentAmount ?? 0) : 0;
  const hasDailyLimit = wallet?.dailySpendingLimit != null;
  const availableToday = hasDailyLimit
    ? Math.max(0, wallet.dailySpendingLimit - dailyUsage)
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        minHeight: "230px",
        p: "26px",
        boxSizing: "border-box",
        borderRadius: "16px",
        border: "none",
        background: tokens.color.gradient.walletBalance,
        color: tokens.color.text.white,
      }}
    >
      <Stack
        spacing={1}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Typography
          id={balanceHeadingId}
          component="h2"
          sx={{
            color: tokens.color.text.white,
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.4,
          }}
        >
          Wallet Balance
        </Typography>
        <Typography
          aria-labelledby={balanceHeadingId}
          sx={{
            color: tokens.color.text.white,
            fontSize: "44px",
            lineHeight: 1.15,
            fontWeight: 600,
            textAlign: "left",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          {loading ? "Loading balance..." : formatCurrency(balance)}
        </Typography>
        <Typography
          sx={{
            color: tokens.color.text.white,
            fontSize: "0.875rem",
            lineHeight: 1.43,
            opacity: 0.95,
            textAlign: "left",
          }}
        >
          Available balance for transfers and payments
        </Typography>
      </Stack>

      <Box
        sx={{
          borderTop: `1px solid ${tokens.color.border.glassWhite}`,
          mt: "20px",
          pt: "18px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: "16px",
          }}
        >
          <Box>
            <Typography
              id={limitHeadingId}
              component="h3"
              sx={{
                color: tokens.color.text.whiteMuted,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                mb: 0.5,
              }}
            >
              Daily Spending Limit
            </Typography>
            <Typography
              aria-labelledby={limitHeadingId}
              sx={{
                color: tokens.color.text.white,
                fontSize: "1.25rem",
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {loading
                ? "…"
                : hasDailyLimit
                  ? formatCurrency(wallet.dailySpendingLimit)
                  : "No daily limit set"}
            </Typography>
          </Box>

          <Box>
            <Typography
              id={availableHeadingId}
              component="h3"
              sx={{
                color: tokens.color.text.whiteMuted,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                mb: 0.5,
              }}
            >
              Available to Spend Today
            </Typography>
            <Typography
              aria-labelledby={availableHeadingId}
              sx={{
                color: tokens.color.text.white,
                fontSize: "1.25rem",
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {loading
                ? "…"
                : hasDailyLimit
                  ? formatCurrency(availableToday)
                  : "Unlimited"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default WalletBalance;
