import { useEffect, useState } from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { getWalletByUserId } from "@/api/wallets/walletApi";

import { tokens } from "@/style/Theme.jsx";
function WalletBalance({ refreshKey = 0 }) {
  const { tokenClaims, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!tokenClaims?.userId) return;

      try {
        const wallet = await getWalletByUserId(Number(tokenClaims.userId));
        setBalance(wallet.balance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    if (!authLoading) {
      fetchWalletBalance();
    }
  }, [authLoading, tokenClaims?.userId, refreshKey]);

  const formatted = Number(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        minHeight: "154px",
        p: "26px",
        boxSizing: "border-box",
        borderRadius: "16px",
        border: "none",
        background: tokens.color.gradient.walletBalance,
        color: tokens.color.text.white,
      }}
    >
      <Stack
        spacing={1}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Typography
          component="h2"
          sx={{
            color: tokens.color.text.white,
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.4,
          }}
        >
          Wallet Balance
        </Typography>
        <Typography
          sx={{
            color: tokens.color.text.white,
            fontSize: "44px",
            lineHeight: 1.15,
            fontWeight: 600,
            textAlign: "left",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          ${formatted}
        </Typography>
        <Typography
          sx={{
            color: tokens.color.text.white,
            fontSize: "0.875rem",
            lineHeight: 1.43,
            opacity: 0.95,
            textAlign: "left",
          }}
        >
          Available balance for transfers and payments
        </Typography>
      </Stack>
    </Card>
  );
}

export default WalletBalance;
