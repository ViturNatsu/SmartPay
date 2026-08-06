import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase, Box } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { tokens, dashboardSidebarCardSx } from "../style/Theme";

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
      sx={{
        ...dashboardSidebarCardSx,
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
              border: `1px solid ${tokens.color.border.light}`,
              bgcolor: tokens.color.background.card,
              textAlign: "left",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: tokens.color.background.quickAction,
                  color: tokens.color.icon.quickAction,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 650, color: tokens.color.text.primary }}>
                {text}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ fontSize: 18, color: tokens.color.text.muted }} />
          </ButtonBase>
        ))}
      </Stack>
    </Card>
  );
}

export default QuickActions;
