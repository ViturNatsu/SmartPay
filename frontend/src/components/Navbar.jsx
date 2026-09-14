import * as React from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";

import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { tokens } from "@/style/Theme";
import { getNotifications, markNotificationAsRead } from "@/api/notifications/notificationApi";
import {
  IMPORTANT_MESSAGES_PANEL_ID,
  NOTIFICATIONS_COUNT_CHANGED_EVENT,
} from "@/components/ImportantMessages";

import {MobileNavbar} from "@/components/customComponents/navbars/MobileNavbar.jsx";
import {DesktopNavbar} from "@/components/customComponents/navbars/DesktopNavbar.jsx";
import {UserNavRail} from "@/components/customComponents/navbars/UserNavRail.jsx";
import {UserDesktopTopBar} from "@/components/customComponents/navbars/UserDesktopTopBar.jsx";

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
  {
    label: "Transfers",
    path: "/transfers",
    icon: <SwapHorizRoundedIcon />,
  },
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

function isDashboardPath(pathname) {
  return pathname === "/" || pathname === "/home";
}

export default function Navbar({isAdmin = false}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const {logout, tokenClaims, loading: authLoading, user} = useAuth();
  const [totalNotificationCount, setTotalNotificationCount] = React.useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = React.useState(0);
  const [railCollapsed, setRailCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (authLoading || !tokenClaims?.userId) return;

    let cancelled = false;
    getNotifications()
      .then(data => {
        if (!cancelled) {
          setTotalNotificationCount(data.totalCount ?? 0);
          setUnreadNotificationCount(data.unreadCount ?? 0);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenClaims?.userId]);

  React.useEffect(() => {
    const handleCountChanged = (event) => {
      if (typeof event.detail?.totalCount === "number") {
        setTotalNotificationCount(event.detail.totalCount);
      }
      if (typeof event.detail?.unreadCount === "number") {
        setUnreadNotificationCount(event.detail.unreadCount);
      }
    };
    window.addEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, handleCountChanged);
    return () => {
      window.removeEventListener(NOTIFICATIONS_COUNT_CHANGED_EVENT, handleCountChanged);
    };
  }, []);

  const items = isAdmin ? adminNavItems : userNavItems;
  const homePath = isAdmin ? "/admin/dashboard" : "/";

  const scrollToNotifications = () => {
    document
      .getElementById(IMPORTANT_MESSAGES_PANEL_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBellClick = () => {
    if (isDashboardPath(location.pathname)) {
      scrollToNotifications();
    } else {
      navigate(homePath, { state: { scrollToNotifications: true } });
    }
  };

  const handleOpenNotifications = async () => {
    try {
      const data = await getNotifications();
      const unread = (data.notifications ?? []).filter(notification => notification.read === false);
      await Promise.all(unread.map(notification =>
        markNotificationAsRead(notification.id).catch(() => {})
      ));
    } catch (_) {
      // Viewing still proceeds even if mark-as-read fails.
    }
    setUnreadNotificationCount(0);
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_COUNT_CHANGED_EVENT, {
        detail: { unreadCount: 0 },
      }),
    );

    if (isDashboardPath(location.pathname)) {
      scrollToNotifications();
    } else {
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

  if (isMobile) {
    return (
      <Box>
        <MobileNavbar
          homePath={homePath}
          items={items}
          onNotificationClick={handleBellClick}
          activeIndex={activeIndex}
          notificationCount={totalNotificationCount}
        />

        <main>
          <Outlet/>
        </main>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          background: tokens.color.brand.primaryBackground,
        }}
      >
        <UserNavRail
          collapsed={railCollapsed}
          onToggle={() => setRailCollapsed(prev => !prev)}
          pathname={location.pathname}
          user={user}
        />
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <UserDesktopTopBar
            unreadCount={unreadNotificationCount}
            user={user}
            logout={logout}
            onOpenNotifications={handleOpenNotifications}
          />
          <Box component="main" sx={{flex: 1, minWidth: 0}}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: tokens.color.brand.primaryBackground,
        paddingX: 2,
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        scrollbarGutter: "stable",
      }}
    >
      <DesktopNavbar
        homePath={homePath}
        items={items}
        isPathActive={isPathActive}
        handleBellClick={handleBellClick}
        totalNotificationCount={totalNotificationCount}
        logout={logout}
        sideMenuItems={sideMenuItems}
      />

      <main>
        <Outlet />
      </main>

    </Box>

  );
}
