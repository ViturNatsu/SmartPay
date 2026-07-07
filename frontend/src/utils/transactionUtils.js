/**
 * transactionUtils.js
 *
 *  Responsibilities:
 *    - Call transaction API to fetch all transactions
 *    - Handle filtering between Groups ( ALL, Purchases, Sent & Received )
 */
 
// ---- Normalization ----------------------------------------------------
 
/**
 * Transaction Json type:
 * {
 *   type: 'LOAD' | 'WITHDRAW' | 'DEPOSIT' | 'TRANSFER' | 'PURCHASES',
 * }
 */
 
/**
 * Types where money leaves the wallet → negative amount.
 * WITHDRAW: wallet → bank
 * TRANSFER: wallet → another wallet
 */
const OUTFLOW_TYPES = new Set(['WITHDRAW', 'TRANSFER']);
 
export function normalizeTransaction(raw) {
  const isOutflow = OUTFLOW_TYPES.has(raw.type);
 
  return {
    id: raw.transactionId,
    label: raw.description,
    bank: raw.bankDisplayName,
    date: raw.createdAt,
    amount: isOutflow ? -Math.abs(raw.amount) : Math.abs(raw.amount),
    status: raw.status,
    type: raw.type,
    railType: raw.railType,
  };
}
 
export function normalizeTransactions(rawList) {
  return rawList.map(normalizeTransaction);
}
 
// ---- Filtering Group ----------------------------------------------------------
 
/**
 *  All             → everything
 *  Purchases       → PURCHASES
 *  Sent & Received → LOAD (bank → wallet top-up)
 *                    DEPOSIT (incoming funds)
 *                    WITHDRAW (wallet → bank)
 *                    TRANSFER (wallet → wallet)
 */
const PURCHASES_TYPES = new Set(['PURCHASES']);
const TRANSFERS_TYPES = new Set(['LOAD', 'DEPOSIT', 'WITHDRAW', 'TRANSFER']);
 
export const TRANSACTION_FILTERS = {
  all: {
    label: 'All',
    predicate: () => true,
  },
  purchases: {
    label: 'Purchases',
    predicate: (t) => PURCHASES_TYPES.has(t.type),
  },
  transfers: {
    label: 'Sent & Received',
    predicate: (t) => TRANSFERS_TYPES.has(t.type),
  },
  favourites: {
    label: 'Favourites',
    predicate: (t) => true,
  },
};
 
export function filterTransactions(transactions, filterKey) {
  const filter = TRANSACTION_FILTERS[filterKey] ?? TRANSACTION_FILTERS.all;
  return transactions.filter(filter.predicate);
}