import { useCallback, useState } from "react";

const STORAGE_KEY = "recurringPaymentsActiveTab";
const VALID_TABS = new Set(["subscriptions", "bills"]);
const DEFAULT_TAB = "bills";

function readStoredTab() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_TABS.has(stored) ? stored : DEFAULT_TAB;
  } catch {
    return DEFAULT_TAB;
  }
}

function persistTab(tab) {
  try {
    localStorage.setItem(STORAGE_KEY, tab);
  } catch {
    // Ignore storage errors (e.g. private browsing).
  }
}

/**
 * Manages the active Recurring Payments tab with localStorage persistence
 * so the selected tab survives navigating away and returning (Scenario 8).
 */
export function useRecurringPaymentsTab() {
  const [activeTab, setActiveTab] = useState(readStoredTab);

  const handleTabChange = useCallback((_, newTab) => {
    if (newTab === null || !VALID_TABS.has(newTab)) return;
    setActiveTab(newTab);
    persistTab(newTab);
  }, []);

  return { activeTab, handleTabChange };
}
