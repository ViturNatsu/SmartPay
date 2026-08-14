import {Card, Paper} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import {tokens} from "@/style/Theme.jsx";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {Link as RouterLink} from "react-router-dom";
import logo from "@/style/logo.png";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import Divider from "@mui/material/Divider";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {Outlet} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";

export const DesktopNavbar = ({
  homePath,
  items,
  isPathActive,
  handleBellClick,
  totalNotificationCount,
  logout,
  sideMenuItems,
  }) => {

  const [menuOpen, setMenuOpen] = React.useState(false);


  return (
    <>
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
        <Container
          maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 72,
              px: {
                xs: 2,
                md: 0
              },
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component={RouterLink}
              to={homePath}
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
                sx={{height: 42, width: "auto"}}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{fontWeight: 700, letterSpacing: "0.02em"}}
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
                  "&::-webkit-scrollbar": {display: "none"},
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {items.map(item => {
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
                        backgroundColor: active
                          ? tokens.color.brand.selected
                          : "transparent",
                        color: active
                          ? tokens.color.brand.primary
                          : tokens.color.text.secondary,
                        "&:hover": {
                          backgroundColor: active
                            ? tokens.color.action.selectedHover
                            : tokens.color.action.hover,
                        },
                        "& .MuiButton-startIcon": {color: "inherit"},
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <IconButton
              aria-label="menu"
              onClick={() => setMenuOpen(prev => !prev)}
              sx={{
                color: tokens.color.text.secondary,
                flexShrink: 0,
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            {/* RIGHT: bell + divider + profile + logout. */}
            <Box
              sx={{display: "flex", alignItems: "center", gap: 2, flexShrink: 0}}
            >
              <IconButton
                aria-label="notifications"
                onClick={handleBellClick}
                sx={{color: tokens.color.text.secondary,}}
              >
                <Badge badgeContent={totalNotificationCount} color="error" invisible={totalNotificationCount === 0} max={9}>
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />

              {/* Placeholder for user's name and premium member status.
                TODO: Grab user's name and status from the backend display it here. */}
              <Box sx={{display: "flex", alignItems: "center", gap: 1.25}}></Box>

              <IconButton
                aria-label="logout"
                onClick={logout}
                sx={{
                  borderRadius: 2,
                  backgroundColor: tokens.color.action.danger,
                  color: tokens.color.status.error,
                  "&:hover": {
                    backgroundColor: tokens.color.action.dangerHover,
                  },
                }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: tokens.color.background.surface,
            borderLeft: `1px solid ${tokens.color.border.light}`,
            boxShadow: tokens.shadow.elevated,
          },
        }}
      >
        <Box
          sx={{
            width: 300,
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: tokens.color.text.primary,
            }}
          >
            Menu
          </Typography>

          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {sideMenuItems.map(item => (
              <ListItemButton
                key={item.label}
                component={RouterLink}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                sx={{
                  borderRadius: 2,
                  color: tokens.color.text.secondary,
                  "&:hover": {
                    color: tokens.color.brand.primary,
                    backgroundColor: tokens.color.brand.primaryLight,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
