import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

import { tokens } from "@/style/Theme.jsx";
function TransactionHistory() {
  const history = [
    {
      info: "Amazon Purchase",
      date: "Jan 12, 2026 • 2:45 PM",
      amount: -127.89,
      process: "Completed",
    },
    {
      info: "Salary Deposit",
      date: "Jan 10, 2026 • 9:00 AM",
      amount: 4250.00,
      process: "Completed",
    },
    {
      info: "Electricity Bill",
      date: "Jan 08, 2026 • 4:30 AM",
      amount: -89.20,
      process: "Completed",
    },
  ];
  return (
    <Card elevation={0} sx={{ width: "100%", bgcolor: tokens.color.background.surface, borderRadius: "16px", border: `1px solid ${tokens.color.border.gray}`, p: 3, boxSizing: 'border-box', overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb="20px" sx={{ borderBottom: `1px solid ${tokens.color.underline.dark}`, pb: 2 }}>
        <Typography variant="h6">
          Transaction History
        </Typography>
        <RouterLink to="/view-history" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography sx={{ cursor: 'pointer', color: tokens.color.link.primary, fontWeight: 500 }}>
              View All
            </Typography>
            <EastOutlinedIcon sx={{ color: tokens.color.link.primary, fontSize: 'inherit' }} />
          </Stack>
        </RouterLink>
      </Stack>
      <Stack spacing={1.0}>
        {/* gap:12px */}
        {history.map((transaction) => (
            <Stack 
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2}}
            >
                {/* LEFT SIDE */}
                <Stack>
                  <Typography sx={{ fontWeight: 500 }}>{transaction.info}</Typography>
                  <Typography sx={{ color: tokens.color.text.number.neutral}}>{transaction.date}</Typography>
                </Stack>

                {/* RIGHT SIDE */}
                <Stack>
                  <Typography
                    sx={{
                      color: transaction.amount < 0 ? tokens.color.text.number.negative : tokens.color.text.number.positive,
                      fontWeight: 600,
                    }}
                  >
                    {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  <Typography sx={{ color: tokens.color.text.number.neutral}}>{transaction.process}</Typography>
                </Stack>
            </Stack>
            
        ))}
      </Stack>
    </Card>
  );
}

export default TransactionHistory;
