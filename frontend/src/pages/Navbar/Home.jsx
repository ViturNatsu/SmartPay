import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {Alert, Box, Button, Card, CardContent, Container, LinearProgress, Stack, Typography} from "@mui/material";
import QuickActions from "@/components/QuickActions";
import ImportantMessages, {
  IMPORTANT_MESSAGES_PANEL_ID,
} from "@/components/ImportantMessages";
import LinkedAccountsPanel from "@/components/LinkedAccountsPanel";
import TransactionsActivityFeed from "@/components/TransactionsActivityFeed";
import LoadWalletDialog from "@/components/LoadWalletDialog";
import { useAuth } from "@/context/AuthContext";
import WalletBalance from "@/components/WalletBalance";

import { tokens } from "@/style/Theme.jsx";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
import {RecurringPaymentsCardLayout} from "@/components/card/RecurringPaymentsCardLayout.jsx";
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

    // Wallet balance, transactions feed, and this panel each
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
      <BasicPageLayout
        title={`Welcome, ${user?.firstName}!`}
        subtitle={"Here's your financial overview for today"}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 3, lg: 5 },
            maxWidth: 1460,
            alignItems: { xs: "stretch", lg: "flex-start" },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: "100%", lg: "auto" },
              maxWidth: { lg: 1014 },
            }}
          >
            <Stack spacing={2}>
              <WalletBalance refreshKey={walletRefreshKey} />
              <TransactionsActivityFeed refreshKey={walletRefreshKey} />
              <RecurringPaymentsCardLayout></RecurringPaymentsCardLayout>
            </Stack>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", lg: 338 },
              flexShrink: 0,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Stack
              spacing={2.25}
              sx={{
                width: "100%",
                minWidth: 0,
                alignItems: "stretch",
                "& > *": {
                  width: "100%",
                  minWidth: 0,
                  alignSelf: "stretch",
                },
              }}
            >
              <QuickActions onLoadWallet={() => setLoadWalletOpen(true)} />
              <LinkedAccountsPanel />
              <ImportantMessages />

            </Stack>

          </Box>
        </Box>
      </BasicPageLayout>

      <LoadWalletDialog
        open={loadWalletOpen}
        onClose={() => setLoadWalletOpen(false)}
        onSuccess={() => setWalletRefreshKey((k) => k + 1)}
      />
    </>
  );
};
