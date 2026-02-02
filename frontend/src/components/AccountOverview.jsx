import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";

function AccountOverview() {
  const accounts = [
    {
        type: "Checking Account",
        number: "****4521",
        balance: 8542.30,
        other: 2.4,
    },
    {
        type: "Savings Account",
        number: "****7839",
        balance: 24180.75,
        other: 5.1,
    },
    {
        type: "Credit Card",
        number: "****2947",
        balance: 1247.50,
        other: "Due: Jan 28",
    },
  ];
  return (
    <Card elevation={0} sx={{ width: "100%", bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, boxSizing: 'border-box', overflow: 'hidden' }}>
      <Typography variant="h6" mb="20px" sx={{ borderBottom: "1px solid #000000" }}>
        Account Overview
      </Typography>
      <Stack spacing={1.0}>
        {/* gap:12px */}
        {accounts.map((account) => (
            <Stack 
                key={account.number} // key goes on the root element in a map
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ bgcolor: "#F9FAFB", borderRadius: "12px", p: 2}}
            >
                {/* LEFT SIDE */}
                <Stack>
                    <Typography key={account.type} sx={{ color: "#4B5563" }}>{account.type}</Typography>
                    <Typography sx={{ color: "#6B7280"}}>{account.number}</Typography>
                </Stack>

                {/* RIGHT SIDE */}
                <Stack alignItems="flex-end">
                    <Typography sx={{ fontWeight: 500, fontSize: 'h6.fontSize' }}>
                        ${Number(account.balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </Typography>
                    <Typography 
                        sx={{
                            color: account.type !== 'Credit Card'
                                ? account.other > 0
                                    ? '#16A34A'
                                    : '#DC2626'
                                : '#6B7280',
                            fontWeight: 'light',
                        }}
                    >
                        {account.other}
                        {account.type !== "Credit Card" ? '%' : ''}
                    </Typography>
                </Stack>
            </Stack>  
        ))}
      </Stack>
    </Card>
  );
}

export default AccountOverview;
