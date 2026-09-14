import * as React from "react";
import {useNavigate} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {tokens} from "@/style/Theme.jsx";

const MENU_ITEMS = [
  {id: "transaction-history", label: "Transaction History", icon: <HistoryRoundedIcon fontSize="small" />},
  {id: "support", label: "Support", icon: <HelpOutlineRoundedIcon fontSize="small" />},
  {id: "notification", label: "Notification", icon: <NotificationsNoneRoundedIcon fontSize="small" />},
  {id: "logout", label: "Logout", icon: <LogoutRoundedIcon fontSize="small" />, danger: true},
];

function initialsFromUser(user) {
  const first = user?.firstName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  const value = `${first}${last}`.trim();
  return value ? value.toUpperCase() : "U";
}

export function UserDesktopTopBar({unreadCount = 0, user, logout, onOpenNotifications}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const hamburgerRef = React.useRef(null);
  const open = Boolean(anchorEl);

  const closeMenu = () => setAnchorEl(null);

  // Close on outside pointer-down without a blocking overlay, so a click on
  // the rail toggle both closes the menu and collapses/expands in one gesture.
  React.useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (hamburgerRef.current?.contains(target)) return;
      if (target.closest("#hamburger-menu") || target.closest(".MuiMenu-paper")) return;
      closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  const handleItemClick = async (id) => {
    closeMenu();
    if (id === "transaction-history") {
      navigate("/transactions");
      return;
    }
    if (id === "support") {
      navigate("/support");
      return;
    }
    if (id === "notification") {
      await onOpenNotifications?.();
      return;
    }
    if (id === "logout") {
      await logout?.();
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: tokens.color.nav.background,
        color: tokens.color.text.primary,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxShadow: "0 2px 1px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 72,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.75,
        }}
      >
        <Box>
          <IconButton
            ref={hamburgerRef}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={open ? "hamburger-menu" : undefined}
            data-testid="nav-hamburger"
            onClick={(event) => setAnchorEl(open ? null : event.currentTarget)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              border: `1px solid ${tokens.color.nav.border}`,
              bgcolor: "#f1f6f4",
              position: "relative",
              color: tokens.color.nav.railBackground,
            }}
          >
            <MenuRoundedIcon fontSize="small" />
            {unreadCount > 0 && (
              <Box
                aria-hidden
                data-testid="hamburger-unread-dot"
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: tokens.color.status.error,
                  border: "1.5px solid #f1f6f4",
                }}
              />
            )}
          </IconButton>
          <Menu
            id="hamburger-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={(_event, reason) => {
              if (reason === "escapeKeyDown") closeMenu();
            }}
            disableScrollLock
            slotProps={{
              root: {
                sx: {pointerEvents: "none"},
              },
              paper: {
                sx: {
                  pointerEvents: "auto",
                  width: 216,
                  mt: 1.25,
                  borderRadius: "14px",
                  border: `1px solid ${tokens.color.nav.border}`,
                  boxShadow: "0 16px 34px rgba(16,32,29,0.16)",
                  p: 1,
                },
              },
              list: {
                "aria-label": "Account menu",
              },
            }}
            anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            transformOrigin={{vertical: "top", horizontal: "right"}}
          >
            {MENU_ITEMS.flatMap((item) => {
              const menuItem = (
                <MenuItem
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  data-testid={`nav-${item.id}`}
                  sx={{
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: item.danger ? tokens.color.status.error : tokens.color.text.primary,
                  }}
                >
                  <ListItemIcon sx={{color: "inherit", minWidth: 36}}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.id === "notification" && unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      data-testid="notification-unread-badge"
                      sx={{"& .MuiBadge-badge": {position: "relative", transform: "none"}}}
                    />
                  )}
                </MenuItem>
              );

              if (item.id === "logout") {
                return [
                  <Divider key="logout-divider" sx={{my: 0.75}} />,
                  menuItem,
                ];
              }
              return [menuItem];
            })}
          </Menu>
        </Box>

        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: tokens.color.nav.railBackground,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {initialsFromUser(user)}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}
