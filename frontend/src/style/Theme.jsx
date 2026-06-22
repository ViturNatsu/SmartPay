import { createTheme } from "@mui/material";

export const tokens = {
  color: {
    brand: {
      primary: "#0F7490",
      primaryHover: "#0A5A70",
      primaryLight: "#E5F5FA",
      primaryBackground: "#F8FAFC",
      primaryMid: "#B2DDE8",
      navy: "#0D1B2A",
      cardNavy: "#0F2336",
    },
    icon: {
      successBg: "#25A18E",
      successCheck: "rgba(37, 161, 142, 0.49)",
      quickAction: "#5B35D5"
    },
    background: {
      app: "#F5F7FA",
      surface: "#FFFFFF",
      stack: "#F9FAFB",
      quickAction: "#F2EFFF"
    },
    text: {
      primary: "#0D1B2A",
      secondary: "#475569",
      muted: "#94A3B8",
      white: "#FFFFFF",
      number: {
        positive: "#16A34A",
        negative: "#DC2626",
        neutral: "#6B7280",
      }
    },
    border: {
      light: "#E2E8F0",
      medium: "#CBD5E1",
    },
    status: {
      success: "#15803D",
      successBg: "#DCFCE7",
      error: "#B91C1C",
      errorBg: "#FEE2E2",
      warning: "#B45309",
      warningBg: "#FEF3C7",
    },
    button: {
      primaryBg: "#0F7490",
      primaryText: "#FFFFFF",
      primaryHover: "#0A5A70",
      secondaryBg: "#E5F5FA",
      secondaryText: "#0A5A70",
      secondaryBorder: "#B2DDE8",
      neutralBg: "#FFFFFF",
      neutralText: "#475569",
      neutralBorder: "#CBD5E1",
      gradientBg: "linear-gradient(135deg, #008c99, #00a8b5)",
      disabledBg:"#F3F4F6",
    },
    nav: {
      text: "#475569",
      activeText: "#0F7490",
      background: "#FFFFFF",
      border: "#E2E8F0",
      avatarBg: "#0F7490",
    },
    form: {
      inputBorder: "#CBD5E1",
      inputFocusBorder: "#0F7490",
      focusRing: "rgba(15, 116, 144, 0.12)",
      modalOverlay: "rgba(13, 27, 42, 0.45)",
      modalSurface: "#FFFFFF",
    },
    gradient: {
      virtualCard: "linear-gradient(135deg, #0F2336 0%, #1A3A52 60%, #0F7490 100%)",
      walletBalance: "linear-gradient(135deg, #062F3D, #0097A7)",
    },
    underline: {
      dark: "#000000",
    }
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    xxl: 20,
    circle: "50%",
    pill: 9999,
  },
  typography: {
    fontFamily: [
      "Inter", "system-ui", "-apple-system",
      "Segoe UI", "Roboto", "Arial", "sans-serif",
    ].join(","),
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    fontSize: {
      extraSmall: 13,
      small: 15,
    }
  },
  shadow: {
    card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    elevated: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
};

export const theme = createTheme({
  palette: {
    primary: {
      main: tokens.color.brand.primary,
      dark: tokens.color.brand.primaryHover,
      light: tokens.color.brand.primaryLight,
      contrastText: tokens.color.text.white,
    },
    secondary: {
      main: tokens.color.brand.primaryLight,
      dark: tokens.color.brand.primaryMid,
      contrastText: tokens.color.brand.primaryHover,
    },
    background: {
      default: tokens.color.background.app,
      paper: tokens.color.background.surface,
    },
    text: {
      primary: tokens.color.text.primary,
      secondary: tokens.color.text.secondary,
      disabled: tokens.color.text.muted,
    },
    error: {
      main: tokens.color.status.error,
      light: tokens.color.status.errorBg,
    },
    success: {
      main: tokens.color.status.success,
      light: tokens.color.status.successBg,
    },
    warning: {
      main: tokens.color.status.warning,
      light: tokens.color.status.warningBg,
    },
    divider: tokens.color.border.light,
  },
  shape: {
    borderRadius: tokens.borderRadius.medium,
  },
  typography: {
    fontFamily: tokens.typography.fontFamily,
    fontWeightRegular: tokens.typography.fontWeight.regular,
    fontWeightMedium: tokens.typography.fontWeight.medium,
    fontWeightBold: tokens.typography.fontWeight.bold,
    h3: { fontWeight: tokens.typography.fontWeight.extrabold, letterSpacing: "-0.02em" },
    h4: { fontWeight: tokens.typography.fontWeight.bold },
    h5: { fontWeight: tokens.typography.fontWeight.bold },
    h6: { fontWeight: tokens.typography.fontWeight.bold },
    body2: { color: tokens.color.text.secondary, fontSize: "0.875rem" },
    caption: { color: tokens.color.text.muted },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: tokens.typography.fontWeight.semibold,
          borderRadius: tokens.borderRadius.large,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          backgroundColor: tokens.color.button.primaryBg,
          color: tokens.color.button.primaryText,
          "&:hover": { backgroundColor: tokens.color.button.primaryHover },
        },
        containedSecondary: {
          backgroundColor: tokens.color.button.secondaryBg,
          color: tokens.color.button.secondaryText,
          border: `1px solid ${tokens.color.button.secondaryBorder}`,
        },
        outlined: {
          backgroundColor: tokens.color.button.neutralBg,
          color: tokens.color.button.neutralText,
          borderColor: tokens.color.button.neutralBorder,
          "&:hover": {
            backgroundColor: tokens.color.background.app,
            borderColor: tokens.color.border.medium,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: tokens.borderRadius.large,
            backgroundColor: tokens.color.background.surface,
            "& fieldset": { borderColor: tokens.color.form.inputBorder },
            "&:hover fieldset": { borderColor: tokens.color.border.medium },
            "&.Mui-focused fieldset": {
              borderColor: tokens.color.form.inputFocusBorder,
              boxShadow: `0 0 0 3px ${tokens.color.form.focusRing}`,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: tokens.color.brand.primary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.background.surface,
          borderRadius: tokens.borderRadius.xl,
          boxShadow: tokens.shadow.card,
          border: `1px solid ${tokens.color.border.light}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: tokens.borderRadius.xl },
        elevation2: { boxShadow: tokens.shadow.elevated },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.borderRadius.xl,
          backgroundColor: tokens.color.form.modalSurface,
        },
        root: {
          "& .MuiBackdrop-root": {
            backgroundColor: tokens.color.form.modalOverlay,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.nav.background,
          color: tokens.color.text.primary,
          boxShadow: "none",
          borderBottom: `1px solid ${tokens.color.nav.border}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.borderRadius.large },
        standardSuccess: {
          backgroundColor: tokens.color.status.successBg,
          color: tokens.color.status.success,
        },
        standardError: {
          backgroundColor: tokens.color.status.errorBg,
          color: tokens.color.status.error,
        },
        standardWarning: {
          backgroundColor: tokens.color.status.warningBg,
          color: tokens.color.status.warning,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.color.border.light },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.nav.avatarBg,
          color: tokens.color.text.white,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: tokens.borderRadius.large },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.nav.background,
          borderTop: `1px solid ${tokens.color.nav.border}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: tokens.color.nav.text,
          "&.Mui-selected": { color: tokens.color.nav.activeText },
        },
      },
    },
  },
});