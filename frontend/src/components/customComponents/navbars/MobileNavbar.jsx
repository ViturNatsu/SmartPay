import {Card, useTheme} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import {tokens} from "@/style/Theme.jsx";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {Link as RouterLink} from "react-router-dom";
import logo from "@/style/logo.png";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import Avatar from "@mui/material/Avatar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import * as React from "react";

export const MobileNavbar = ({
  homePath,
  items,
  activeIndex,
  onNotificationClick,
  notificationCount,
  }) => {
    const theme = useTheme();

    return (
      <>
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: tokens.color.nav.background,
            color: tokens.color.text.primary,
            boxShadow: "none",
            borderBottom: `1px solid ${tokens.color.nav.border}`,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{minHeight: 64, px: 2, display: "flex", alignItems: "center"}}
            >
              <Box
                component={RouterLink}
                aria-label="home"
                to={homePath}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="SmartPay Logo"
                  sx={{height: 34, width: "auto"}}
                />
                <Typography sx={{fontWeight: 700, fontSize: 18}}>
                  SmartPay
                </Typography>
              </Box>

              <Box sx={{flexGrow: 1}} />

              <IconButton
                aria-label="notifications"
                onClick={onNotificationClick}
                sx={{color: tokens.color.text.secondary,}}
              >
                <Badge badgeContent={notificationCount} color="error" invisible={notificationCount === 0} max={9}>
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>

              <Avatar alt="Alex N" sx={{width: 34, height: 34, ml: 1}} />
            </Toolbar>
          </Container>
        </AppBar>

        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: `1px solid ${tokens.color.nav.border}`,
            backgroundColor: tokens.color.nav.background,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            value={activeIndex}
            onChange={(_, newValue) => navigate(navItems[newValue].path)}
            showLabels
          >
            {items.map(item => (
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
    )
}