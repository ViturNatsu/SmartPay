import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Button, Card, Container, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import Navbar from "@/components/Navbar";
import { TransactionDetailGrid } from "@/components/transactions/TransactionDetailGrid";
import { useAuth } from "@/context/AuthContext";
import { getWalletTransactions } from "@/api/wallets/walletApi";
import { tokens } from "@/style/Theme";

/**
 * Transaction Details page — displays core fields for a single wallet transaction.
 * Resolves the transaction from the list API by route param :transactionId.
 */
export function TransactionDetails() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tokenClaims, loading: authLoading } = useAuth();

  // Filter the user came from, so Back returns them to the same filtered view
  const originFilter = searchParams.get("filter") || "all";

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!tokenClaims?.userId || !transactionId) return;
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getWalletTransactions(tokenClaims.userId, 50);
        const list = Array.isArray(data) ? data : [];
        const match = list.find((tx) => tx.transactionId === transactionId);
        if (match) {
          setTransaction(match);
        } else {
          setTransaction(null);
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to fetch transaction:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchTransaction();
  }, [authLoading, tokenClaims?.userId, transactionId]);

  const handleBack = () => {
    // Restore both the selected row highlight and the originating filter (Scenario 5)
    const params = new URLSearchParams();
    params.set("selected", transactionId);
    params.set("filter", originFilter);
    navigate(`/transactions?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ background: tokens.color.background.app, minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: 13, color: tokens.color.text.muted, mb: 1.75 }}>
            Transactions / Wallet Activity / Transaction Details
          </Typography>

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${tokens.color.border.light}`,
              borderRadius: `${tokens.borderRadius.xxl}px`,
              p: "28px",
              boxShadow: tokens.shadow.card,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: "-0.04em",
                mb: 0.75,
              }}
            >
              Transaction Details
            </Typography>

            <Typography sx={{ color: tokens.color.text.muted, fontSize: 15, mb: 2.5 }}>
              Review the details of this wallet transaction.
            </Typography>

            {loading && <LinearProgress sx={{ mt: 2 }} />}

            {!loading && notFound && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: 14, color: tokens.color.text.muted, mb: 2 }}>
                  Transaction not found or no longer available.
                </Typography>
                <Button
                  onClick={() => navigate(`/transactions?filter=${encodeURIComponent(originFilter)}`)}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Back to Activity
                </Button>
              </Box>
            )}

            {!loading && transaction && (
              <>
                <TransactionDetailGrid transaction={transaction} />
                <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Download Receipt
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Back to Activity
                  </Button>
                </Stack>
              </>
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
}
