/**
 *  Transactions page (Wallet Activity)
 *
 *  Displays all of the user's wallet transactions in a table, with filtering
 *  between All, Purchases, and Sent & Received. Selecting a row opens the
 *  Transaction Details page. The active filter and selected row are kept in
 *  the URL so context is preserved when navigating back (Scenario 5).
 */
import Navbar from "@/components/Navbar";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Alert,
  CircularProgress,
  Box,
  Container,
  Button,
  AlertTitle,
} from "@mui/material";

import TransactionFilterBar from "../../components/table/TransactionFilterBar";
import { WalletActivityTable } from "@/components/transactions/WalletActivityTable";
import { filterTransactions } from "../../utils/transactionUtils";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { tokens } from "@/style/Theme";

const TRANSACTION_LIMIT = 25;

export function Transactions() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter and selected row are read from the URL so they survive navigation
  // to the details page and back (Scenario 5: return without losing context).
  const selectedId = searchParams.get("selected");
  const activeFilter = searchParams.get("filter") || "all";

  const [rawTransactions, setRawTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!tokenClaims?.userId) {
      setError("Not authenticated");
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTransactions() {
      setDataLoading(true);
      setError(null);
      try {
        const data = await getWalletTransactions(tokenClaims.userId, TRANSACTION_LIMIT);
        if (!cancelled) setRawTransactions(data);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load transactions");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenClaims?.userId, retryCount]);

  const rows = useMemo(
    () => filterTransactions(rawTransactions, activeFilter),
    [rawTransactions, activeFilter]
  );

  const handleFilterChange = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", next);
    // Clear stale row selection when the filter changes
    params.delete("selected");
    setSearchParams(params);
  };

  const handleSelect = (tx) => {
    // Carry the active filter into the details page so Back can restore it
    navigate(`/transactions/${tx.transactionId}?filter=${encodeURIComponent(activeFilter)}`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ background: tokens.color.background.app, minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              background: tokens.color.background.surface,
              border: `1px solid ${tokens.color.border.light}`,
              borderRadius: `${tokens.borderRadius.xxl}px`,
              boxShadow: tokens.shadow.card,
              p: "28px",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, fontSize: 34, letterSpacing: "-0.04em", mb: 0.75 }}
            >
              Wallet Activity
            </Typography>
            <Typography sx={{ color: tokens.color.text.muted, fontSize: 15, mb: 2.5 }}>
              View all of your wallet transactions. Select a row to see full details.
            </Typography>

            {/* Filter Bar */}
            <TransactionFilterBar activeFilter={activeFilter} onChange={handleFilterChange} />

            {/* Error Retry button */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="error"
                    size="small"
                    onClick={() => setRetryCount((c) => c + 1)}
                    data-testid="retry-button"
                  >
                    Try again
                  </Button>
                }
              >
                <AlertTitle>Failed to load transactions</AlertTitle>
                {error}
              </Alert>
            )}

            {dataLoading || authLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !error && rows.length === 0 ? (
              <Typography sx={{ fontSize: 14, color: tokens.color.text.muted }}>
                No transactions found
              </Typography>
            ) : (
              !error && (
                <WalletActivityTable
                  transactions={rows}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              )
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}
