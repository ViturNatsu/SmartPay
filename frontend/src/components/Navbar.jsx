import * as React from "react";
import {Link as RouterLink, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { tokens } from "@/style/Theme";
import { getNotifications } from "@/api/notifications/notificationApi";
import {
  IMPORTANT_MESSAGES_PANEL_ID,
  NOTIFICATIONS_COUNT_CHANGED_EVENT,
} from "@/components/ImportantMessages";

import logo from "@/style/logo.png";
import {Card} from "@mui/material";
import {MobileNavbar} from "@/components/customComponents/navbars/MobileNavbar.jsx";
import {DesktopNavbar} from "@/components/customComponents/navbars/DesktopNavbar.jsx";

// Update these to match your real routes
const userNavItems = [
  {label: "Dashboard", path: "/", icon: <HomeRoundedIcon />},
  {
    label: "Payment Methods",
    path: "/payment-methods",
    icon: <AccountBalanceWalletOutlinedIcon />,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: <SwapHorizRoundedIcon />,
  },
  {label: "Wallet", path: "/wallet", icon: <CreditCardRoundedIcon />},
];

const adminNavItems = [
  {label: "Dashboard", path: "/admin/dashboard", icon: <HomeRoundedIcon />},
  {
    label: "Mock Accounts",
    path: "/admin/mock-accounts",
    icon: <AccountBalanceIcon />,
  },
  {
      label: "Requests",
      path: "/admin/requestManagement",
      icon: <CreditCardRoundedIcon />,
  },
  {label: "Users", path: "/admin/users", icon: <GroupIcon />},
];

const userSideMenuItems  = [
  {
    label: "Recurring Payments",
    path: "/recurring-payments",
    icon: <SwapHorizRoundedIcon />,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <InsightsRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsRoundedIcon />,
  },
];

const adminSideMenuItems = [
  {
    label: "Reports",
    path: "/admin/reports",
    icon: <InsightsRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <SettingsRoundedIcon />,
  },
];

function isPathActive(currentPath, targetPath) {
  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath || currentPath.startsWith(targetPath + "/");
}

export default function Navbar({isAdmin = false}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs/sm => mobile
  const location = useLocation();
  const navigate = useNavigate();
  const {logout, tokenClaims, loading: authLoading} = useAuth();
  const [totalNotificationCount, setTotalNotificationCount] = React.useState(0);

  React.useEffect(() => {
    if (authLoading || !tokenClaims?.userId) return;

    let cancelled = false;
    getNotifications()
      .then(data => {
        if (!cancelled) setTotalNotificationCount(data.totalCount ?? 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenClaims?.userId]);

  // Kept in sync with dismiss actions that happen inside ImportantMessages,
  // which is a sibling component with its own independent fetch/state.
  React.useEffect(() => {
    const handleCountChanged = (event) => {
      setTotalNotificationCount(event.detail?.totalCount ?? 0);
    };
    window.addEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, handleCountChanged);
    return () => {
      window.removeEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, handleCountChanged);
    };
  }, []);

  const items = isAdmin ? adminNavItems : userNavItems;
  const homePath = isAdmin ? "/admin/dashboard" : "/";

  const handleBellClick = () => {
    const isOnDashboard = location.pathname === "/" || location.pathname === "/home";
    if (isOnDashboard) {
      document
        .getElementById(IMPORTANT_MESSAGES_PANEL_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Navigation is async, so the panel isn't in the DOM yet at this
      // point — hand off a flag via router state and let Home scroll once
      // it's actually mounted, rather than guessing with a timeout.
      navigate(homePath, { state: { scrollToNotifications: true } });
    }
  };

  const sideMenuItems = isAdmin
  ? adminSideMenuItems
  : userSideMenuItems;

  const activeIndex = React.useMemo(() => {
    const idx = items.findIndex(i => isPathActive(location.pathname, i.path));
    return idx === -1 ? 0 : idx;
  }, [location.pathname, items]);

  // -------------------------
  // MOBILE: Top mini bar + Bottom nav
  // -------------------------
  if (isMobile) {
    return (
      <MobileNavbar
        homePath={homePath}
        items={items}
        onNotificationClick={handleBellClick}
        activeIndex={activeIndex}
        notificationCount={totalNotificationCount}
      />
    );
  }

  // -------------------------
  // DESKTOP/TABLET: Top app bar with NO overlap
  // - center nav scrolls horizontally if tight
  // -------------------------
  return (
    <DesktopNavbar
      homePath={homePath}
      items={items}
      isPathActive={isPathActive}
      handleBellClick={handleBellClick}
      totalNotificationCount={totalNotificationCount}
      logout={logout}
      sideMenuItems={sideMenuItems}
    />
  );
}
