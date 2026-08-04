import {useCallback, useEffect, useMemo, useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
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
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {useAuth} from "@/context/AuthContext";
import {getWalletTransactions} from "@/api/wallets/walletApi";
import {
  MOCK_UNIFIED_FEED,
  MOCK_WALLET_CAP_WHEN_MERGING,
  USE_FORCE_EMPTY_STATE,
  USE_MOCK_UNIFIED_FEED,
  USE_MOCK_WHEN_EMPTY,
} from "@/data/mockTransactionsActivityFeed";
import {tokens} from "@/style/Theme";
import {
  FEED_LIMIT,
  formatFeedAmount,
  formatFeedDate,
  formatRelativeActivityDate,
  getFeedDescription,
  getFeedTitle,
  isFeedInflow,
  isMockFeedEntry,
  isWalletEntry,
  resolveFeedTransactions,
} from "@/utils/transactionsActivityFeedUtils";

/** Scenario 3 / AC5 — nothing at all (no wallet, no transactions) */
const FULL_EMPTY_MESSAGE = "No transactions or wallet activity to display yet.";

/** Wallet exists but no account transactions yet */
const TRANSACTION_EMPTY_MESSAGE = "No account transactions yet.";

/** Scenario 4 / AC6 */
const ERROR_MESSAGE =
  "Unable to retrieve transaction and wallet data. Please try again.";

function ActivityFeedRow({entry, onSelect}) {
  const inflow = isFeedInflow(entry);
  const title = getFeedTitle(entry);
  const description = getFeedDescription(entry);
  const dateLabel =
    formatRelativeActivityDate(entry.createdAt) ||
    formatFeedDate(entry.createdAt);
  const detailLine = `${description} · ${dateLabel}`;
  const amount = formatFeedAmount(entry);
  const showWalletLabel = isWalletEntry(entry);
  const isMock = isMockFeedEntry(entry);
  const isClickable = !isMock && isWalletEntry(entry);

  const rowBg = inflow ? "#e9f8ee" : "#fdecea";
  const iconBg = inflow ? "#c9efd6" : "#f7d3ce";
  const accent = inflow ? "#1a8f4c" : "#c4392f";

  return (
    <Box
      component="li"
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? () => onSelect(entry) : undefined}
      onKeyDown={
        isClickable
          ? event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(entry);
              }
            }
          : undefined
      }
      aria-label={`${title}. ${detailLine}. ${amount}${
        showWalletLabel ? ". Wallet activity." : ""
      }`}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        py: "11px",
        pl: "12px",
        pr: "16px",
        borderRadius: "12px",
        bgcolor: rowBg,
        cursor: isClickable ? "pointer" : "default",
        transition: "opacity 0.15s",
        "&:hover": isClickable ? {opacity: 0.92} : undefined,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 34,
          height: 34,
          borderRadius: tokens.borderRadius.circle,
          bgcolor: iconBg,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {inflow ? (
          <ArrowDownwardIcon sx={{fontSize: 18}} />
        ) : (
          <ArrowUpwardIcon sx={{fontSize: 18}} />
        )}
      </Box>

      <Box sx={{flex: 1, minWidth: 0}}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{mb: 0.25}}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13.5,
              color: tokens.color.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          {showWalletLabel && (
            <Chip
              label="Wallet"
              size="small"
              aria-label="Wallet activity"
              sx={{
                height: 20,
                fontSize: 10.5,
                fontWeight: 700,
                bgcolor: tokens.color.brand.primaryLight,
                color: tokens.color.brand.primary,
                flexShrink: 0,
              }}
            />
          )}
        </Stack>
        <Typography
          component="time"
          dateTime={entry.createdAt}
          sx={{
            fontSize: 12,
            color: tokens.color.text.secondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {detailLine}
        </Typography>
      </Box>

      <Typography
        aria-label={`Amount ${amount}`}
        sx={{
          fontWeight: 800,
          fontSize: 13.5,
          color: accent,
          whiteSpace: "nowrap",
          flexShrink: 0,
          ml: "auto",
          pl: 1,
          textAlign: "right",
        }}
      >
        {amount}
      </Typography>
    </Box>
  );
}

/**
 * US 15-01-11 — Unified transactions + wallet activity feed (max 6 items).
 * Scenario 5: scoped to the authenticated user's default account until
 * account-level transaction APIs and account selection are available.
 */
export default function TransactionsActivityFeed({refreshKey = 0}) {
  const {tokenClaims, loading: authLoading} = useAuth();
  const navigate = useNavigate();
  const [apiTransactions, setApiTransactions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadFeed = useCallback(async () => {
    if (!tokenClaims?.userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getWalletTransactions(tokenClaims.userId, 0, 25);
      setApiTransactions(data.transactions ?? []);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || ERROR_MESSAGE);
      setApiTransactions([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [tokenClaims?.userId]);

  useEffect(() => {
    if (!authLoading) {
      loadFeed();
    }
  }, [authLoading, loadFeed, refreshKey, retryCount]);

  const hasError = Boolean(error);

  const feedState = useMemo(() => {
    if (USE_FORCE_EMPTY_STATE) {
      return {
        displayEntries: [],
        totalCount: 0,
        showTransactionEmptyMessage: false,
        showFullEmpty: true,
        usingMock: false,
      };
    }

    return resolveFeedTransactions({
      apiTransactions,
      totalElements,
      mockUnifiedFeed: MOCK_UNIFIED_FEED,
      useMockUnifiedFeed: USE_MOCK_UNIFIED_FEED,
      useMockWhenEmpty: USE_MOCK_WHEN_EMPTY,
      hasError,
      walletCapWhenMerging: MOCK_WALLET_CAP_WHEN_MERGING,
    });
  }, [apiTransactions, totalElements, hasError]);

  const {
    displayEntries,
    totalCount,
    showTransactionEmptyMessage,
    showFullEmpty,
  } = feedState;

  /** Scenario 6 / AC7 — only when more than 6 combined entries exist */
  const showViewAll =
    !loading && !hasError && !showFullEmpty && totalCount > FEED_LIMIT;

  const handleSelect = entry => {
    navigate(`/transactions/${entry.transactionId}`);
  };

  return (
    <Card
      elevation={0}
      component="section"
      aria-label="Transactions"
      aria-busy={loading}
      sx={{
        width: "100%",
        minWidth: 0,
        bgcolor: tokens.color.background.surface,
        borderRadius: "16px",
        border: `1px solid ${tokens.color.border.light}`,
        boxShadow: "0 1px 2px rgba(16, 32, 29, 0.06)",
        p: "22px 24px",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "14px",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          component="h2"
          id="transactions-feed-heading"
          sx={{
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: tokens.color.text.primary,
          }}
        >
          Transactions
        </Typography>
        {showViewAll && (
          <Typography
            component={RouterLink}
            to="/transactions"
            aria-label="View all transactions and wallet activity history"
            sx={{
              color: tokens.color.brand.primary,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
              "&:hover": {textDecoration: "underline"},
            }}
          >
            View all →
          </Typography>
        )}
      </Box>

      {loading && (
        <Box
          sx={{display: "flex", justifyContent: "center", py: 3}}
          role="status"
          aria-live="polite"
        >
          <CircularProgress size={24} aria-label="Loading transactions" />
        </Box>
      )}

      {!loading && hasError && (
        <Alert
          severity="error"
          role="alert"
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

      {!loading && !hasError && showFullEmpty && (
        <Box
          role="status"
          sx={{
            borderRadius: "12px",
            bgcolor: tokens.color.background.app,
            p: "28px",
            textAlign: "center",
          }}
        >
          <Typography sx={{fontSize: 13.5, color: tokens.color.text.secondary}}>
            {FULL_EMPTY_MESSAGE}
          </Typography>
        </Box>
      )}

      {!loading && !hasError && !showFullEmpty && (
        <Stack spacing="7px" sx={{width: "100%"}}>
          {showTransactionEmptyMessage && (
            <Box
              role="status"
              sx={{
                borderRadius: "12px",
                bgcolor: tokens.color.background.app,
                p: "28px",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{fontSize: 13.5, color: tokens.color.text.secondary}}
              >
                {TRANSACTION_EMPTY_MESSAGE}
              </Typography>
            </Box>
          )}

          {displayEntries.length > 0 && (
            <Stack
              component="ul"
              spacing="7px"
              role="list"
              aria-labelledby="transactions-feed-heading"
              aria-label="Recent wallet activity"
              sx={{m: 0, p: 0, width: "100%", boxSizing: "border-box"}}
            >
              {displayEntries.map(entry => (
                <ActivityFeedRow
                  key={entry.transactionId}
                  entry={entry}
                  onSelect={handleSelect}
                />
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Card>
  );
}
