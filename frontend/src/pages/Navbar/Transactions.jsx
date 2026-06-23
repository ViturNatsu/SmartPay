import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Card, Container, LinearProgress, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { WalletActivityTable } from "@/components/transactions/WalletActivityTable";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { tokens } from "@/style/Theme";

/**
 * Wallet Activity list — full transaction history with clickable rows.
 * Supports ?selected={transactionId} to highlight the row the user came back from.
 */
export function Transactions() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("selected");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!tokenClaims?.userId) return;
      setLoading(true);
      try {
        const data = await getWalletTransactions(tokenClaims.userId, 50);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch wallet transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchTransactions();
  }, [authLoading, tokenClaims?.userId]);

  const handleSelect = (tx) => {
    navigate(`/transactions/${tx.transactionId}`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ background: tokens.color.background.app, minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${tokens.color.border.light}`,
              borderRadius: `${tokens.borderRadius.xxl}px`,
              p: "22px",
              boxShadow: tokens.shadow.card,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: tokens.typography.fontWeight.bold, mb: 1.5, letterSpacing: "-0.02em" }}
            >
              Wallet Activity
            </Typography>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {!loading && transactions.length === 0 ? (
              <Typography sx={{ fontSize: 14, color: tokens.color.text.muted }}>
                No wallet activity yet. Load funds to see your first transaction.
              </Typography>
            ) : (
              <WalletActivityTable
                transactions={transactions}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
}
