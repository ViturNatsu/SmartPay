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
  TextField,
  Pagination
} from "@mui/material";

import TransactionFilterBar from "../../components/table/TransactionFilterBar";
import CustomNoRowsOverlay from "../../components/table/CustomNoRowOverlay";
import { WalletActivityTable } from "@/components/transactions/WalletActivityTable";
import { filterTransactions } from "../../utils/transactionUtils";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { getMerchantPayee } from "@/utils/walletTransactionFormatters";
import { tokens } from "@/style/Theme";
import { updateTransactionFavourite } from "@/api/wallets/walletApi";

const TRANSACTION_LIMIT = 25;

export function Transactions() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter and selected row are read from the URL so they survive navigation
  // to the details page and back (Scenario 5: return without losing context).
  const selectedId = searchParams.get("selected");
  const activeFilter = searchParams.get("filter") || "all";

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");



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
        const data = await getWalletTransactions(tokenClaims.userId, currentPage, TRANSACTION_LIMIT, activeFilter === "favourites" ? true : null);
        if (!cancelled)
        {
          setRawTransactions(data.transactions ?? []);
          setCurrentPage(data.currentPage ?? 0);
          setTotalPages(data.totalPages ?? 0);
          setTotalElements(data.totalElements ?? 0);
        }
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
  }, [authLoading, tokenClaims?.userId, retryCount, activeFilter, currentPage]);

  const rows = useMemo(
    () => filterTransactions(rawTransactions, activeFilter),
    [rawTransactions, activeFilter]
  );


  const handlePageChange = (_event, pageNumber) => {
    setCurrentPage(pageNumber - 1);

    const params = new URLSearchParams(searchParams);
    params.delete("selected");
    setSearchParams(params);
  };

  const handleFilterChange = (next) => {
    const params = new URLSearchParams(searchParams);

    params.set("filter", next);
    params.delete("selected");

    setCurrentPage(0);
    setSearchParams(params);
  };

  const handleSelect = (tx) => {
    // Carry the active filter into the details page so Back can restore it
    navigate(`/transactions/${tx.transactionId}?filter=${encodeURIComponent(activeFilter)}`);
  };


  const handleFavouriteToggle = async (transactionId) => {
    // Find the current transaction
    const transaction = rawTransactions.find((tx) => tx.transactionId === transactionId);

    if (!transaction) {
      return;
    }

    const newFavourite = !transaction.favourite;
    setRawTransactions((prev) =>
      prev.map((tx) =>
        tx.transactionId === transactionId ? { ...tx, favourite: newFavourite } : tx
      )
    );

    try {
      const updatedTransaction = await updateTransactionFavourite(tokenClaims.userId, transactionId, newFavourite);

      // Replace optimistic transaction with backend response
      setRawTransactions((prev) =>
        prev.map((tx) =>
          tx.transactionId === updatedTransaction.transactionId ? updatedTransaction : tx
        )
      );
    } catch (err) {
      setRawTransactions((prev) =>
        prev.map((tx) =>
          tx.transactionId === transactionId ? { ...tx, favourite: transaction.favourite } : tx
        )
      );

      console.error("Failed to update favourite:", err);
    }
  };


  const filteredRows = rows.filter((tx) => {
    const merchant = getMerchantPayee(tx);

    return merchant
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });


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


            <TextField
              fullWidth
              size="small"
              placeholder="Search by merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />


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
                        ) : !error && filteredRows.length === 0 ? (
              <Box sx={{ height: 160 }}>
                {searchQuery ? (
                  <Typography
                    align="center"
                    sx={{ mt: 6, color: tokens.color.text.muted }}
                  >
                    No matching transactions found.
                  </Typography>
                ) : (
                  <CustomNoRowsOverlay />
                )}
              </Box>
            ) : (
          !error && (
                <Box>
                  <WalletActivityTable
                    transactions={filteredRows}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    onFavouriteToggle={handleFavouriteToggle}
                  />

                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={handlePageChange}
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}

                  {totalElements > 0 && (
                    <Typography
                      align="center"
                      sx={{
                        mt: 1.5,
                        fontSize: 14,
                        color: tokens.color.text.muted
                      }}
                    >
                      {totalElements} transaction{totalElements === 1 ? "" : "s"}
                    </Typography>
                  )}
                </Box>
              )
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}
