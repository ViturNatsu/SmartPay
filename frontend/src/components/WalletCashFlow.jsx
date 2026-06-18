import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Card, Stack, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";

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
    ? { background: "#EEFAF2", border: "1px solid #D7F0DF" }
    : { background: "#FFF0F0", border: "1px solid #FFDADA" };

  const iconSx = inflow
    ? { background: "#D9F3E2", color: "#14833B" }
    : { background: "#FFE1E1", color: "#C62828" };

  const amountColor = inflow ? "#15803D" : "#B91C1C";

  return (
    <Box
      sx={{
        ...rowSx,
        borderRadius: "14px",
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
          borderRadius: "50%",
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
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
          {getDisplayName(tx.type)}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
          {tx.description ?? tx.transactionId} · {formatDate(tx.createdAt)}
        </Typography>
      </Box>

      {/* Amount + direction */}
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontWeight: 800, fontSize: 17, color: amountColor }}>
          {formatAmount(tx.type, tx.amount)}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 600, mt: 0.5 }}>
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
        bgcolor: "#fff",
        borderRadius: "18px",
        border: "1px solid #E5E7EB",
        p: "22px",
        boxShadow: "0 8px 20px rgba(15,23,42,.04)",
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
        <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Wallet Activity
        </Typography>
        <Typography
          component={RouterLink}
          to="/transactions"
          sx={{
            color: "#008C99",
            fontSize: 13,
            fontWeight: 650,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View all transactions →
        </Typography>
      </Box>

      {/* Rows */}
      {loading ? (
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
            <CashFlowRow key={tx.transactionId} tx={tx} />
          ))}
        </Stack>
      )}
    </Card>
  );
}

export default WalletCashFlow;
