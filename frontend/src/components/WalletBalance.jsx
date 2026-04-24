import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { getWalletByUserId } from "@/api/wallets/walletApi";

function WalletBalance () {
    const {tokenClaims, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState(0.0);

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
    }, [authLoading, tokenClaims?.userId]);

    return (
        <Card
            elevation={0} 
            sx={{ width: "100%", 
                bgcolor: "#fff", 
                borderRadius: "16px", 
                border: "1px solid #E5E7EB", 
                p: 3 }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb="20px"
                sx={{ borderBottom: "1px solid #000000", pb: 2 }}
            >
                <Typography variant="h6">
                    Wallet Balance
                </Typography>
                <Typography variant="h6">
                    ${balance.toFixed(2)}
                </Typography>
            </Stack>

        </Card>
    );
}

export default WalletBalance;