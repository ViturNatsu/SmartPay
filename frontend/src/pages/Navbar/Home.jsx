import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Box, Stack, Typography } from "@mui/material";
import QuickActions from "@/components/QuickActions";
import ImportantMessages from "@/components/ImportantMessages";
import LinkedAccountsPanel from "@/components/LinkedAccountsPanel";
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
      <Box
        sx={{
          background: tokens.color.brand.primaryBackground,
          minHeight: "100vh",
          width: "100%",
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
          Welcome, {user?.firstName}!
        </Typography>
        <Typography sx={{ mb: 3, color: tokens.color.text.secondary }}>
          Here&apos;s your financial overview for today
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 3, lg: 5 },
            maxWidth: 1460,
            mx: "auto",
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
              <WalletCashFlow />
              <TransactionHistory />
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
      </Box>

      <LoadWalletDialog
        open={loadWalletOpen}
        onClose={() => setLoadWalletOpen(false)}
        onSuccess={() => setWalletRefreshKey((k) => k + 1)}
      />
    </>
  );
};
