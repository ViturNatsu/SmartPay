/**
 *  Transactional page
 *
 *  Disply all user's transactions in an transactional table.
 *  With filitering between ALL, Purchases, Sent & Received
 * 
 */
import Navbar from "@/components/Navbar"
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Paper, 
  Typography,
  LinearProgress, 
  Alert, 
  Card,
  CircularProgress, 
  Box, 
  Container,
  Button,
  AlertTitle
} from '@mui/material';

import TransactionFilterBar from '../../components/table/TransactionFilterBar';
import { WalletActivityTable } from "@/components/transactions/WalletActivityTable";
import { filterTransactions } from '../../utils/transactionUtils';
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { TransactionTable } from "../../components/table/TransactionTable";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/style/Theme";

const TRANSACTION_LIMIT = 25;

export function Transactions() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("selected");


  const [rawTransactions, setRawTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    if (authLoading) return;
    if (!tokenClaims?.userId) {
      setError('Not authenticated');
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
        if (!cancelled) setError(err.message ?? 'Failed to load transactions');
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

  const handleSelect = (tx) => {
    navigate(`/transactions/${tx.transactionId}`);
  };

  return (
    <>
    <Navbar />
    <Box sx={{background: theme.palette.background.default , minHeight: "100vh", py: 4}}>
      <Container maxWidth="lg">
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Wallet Activity
            </Typography>

            {/* Filter Bar */}
            <TransactionFilterBar
              activeFilter={activeFilter}
              onChange={setActiveFilter}
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
            ) : !error && rows.length === 0 ? (
              <Typography sx={{ fontSize: 14, color: tokens.color.text.muted }}>
                No wallet activity yet. Load funds to see your first transaction.
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

          </Paper>
        </Container>
      </Box>
    </>
  );
}
