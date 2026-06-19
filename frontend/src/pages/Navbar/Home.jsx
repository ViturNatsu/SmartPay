import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Stack } from "@mui/material";
import QuickActions from "@/components/QuickActions";
import ImportantMessages from "@/components/ImportantMessages";
import WalletCashFlow from "@/components/WalletCashFlow";
import TransactionHistory from "@/components/TransactionHistory";
import LoadWalletDialog from "@/components/LoadWalletDialog";
import { useAuth } from "@/context/AuthContext";
import WalletBalance from "@/components/WalletBalance";

export const Home = () => {
  const { user } = useAuth();
  const [loadWalletOpen, setLoadWalletOpen] = useState(false);
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);

  return (
    <>
      <Navbar />
      <div
        style={{
          background: "#F8FAFC",
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
