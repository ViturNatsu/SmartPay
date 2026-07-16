import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { getUserAccounts } from "@/api/accounts/accountApi";
import {tokens} from "../style/Theme"

function AccountOverview() {
    const { tokenClaims, loading: authLoading } = useAuth();
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!tokenClaims?.userId) return;

            try {
                const data = await getUserAccounts(Number(tokenClaims.userId));
                const rawAccounts = Array.isArray(data)
                    ? data
                    : data?.accounts || [];

                const formatted = rawAccounts.map((acct) => ({
                    type:
                        (acct.type || acct.accountType || "").toLowerCase() ===
                        "checking"
                            ? "Checking Account"
                            : "Savings Account",
                    number: `****${String(acct.accountNumber ?? acct.id ?? "0000").slice(-4)}`,
                    balance: Number(acct.balance) || 0,
                    other: 0, // placeholder since API doesn't provide this
                }));

                setAccounts(formatted);
            } catch (err) {
                console.error("Failed to load accounts:", err);
            }
        };

        if (!authLoading) {
            fetchAccounts();
        }
    }, [authLoading, tokenClaims?.userId]);

    return (
        <Card
            elevation={0}
            sx={{
                width: "100%",
                bgcolor: tokens.color.background.surface,
                borderRadius: "16px",
                border: "1px solid ",
                borderColor: tokens.color.border.light,
                p: 3,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <Typography
                variant="h6"
                mb="20px"
                sx={{
                        borderBottom: "1px solid",
                        borderBottomColor: tokens.color.underline.dark
                    }}
            >
                Account Overview
            </Typography>
            <Stack spacing={1.0}>
                {accounts.map((account) => (
                    <Stack
                        key={account.id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            bgcolor: tokens.color.background.stack,
                            borderRadius: "12px", p: 2 }}
                    >
                        <Stack>
                            <Typography sx={{color: tokens.color.text.secondary}}>
                                {account.type}
                            </Typography>
                            <Typography sx={{ color: tokens.color.text.secondary}}>
                                {account.number}
                            </Typography>
                        </Stack>

                        <Stack alignItems="flex-end">
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: "h6.fontSize",
                                }}
                            >
                                $
                                {Number(account.balance).toLocaleString(
                                    undefined,
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    },
                                )}
                            </Typography>
                            <Typography
                                sx={{
                                    color:
                                        account.type !== "Credit Card"
                                            ? account.other > 0
                                                ? tokens.color.text.number.positive
                                                : tokens.color.text.number.negative
                                            : tokens.color.text.number.neutral,
                                    fontWeight: "light",
                                }}
                            >
                                {account.other}
                                {account.type !== "Credit Card" ? "%" : ""}
                            </Typography>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}

export default AccountOverview;
