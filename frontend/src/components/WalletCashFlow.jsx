import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Card, Stack, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { tokens } from "@/style/Theme";

const INFLOW_TYPES = ["LOAD", "DEPOSIT"];

function isInflow(type) {
  return INFLOW_TYPES.includes(type);
}

function getDisplayName(type) {
  switch (type) {
    case "LOAD":     return "Funds Loaded";
    case "WITHDRAW": return "Funds Withdrawn";
    case "TRANSFER": return "Money Sent";
    case "DEPOSIT":  return "Funds Received";
    default:         return type;
  }
}

function formatAmount(type, amount) {
  const value = Number(amount ?? 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isInflow(type) ? `+${value}` : `-${value}`;
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CashFlowRow({ tx }) {
  const inflow = isInflow(tx.type);

  const rowSx = inflow
    ? { background: tokens.color.status.successBg, border: `1px solid ${tokens.color.status.success}22` }
    : { background: tokens.color.status.errorBg, border: `1px solid ${tokens.color.status.error}22` };

  const iconSx = inflow
    ? { background: `${tokens.color.status.success}22`, color: tokens.color.status.success }
    : { background: `${tokens.color.status.error}22`, color: tokens.color.status.error };

  const amountColor = inflow ? tokens.color.status.success : tokens.color.status.error;

  return (
    <Box
      sx={{
        ...rowSx,
        borderRadius: `${tokens.borderRadius.large}px`,
        p: "16px 18px",
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        gap: "14px",
        alignItems: "center",
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          ...iconSx,
          width: 40,
          height: 40,
          borderRadius: tokens.borderRadius.circle,
          display: "grid",
          placeItems: "center",
        }}
      >
        {inflow ? (
          <ArrowDownwardIcon sx={{ fontSize: 20 }} />
        ) : (
          <ArrowUpwardIcon sx={{ fontSize: 20 }} />
        )}
      </Box>

      {/* Description */}
      <Box>
        <Typography sx={{ fontWeight: tokens.typography.fontWeight.bold, fontSize: 15, mb: 0.5 }}>
          {getDisplayName(tx.type)}
        </Typography>
        <Typography sx={{ fontSize: 13, color: tokens.color.text.secondary }}>
          {tx.description ?? tx.transactionId} · {formatDate(tx.createdAt)}
        </Typography>
      </Box>

      {/* Amount + direction */}
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontWeight: tokens.typography.fontWeight.extrabold, fontSize: 17, color: amountColor }}>
          {formatAmount(tx.type, tx.amount)}
        </Typography>
        <Typography sx={{ fontSize: 12, color: tokens.color.text.muted, fontWeight: tokens.typography.fontWeight.semibold, mt: 0.5 }}>
          {inflow ? "Inflow" : "Outflow"}
        </Typography>
      </Box>
    </Box>
  );
}

function WalletCashFlow() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!tokenClaims?.userId) return;
      setLoading(true);
      try {
        const data = await getWalletTransactions(tokenClaims.userId, 10);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch wallet transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetch();
  }, [authLoading, tokenClaims?.userId]);

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        bgcolor: tokens.color.background.surface,
        borderRadius: `${tokens.borderRadius.xl}px`,
        border: `1px solid ${tokens.color.border.light}`,
        p: "22px",
        boxShadow: tokens.shadow.card,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "18px",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: "-0.02em" }}>
          Wallet Activity
        </Typography>
        <Typography
          component={RouterLink}
          to="/transactions"
          sx={{
            color: tokens.color.brand.primary,
            fontSize: 13,
            fontWeight: tokens.typography.fontWeight.semibold,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View all transactions →
        </Typography>
      </Box>

      {/* Rows */}
      {loading ? (
        <Typography sx={{ fontSize: 13, color: tokens.color.text.muted }}>
          Loading activity...
        </Typography>
      ) : transactions.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: tokens.color.text.muted }}>
          No wallet activity yet. Load funds to see your first transaction.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {transactions.map((tx) => (
            <CashFlowRow key={tx.transactionId} tx={tx} />
          ))}
        </Stack>
      )}
    </Card>
  );
}

export default WalletCashFlow;
