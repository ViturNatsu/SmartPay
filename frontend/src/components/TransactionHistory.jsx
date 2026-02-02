import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

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
    <Card elevation={0} sx={{ width: "100%", bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, boxSizing: 'border-box', overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb="20px" sx={{ borderBottom: "1px solid #000000", pb: 2 }}>
        <Typography variant="h6">
          Transaction History
        </Typography>
        <RouterLink to="/view-history" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography sx={{ cursor: 'pointer', color: '#2563EB', fontWeight: 500 }}>
              View All
            </Typography>
            <EastOutlinedIcon sx={{ color: "#2563EB", fontSize: 'inherit' }} />
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
                  <Typography sx={{ color: "#6B7280"}}>{transaction.date}</Typography>
                </Stack>

                {/* RIGHT SIDE */}
                <Stack>
                  <Typography
                    sx={{
                      color: transaction.amount < 0 ? '#DC2626' : '#16A34A',
                      fontWeight: 600,
                    }}
                  >
                    {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  <Typography sx={{ color: "#6B7280"}}>{transaction.process}</Typography>
                </Stack>
            </Stack>
            
        ))}
      </Stack>
    </Card>
  );
}

export default TransactionHistory;
