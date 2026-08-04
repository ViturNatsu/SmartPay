import { isInflow } from "@/utils/walletTransactionFormatters";

export const FEED_LIMIT = 6;

export const FEED_CATEGORY = Object.freeze({
  WALLET: "WALLET",
  TRANSACTION: "TRANSACTION",
});

export function getFeedCategoryLabel(entry) {
  return entry?.feedCategory === FEED_CATEGORY.TRANSACTION
    ? "Transaction"
    : "Wallet";
}

export function isWalletEntry(entry) {
  return entry?.feedCategory === FEED_CATEGORY.WALLET;
}

/** Normalize a wallet API row into unified feed shape */
export function normalizeWalletFeedEntry(tx) {
  return {
    ...tx,
    feedCategory: FEED_CATEGORY.WALLET,
  };
}

export function isMockFeedEntry(entry) {
  return String(entry?.transactionId ?? "").startsWith("MOCK-");
}

export function isFeedInflow(entry) {
  if (entry.feedCategory === FEED_CATEGORY.TRANSACTION) {
    return entry.direction === "CREDIT";
  }
  return isInflow(entry.type);
}

export function formatFeedAmount(entry) {
  const inflow = isFeedInflow(entry);
  const value = Number(entry.amount ?? 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return inflow ? `+${value}` : `-${value}`;
}

/** AC2 — description / merchant line */
export function getFeedDescription(entry) {
  if (entry.description?.trim()) return entry.description.trim();

  if (entry.subtitle?.trim()) {
    return entry.subtitle.split("·")[0].trim();
  }

  switch (entry.type) {
    case "LOAD":
      return entry.bankDisplayName
        ? `Wallet load from ${entry.bankDisplayName}`
        : "Wallet load";
    case "WITHDRAW":
      return entry.bankDisplayName
        ? `Withdraw to ${entry.bankDisplayName}`
        : "Wallet withdraw";
    case "TRANSFER":
      return "Money sent";
    case "DEPOSIT":
      return "Funds received";
    default:
      return getFeedTitle(entry);
  }
}

/** Primary row title */
export function getFeedTitle(entry) {
  if (entry.title) return entry.title;

  switch (entry.type) {
    case "LOAD":
      return "Funds Loaded";
    case "WITHDRAW":
      return "Funds Withdrawn";
    case "TRANSFER":
      return "Money Sent";
    case "DEPOSIT":
      return entry.feedCategory === FEED_CATEGORY.TRANSACTION
        ? "Deposit"
        : "Funds Received";
    case "PURCHASES":
    case "PURCHASE":
      return "Merchant Payment";
    case "RECURRING":
      return "Recurring Payment";
    case "SUBSCRIPTION":
      return "Subscription";
    default:
      return "Transaction";
  }
}

export function formatFeedDate(isoDate) {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeActivityDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEntry = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday - startOfEntry) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  return date.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

/** AC2 — secondary line: merchant/detail · date */
export function getFeedSubtitle(entry) {
  const relative = formatRelativeActivityDate(entry.createdAt);

  if (entry.subtitle?.trim()) {
    return entry.subtitle.includes("·")
      ? entry.subtitle.trim()
      : `${entry.subtitle.trim()} · ${relative}`;
  }

  const description = String(entry.description ?? "").trim();
  const bank = entry.bankDisplayName?.trim();
  let detail = description;

  if (entry.type === "LOAD") {
    const source = bank || description.replace(/^Wallet load from /i, "") || "linked bank";
    detail = `From ${source}`;
  } else if (entry.type === "WITHDRAW") {
    const dest = bank || description.replace(/^Withdraw to /i, "") || "linked bank";
    detail = `To ${dest}`;
  } else if (entry.type === "DEPOSIT" && entry.feedCategory === FEED_CATEGORY.WALLET) {
    const source = description.replace(/^Received transfer from /i, "") || "sender";
    detail = `From ${source}`;
  } else if (entry.type === "TRANSFER") {
    const recipient = description.replace(/^Transfer to /i, "") || "recipient";
    detail = `To ${recipient}`;
  }

  return relative ? `${detail} · ${relative}` : detail;
}

function sortFeedNewestFirst(entries) {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Builds display state: wallet rows can show alongside the transaction empty message.
 */
function buildFeedResult(walletEntries, transactionEntries, walletTotalFromApi = 0) {
  const hasWallet = walletEntries.length > 0;
  const hasTransaction = transactionEntries.length > 0;

  if (!hasWallet && !hasTransaction) {
    return {
      displayEntries: [],
      totalCount: 0,
      showTransactionEmptyMessage: false,
      showFullEmpty: true,
      usingMock: false,
    };
  }

  if (hasTransaction) {
    const merged = sortFeedNewestFirst([...walletEntries, ...transactionEntries]);
    return {
      displayEntries: merged.slice(0, FEED_LIMIT),
      totalCount: merged.length,
      showTransactionEmptyMessage: false,
      showFullEmpty: false,
      usingMock: merged.some(isMockFeedEntry),
    };
  }

  const sortedWallet = sortFeedNewestFirst(walletEntries);
  return {
    displayEntries: sortedWallet.slice(0, FEED_LIMIT),
    totalCount: Math.max(walletTotalFromApi, sortedWallet.length),
    showTransactionEmptyMessage: true,
    showFullEmpty: false,
    usingMock: false,
  };
}

/**
 * AC4 / Scenario 5 — unified feed for the authenticated user's default account scope.
 * Wallet entries come from the API; transaction entries use mock data until a
 * transaction-history API exists (USE_MOCK_UNIFIED_FEED).
 */
export function resolveFeedTransactions({
  apiTransactions,
  totalElements,
  mockUnifiedFeed,
  useMockUnifiedFeed,
  useMockWhenEmpty,
  hasError,
  walletCapWhenMerging = 3,
}) {
  if (hasError) {
    return {
      displayEntries: [],
      totalCount: 0,
      showTransactionEmptyMessage: false,
      showFullEmpty: true,
      usingMock: false,
    };
  }

  const walletEntries = (apiTransactions ?? []).map(normalizeWalletFeedEntry);
  const mockTransactions = (mockUnifiedFeed ?? []).filter(
    entry => entry.feedCategory === FEED_CATEGORY.TRANSACTION,
  );
  const mockWalletEntries = (mockUnifiedFeed ?? []).filter(
    entry => entry.feedCategory === FEED_CATEGORY.WALLET,
  );

  if (useMockUnifiedFeed) {
    const liveWalletSlice = sortFeedNewestFirst(walletEntries).slice(
      0,
      walletCapWhenMerging,
    );
    const walletSource =
      liveWalletSlice.length > 0 ? liveWalletSlice : mockWalletEntries;

    if (mockTransactions.length > 0) {
      return buildFeedResult(walletSource, mockTransactions, totalElements);
    }

    if (walletSource.length > 0) {
      return buildFeedResult(walletSource, [], totalElements);
    }

    return buildFeedResult(mockWalletEntries, mockTransactions, totalElements);
  }

  const apiTransactionEntries = (apiTransactions ?? [])
    .filter(tx => tx.feedCategory === FEED_CATEGORY.TRANSACTION)
    .map(entry => ({...entry, feedCategory: FEED_CATEGORY.TRANSACTION}));

  if (apiTransactionEntries.length > 0) {
    return buildFeedResult(walletEntries, apiTransactionEntries, totalElements);
  }

  if (walletEntries.length > 0) {
    return buildFeedResult(walletEntries, [], totalElements);
  }

  if (useMockWhenEmpty && mockUnifiedFeed?.length > 0) {
    return buildFeedResult(mockWalletEntries, mockTransactions, 0);
  }

  return buildFeedResult([], [], 0);
}
