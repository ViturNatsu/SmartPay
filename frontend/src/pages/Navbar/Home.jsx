import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Stack } from "@mui/material";
import QuickActions from "@/components/QuickActions";
import ImportantMessages, {
  IMPORTANT_MESSAGES_PANEL_ID,
} from "@/components/ImportantMessages";
import WalletCashFlow from "@/components/WalletCashFlow";
import TransactionHistory from "@/components/TransactionHistory";
import LoadWalletDialog from "@/components/LoadWalletDialog";
import { useAuth } from "@/context/AuthContext";
import WalletBalance from "@/components/WalletBalance";

import { tokens } from "@/style/Theme.jsx";
export const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadWalletOpen, setLoadWalletOpen] = useState(false);
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);

  useEffect(() => {
    if (!location.state?.scrollToNotifications) return;

    let cancelled = false;
    let settleTimer = null;

    const scrollToPanel = (behavior) => {
      document
        .getElementById(IMPORTANT_MESSAGES_PANEL_ID)
        ?.scrollIntoView({ behavior, block: "start" });
    };

    // Wallet balance, cash flow, transaction history, and this panel each
    // load their data asynchronously, so the page's height keeps changing
    // for a bit after mount — a single scroll-on-mount lands wherever the
    // layout happened to be at that instant, which is usually short of the
    // final position. Re-align every time the page's height changes, until
    // it's gone quiet for a moment, instead of guessing a fixed delay.
    const observer = new ResizeObserver(() => {
      if (cancelled) return;
      scrollToPanel("auto");
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => observer.disconnect(), 400);
    });

    requestAnimationFrame(() => {
      if (cancelled) return;
      scrollToPanel("smooth");
      observer.observe(document.body);
      // Hard cap so this can't keep re-scrolling indefinitely.
      settleTimer = setTimeout(() => observer.disconnect(), 2500);
    });

    // Clear the flag so a refresh or back-navigation doesn't re-trigger it.
    navigate(location.pathname, { replace: true, state: {} });

    return () => {
      cancelled = true;
      observer.disconnect();
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [location.state, location.pathname, navigate]);

  return (
    <>
      <Navbar />
      <div
        style={{
          background: tokens.color.brand.primaryBackground,
          minHeight: "100vh",
          minWidth: "100%",
          padding: 20,
        }}
      >
        <h1>
          Welcome, {user?.firstName}!
        </h1>
        <p>Here's your financial overview for today</p>
        <div
          style={{
            display: "flex",
            gap: "40px",
            maxWidth: "1460px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              maxWidth: "1014px",
            }}
          >
            <Stack spacing={2}>
              <WalletBalance refreshKey={walletRefreshKey} />
              <WalletCashFlow />
              <TransactionHistory />
            </Stack>
          </div>
          <div
            style={{
              width: "338px",
              flexShrink: 0,
              flexGrow: 0,
              overflow: "visible",
            }}
          >
            <Stack spacing={2.25}>
              <QuickActions onLoadWallet={() => setLoadWalletOpen(true)} />
              <ImportantMessages />
            </Stack>
          </div>
        </div>
      </div>

      <LoadWalletDialog
        open={loadWalletOpen}
        onClose={() => setLoadWalletOpen(false)}
        onSuccess={() => setWalletRefreshKey((k) => k + 1)}
      />
    </>
  );
};
