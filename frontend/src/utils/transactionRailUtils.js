// Utility functions for mapping transaction rail types to user-friendly labels
export const RAIL_LABELS = {
  WALLET_TRANSFER: 'SmartPay Wallet Transfer',
  BANK_TRANSFER:   'Bank Transfer',
  DEBIT_CARD:      'Debit Card Payment',
};

export const getRailLabel = (railType) =>
  RAIL_LABELS[railType] ?? railType;