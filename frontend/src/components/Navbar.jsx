import * as React from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import logo from "@/style/logo.png";

// Update these to match your real routes
const navItems = [
  { label: "Dashboard", path: "/", icon: <HomeRoundedIcon /> },
  { label: "Accounts", path: "/accounts", icon: <AccountBalanceWalletOutlinedIcon /> },
  { label: "Transactions", path: "/transactions", icon: <SwapHorizRoundedIcon /> },
  { label: "My Cards", path: "/cards", icon: <CreditCardRoundedIcon /> },
  { label: "Reports", path: "/reports", icon: <InsightsRoundedIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon /> },
];

function isPathActive(currentPath, targetPath) {
  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath || currentPath.startsWith(targetPath + "/");
}

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs/sm => mobile
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const activeIndex = React.useMemo(() => {
    const idx = navItems.findIndex((i) => isPathActive(location.pathname, i.path));
    return idx === -1 ? 0 : idx;
  }, [location.pathname]);

  // -------------------------
  // MOBILE: Top mini bar + Bottom nav
  // -------------------------
  if (isMobile) {
    return (
      <>
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: "#fff",
            color: "#111",
            boxShadow: "none",
            borderBottom: "1px solid #eaeaea",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{ minHeight: 64, px: 2, display: "flex", alignItems: "center" }}
            >
              <Box
                component={RouterLink}
                aria-label="home"
                to="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box component="img" src={logo} alt="SmartPay Logo" sx={{ height: 34, width: "auto" }} />
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>SmartPay</Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              <IconButton aria-label="notifications" sx={{ color: "rgba(0,0,0,0.65)" }}>
                <NotificationsNoneRoundedIcon />
              </IconButton>

              <Avatar alt="Alex N" sx={{ width: 34, height: 34, ml: 1 }} />
            </Toolbar>
          </Container>
        </AppBar>

        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: "1px solid #eaeaea",
            backgroundColor: "#fff",
            zIndex: theme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            value={activeIndex}
            onChange={(_, newValue) => navigate(navItems[newValue].path)}
            showLabels
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              />
            ))}
          </BottomNavigation>
        </Box>
      </>
    );
  }

  // -------------------------
  // DESKTOP/TABLET: Top app bar with NO overlap
  // - center nav scrolls horizontally if tight
  // -------------------------
  return (
    <AppBar
      position="sticky"
      color="default"
      sx={{
        backgroundColor: "#fff",
        color: "#111",
        boxShadow: "none",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 0 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            aria-label="home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
              pr: 1,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="SmartPay Logo"
              sx={{ height: 42, width: "auto" }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{ fontWeight: 700, letterSpacing: "0.02em" }}
            >
              SmartPay
            </Typography>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                overflowX: "auto",
                whiteSpace: "nowrap",
                px: 1,
                maxWidth: "100%",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {navItems.map((item) => {
                const active = isPathActive(location.pathname, item.path);
                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    aria-current={active ? "page" : undefined}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    sx={{
                      flexShrink: 0,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      backgroundColor: active ? "rgba(25, 118, 210, 0.10)" : "transparent",
                      color: active ? "#1976d2" : "rgba(0,0,0,0.65)",
                      "&:hover": {
                        backgroundColor: active
                          ? "rgba(25, 118, 210, 0.14)"
                          : "rgba(0,0,0,0.06)",
                      },
                      "& .MuiButton-startIcon": { color: "inherit" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* RIGHT: bell + divider + profile + logout. */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <IconButton aria-label="notifications" sx={{ color: "rgba(0,0,0,0.65)" }}>
              <NotificationsNoneRoundedIcon />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {/* Paceholder for user's name and premium member status.
              TODO: Grab user's name and status from the backend display it here. */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            </Box>

            <IconButton
              aria-label="logout"
              onClick={logout}
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(244, 67, 54, 0.08)",
                color: "#f44336",
                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.12)" },
              }}
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
