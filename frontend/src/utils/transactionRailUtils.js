// Utility functions for mapping transaction rail types to user-friendly labels
export const RAIL_TYPES = Object.freeze({
  WALLET_TRANSFER: 'WALLET_TRANSFER',
  BANK_TRANSFER: 'BANK_TRANSFER',
  DEBIT_CARD: 'DEBIT_CARD',
});

export const RAIL_LABELS = {
  [RAIL_TYPES.WALLET_TRANSFER]: 'SmartPay Wallet Transfer',
  [RAIL_TYPES.BANK_TRANSFER]: 'Bank Transfer',
  [RAIL_TYPES.DEBIT_CARD]: 'Debit Card Payment',
};

export const STANDARD_RAIL_TYPES = Object.freeze(Object.values(RAIL_TYPES));

export const getRailLabel = (railType) =>
  RAIL_LABELS[railType] ?? 'N/A';
