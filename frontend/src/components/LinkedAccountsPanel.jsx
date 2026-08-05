import {useCallback, useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import {useAuth} from "@/context/AuthContext";
import {getPaymentMethodsForUserWithId} from "@/api/paymentmethods/paymentmethodApi";
import {tokens, dashboardSidebarCardSx} from "@/style/Theme";

const EMPTY_MESSAGE = "No accounts linked yet - connect a bank to get started.";

function formatAccountTitle(method) {
  const bank = method.bankDisplayName?.trim();
  const name = method.accountName?.trim();
  if (bank && name) return `${bank} — ${name}`;
  return bank || name || "Linked account";
}

function formatMaskedAccountNumber(masked) {
  if (!masked) return "Account N/A";
  const digits = String(masked).replace(/\D/g, "");
  const last4 = digits.slice(-4) || masked.slice(-4);
  return `Account •••• ${last4}`;
}

function LinkedAccountRow({method, isLast}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        borderBottom: isLast
          ? "none"
          : `1px solid ${tokens.color.border.light}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: `${tokens.borderRadius.medium}px`,
          bgcolor: tokens.color.brand.primaryLight,
          color: tokens.color.brand.primary,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
        aria-hidden
      >
        <AccountBalanceOutlinedIcon sx={{fontSize: 18}} />
      </Box>

      <Box sx={{flex: 1, minWidth: 0}}>
        <Typography
          sx={{
            fontWeight: tokens.typography.fontWeight.bold,
            fontSize: 13.5,
            color: tokens.color.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatAccountTitle(method)}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: tokens.color.text.secondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatMaskedAccountNumber(method.accountIdentifierMasked)}
        </Typography>
      </Box>

      <Chip
        label="Active"
        size="small"
        sx={{
          height: 22,
          fontSize: 10.5,
          fontWeight: 800,
          color: tokens.color.status.success,
          bgcolor: tokens.color.status.successBg,
          border: `1px solid ${tokens.color.status.successBorder}`,
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

export default function LinkedAccountsPanel() {
  const {tokenClaims, loading: authLoading} = useAuth();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadLinkedAccounts = useCallback(async () => {
    if (!tokenClaims?.userId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPaymentMethodsForUserWithId(tokenClaims.userId, 0);
      // const res = {content: []}; to test empty state
      const active = (res.content ?? []).filter(method => method.active);
      setLinkedAccounts(active);
    } catch (err) {
      setError(err?.message || "Unable to load linked accounts");
      setLinkedAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [tokenClaims?.userId]);

  useEffect(() => {
    if (!authLoading) {
      loadLinkedAccounts();
    }
  }, [authLoading, loadLinkedAccounts, retryCount]);

  return (
    <Card
      elevation={0}
      aria-label="Linked accounts"
      sx={{
        ...dashboardSidebarCardSx,
        bgcolor: tokens.color.background.surface,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: 18,
            fontWeight: tokens.typography.fontWeight.bold,
            letterSpacing: "-0.02em",
            color: tokens.color.text.primary,
          }}
        >
          Linked Accounts
        </Typography>
        <Typography
          component={RouterLink}
          to="/payment-methods"
          sx={{
            color: tokens.color.brand.primary,
            fontSize: 13,
            fontWeight: tokens.typography.fontWeight.bold,
            textDecoration: "none",
            "&:hover": {textDecoration: "underline"},
          }}
        >
          Manage →
        </Typography>
      </Box>

      {loading && (
        <Box sx={{display: "flex", justifyContent: "center", py: 3}}>
          <CircularProgress size={24} aria-label="Loading linked accounts" />
        </Box>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          sx={{mt: 1}}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setRetryCount(count => count + 1)}
            >
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && linkedAccounts.length === 0 && (
        <Box
          sx={{
            borderRadius: `${tokens.borderRadius.large}px`,
            bgcolor: tokens.color.background.app,
            p: 3.5,
            textAlign: "center",
          }}
        >
          <Typography sx={{fontSize: 13.5, color: tokens.color.text.secondary}}>
            {EMPTY_MESSAGE}
          </Typography>
        </Box>
      )}

      {!loading && !error && linkedAccounts.length > 0 && (
        <Stack
          spacing={0}
          role="list"
          aria-label="Linked bank accounts"
          sx={{width: "100%"}}
        >
          {linkedAccounts.map((method, index) => (
            <Box key={method.paymentMethodId} role="listitem">
              <LinkedAccountRow
                method={method}
                isLast={index === linkedAccounts.length - 1}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
