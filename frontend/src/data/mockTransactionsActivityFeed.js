/**
 * QA / demo toggles — save file, then hard-refresh the browser (Ctrl+Shift+R).
 * Restart `npm run dev` only if the page still looks stale.
 *
 * | USE_MOCK_UNIFIED_FEED | USE_MOCK_WHEN_EMPTY | Result |
 * | true                  | false               | Live wallet (max 3) + mock transactions |
 * | false                 | false               | Wallet rows + transaction empty message when only wallet API data |
 * | false                 | true                | Full mock feed when API has no transaction data |
 * | USE_FORCE_EMPTY_STATE | true (QA)           | Always shows empty message |
 */
export const USE_MOCK_UNIFIED_FEED = false;
export const USE_MOCK_WHEN_EMPTY = true;

/** Set true to preview the empty state without clearing wallet data (QA only). */
export const USE_FORCE_EMPTY_STATE = false;

/** Max live wallet rows included when merging with mock transactions (QA vision). */
export const MOCK_WALLET_CAP_WHEN_MERGING = 3;

/** @typedef {'WALLET' | 'TRANSACTION'} FeedCategory */

/** @type {Array<object>} Sorted newest-first when displayed */
export const MOCK_UNIFIED_FEED = [
  {
    transactionId: "MOCK-WALLET-001",
    feedCategory: "WALLET",
    type: "LOAD",
    amount: 200,
    bankDisplayName: "TD",
    description: "Wallet load from TD",
    createdAt: "2026-07-30T14:30:00Z",
  },
  {
    transactionId: "MOCK-TXN-001",
    feedCategory: "TRANSACTION",
    type: "PURCHASE",
    title: "Coffee Purchase",
    subtitle: "Coffee House · Yesterday",
    amount: 18.5,
    direction: "DEBIT",
    createdAt: "2026-07-29T09:15:00Z",
  },
  {
    transactionId: "MOCK-TXN-002",
    feedCategory: "TRANSACTION",
    type: "RECURRING",
    title: "Recurring Payment",
    subtitle: "Hydro One · Jul 28",
    amount: 89.2,
    direction: "DEBIT",
    createdAt: "2026-07-28T12:00:00Z",
  },
  {
    transactionId: "MOCK-WALLET-002",
    feedCategory: "WALLET",
    type: "TRANSFER",
    amount: 75,
    description: "Transfer to John Smith",
    createdAt: "2026-07-27T16:45:00Z",
  },
  {
    transactionId: "MOCK-TXN-003",
    feedCategory: "TRANSACTION",
    type: "SUBSCRIPTION",
    title: "Subscription",
    subtitle: "Netflix · Jul 26",
    amount: 15.99,
    direction: "DEBIT",
    createdAt: "2026-07-26T08:00:00Z",
  },
  {
    transactionId: "MOCK-WALLET-003",
    feedCategory: "WALLET",
    type: "LOAD",
    amount: 150,
    bankDisplayName: "RBC",
    description: "Wallet load from RBC",
    createdAt: "2026-07-25T11:00:00Z",
  },
  {
    transactionId: "MOCK-TXN-004",
    feedCategory: "TRANSACTION",
    type: "DEPOSIT",
    title: "Salary Deposit",
    subtitle: "Employer Payroll · Jul 24",
    amount: 4250,
    direction: "CREDIT",
    createdAt: "2026-07-24T09:00:00Z",
  },
  {
    transactionId: "MOCK-TXN-005",
    feedCategory: "TRANSACTION",
    type: "PURCHASE",
    title: "Merchant Payment",
    subtitle: "Amazon · Jul 23",
    amount: 52.99,
    direction: "DEBIT",
    createdAt: "2026-07-23T13:20:00Z",
  },
];
