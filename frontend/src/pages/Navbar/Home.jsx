import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Box, Stack } from "@mui/material";
import QuickActions from "@/components/QuickActions";
import ImportantMessages from "@/components/ImportantMessages";
import WalletCashFlow from "@/components/WalletCashFlow";
import TransactionHistory from "@/components/TransactionHistory";
import LoadWalletDialog from "@/components/LoadWalletDialog";
import { useAuth } from "@/context/AuthContext";
import WalletBalance from "@/components/WalletBalance";

import { tokens } from "@/style/Theme.jsx";
export const Home = () => {
  const { user } = useAuth();
  const [loadWalletOpen, setLoadWalletOpen] = useState(false);
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);

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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 5 }}
          sx={{ maxWidth: "1460px", margin: "0 auto" }}
        >
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: { md: "1014px" } }}>
            <Stack spacing={2}>
              <WalletBalance refreshKey={walletRefreshKey} />
              <WalletCashFlow />
              <TransactionHistory />
            </Stack>
          </Box>
          <Box sx={{ width: { xs: "100%", md: "338px" }, flexShrink: 0 }}>
            <Stack spacing={2.25}>
              <QuickActions onLoadWallet={() => setLoadWalletOpen(true)} />
              <ImportantMessages />
            </Stack>
          </Box>
        </Stack>
      </div>

      <LoadWalletDialog
        open={loadWalletOpen}
        onClose={() => setLoadWalletOpen(false)}
        onSuccess={() => setWalletRefreshKey((k) => k + 1)}
      />
    </>
  );
};
