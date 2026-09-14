import {Link as RouterLink} from "react-router-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import {tokens} from "@/style/Theme.jsx";

export const USER_RAIL_ITEMS = [
  {label: "Dashboard", path: "/", icon: <DashboardRoundedIcon sx={{fontSize: 16}} />},
  {label: "Wallet", path: "/wallet", icon: <AccountBalanceWalletOutlinedIcon sx={{fontSize: 16}} />},
  {label: "Transfer", path: "/transfers", icon: <SwapHorizRoundedIcon sx={{fontSize: 16}} />},
  {label: "Payment Method", path: "/payment-methods", icon: <CreditCardRoundedIcon sx={{fontSize: 16}} />},
];

export function isRailPathActive(currentPath, targetPath) {
  if (targetPath === "/") {
    return currentPath === "/" || currentPath === "/home";
  }
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function initialsFromUser(user) {
  const first = user?.firstName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  const value = `${first}${last}`.trim();
  return value ? value.toUpperCase() : "U";
}

export function UserNavRail({collapsed, onToggle, pathname, user}) {
  const width = collapsed
    ? tokens.layout.navRailCollapsed
    : tokens.layout.navRailExpanded;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const initials = initialsFromUser(user);

  return (
    <>
    <Box
      aria-hidden
      sx={{
        width,
        flexShrink: 0,
        transition: tokens.layout.navRailTransition,
      }}
    />
    <Box
      component="nav"
      aria-label="Primary"
      data-testid="nav-rail"
      data-collapsed={collapsed ? "true" : "false"}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200,
        width,
        height: "100vh",
        overflowY: "auto",
        bgcolor: tokens.color.nav.railBackground,
        px: 2,
        py: 3,
        display: "flex",
        flexDirection: "column",
        transition: tokens.layout.navRailTransition,
        boxSizing: "border-box",
      }}
    >
      <ButtonBase
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        data-testid="nav-toggle"
        sx={{
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.25,
          mb: 3.5,
          px: 0.75,
          py: 0.75,
          borderRadius: "11px",
          color: tokens.color.text.white,
          "&:focus-visible": {
            outline: `3px solid ${tokens.color.nav.railMint}`,
            outlineOffset: "3px",
          },
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: "rgba(255,255,255,0.14)",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {collapsed ? "«" : "S"}
        </Box>
        {!collapsed && (
          <Typography sx={{fontWeight: 800, fontSize: 15, color: tokens.color.text.white}}>
            SmartPay
          </Typography>
        )}
      </ButtonBase>

      <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
        {USER_RAIL_ITEMS.map(item => {
          const active = isRailPathActive(pathname, item.path);
          const button = (
            <ButtonBase
              component={RouterLink}
              to={item.path}
              aria-current={active ? "page" : undefined}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              title={collapsed ? undefined : item.label}
              sx={{
                width: "100%",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 1.5,
                px: 1.5,
                py: 1.35,
                borderRadius: "11px",
                color: active ? tokens.color.text.white : tokens.color.nav.railText,
                bgcolor: active ? tokens.color.nav.railActive : "transparent",
                fontWeight: active ? 700 : 600,
                fontSize: 14,
                "&:hover": {
                  bgcolor: active ? tokens.color.nav.railActive : tokens.color.nav.railHover,
                  color: tokens.color.text.white,
                },
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "6px",
                  bgcolor: active ? tokens.color.nav.railMint : "rgba(255,255,255,0.22)",
                  color: active ? tokens.color.nav.railBackground : tokens.color.text.white,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              {!collapsed && <Box component="span">{item.label}</Box>}
            </ButtonBase>
          );

          return (
            <Box key={item.path} sx={{width: "100%"}}>
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </Box>
          );
        })}
      </Box>

      <Box
        data-testid="nav-profile"
        sx={{
          mt: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.25,
          px: 1.5,
          py: 1.35,
          borderRadius: "11px",
          bgcolor: "rgba(255,255,255,0.06)",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: tokens.color.nav.railMint,
            color: tokens.color.nav.railBackground,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{minWidth: 0}} data-testid="nav-profile-details">
            <Typography noWrap sx={{fontSize: 12.5, fontWeight: 700, color: tokens.color.text.white}}>
              {displayName}
            </Typography>
            <Typography sx={{fontSize: 11, color: "rgba(255,255,255,0.6)"}}>
              Personal
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
}
