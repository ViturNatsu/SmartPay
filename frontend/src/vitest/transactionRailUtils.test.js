import { describe, expect, test } from "vitest";
import {
  getRailLabel,
  RAIL_LABELS,
  RAIL_TYPES,
  STANDARD_RAIL_TYPES,
} from "../utils/transactionRailUtils";

describe("transaction rail labels", () => {
  test("supports only the standard rail enum values", () => {
    expect(STANDARD_RAIL_TYPES).toEqual([
      "WALLET_TRANSFER",
      "BANK_TRANSFER",
      "DEBIT_CARD",
    ]);
  });

  test("maps each rail enum to the user-facing payment type label", () => {
    expect(RAIL_LABELS).toEqual({
      [RAIL_TYPES.WALLET_TRANSFER]: "SmartPay Wallet Transfer",
      [RAIL_TYPES.BANK_TRANSFER]: "Bank Transfer",
      [RAIL_TYPES.DEBIT_CARD]: "Debit Card Payment",
    });
  });

  test("does not surface unknown or empty rail values as labels", () => {
    expect(getRailLabel(null)).toBe("N/A");
    expect(getRailLabel("")).toBe("N/A");
    expect(getRailLabel("WIRE_TRANSFER")).toBe("N/A");
  });
});
