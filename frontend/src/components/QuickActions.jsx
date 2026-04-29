import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Avatar } from "@mui/material";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

function QuickActions() {
  const actions = [
    {
      text: "Add Payment Method",
      icon: <AccountBalanceOutlinedIcon />,
      color: "#F3E8FF",
      iconColor: "#000000ff",
      href: "/payment-methods",
    },
    {
      text: "Send Money",
      icon: <AttachMoneyOutlinedIcon />,
      color: "#CFFAFE",
      iconColor: "#000000ff",
      href: "/make-a-payment",
    },
    {
      text: "View History",
      icon: <TrendingUpIcon />,
      color: "#CFFAFE",
      iconColor: "#0891B2",
      href: "/view-history",
    },
    {
      text: "Add Payee",
      icon: <PersonAddAlt1OutlinedIcon />,
      color: "#DBEAFE",
      iconColor: "#000000ff",
      href: "/add-payee",
    },
  
  ];
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        mb="20px"
        sx={{ borderBottom: "1px solid #000000" }}
      >
        Quick Actions
      </Typography>
      <Stack spacing={1.0}>
        {/* gap:12px */}
        {actions.map((action) => (
          <ButtonBase
            LinkComponent={RouterLink}
            to={action.href}
            key={action.text}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              p: 2.5,
              borderRadius: "16px",
              border: "2px solid #E5E7EB",
            }}
          >
            <Avatar
              sx={{
                bgcolor: action.color,
                color: action.iconColor,
                width: 44,
                height: 44,
                mr: 1.5,
              }}
            >
              {action.icon}
            </Avatar>
            <Typography>{action.text}</Typography>
          </ButtonBase>
        ))}
      </Stack>
    </Card>
  );
}

export default QuickActions;
