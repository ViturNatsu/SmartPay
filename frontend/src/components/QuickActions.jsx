import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Box } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

const ACTIONS = [
  {
    text: "Add a Payee",
    icon: PersonAddAlt1OutlinedIcon,
    href: "/add-payee",
  },
  {
    text: "Manage Payees",
    icon: PeopleAltOutlinedIcon,
    href: "/payees",
  },
  {
    text: "Send Money",
    icon: NorthEastIcon,
    href: "/make-a-payment",
  },
  {
    text: "Load Wallet",
    icon: AccountBalanceWalletOutlinedIcon,
    action: "loadWallet",
  },
];

function QuickActions({ onLoadWallet }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderRadius: "18px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
        p: "22px",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          mb: 0.5,
        }}
      >
        Quick Actions
      </Typography>
      <Stack spacing={1.25} sx={{ mt: 1.5 }}>
        {ACTIONS.map(({ text, icon: Icon, href, action }) => (
          <ButtonBase
            key={text}
            component={action === "loadWallet" ? "button" : RouterLink}
            to={action === "loadWallet" ? undefined : href}
            onClick={action === "loadWallet" ? onLoadWallet : undefined}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "15px",
              borderRadius: "14px",
              border: "1px solid #E5E7EB",
              bgcolor: "#fff",
              textAlign: "left",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: "#F2EFFF",
                  color: "#5B35D5",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 650, color: "#111827" }}>
                {text}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
          </ButtonBase>
        ))}
      </Stack>
    </Card>
  );
}

export default QuickActions;
