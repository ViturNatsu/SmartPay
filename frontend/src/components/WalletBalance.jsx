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
                p: 3,
                height: "auto",
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    flexWrap: "wrap",
                    gap: 1,
                }}
            >
                <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
                    Wallet Balance
                </Typography>
                <Typography 
                    variant="h5"
                    sx={{
                        wordBreak: "break-all",
                        textAlign: "right",
                        flex: "1 1 auto",
                        minWidth: 0,
                    }}>
                    ${Number(balance).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        },
                    )}
                </Typography>
            </Stack>

        </Card>
    );
}

export default WalletBalance;