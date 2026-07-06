import { Box, Typography, Avatar } from "@mui/material";
import logo from "@/style/logo.png";
import SecurityIcon from "@mui/icons-material/Security";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { tokens } from "@/style/Theme";

/**
 * SmartPayBanner - Common header/banner for SmartPay auth pages.
 *
 * Props:
 * - showExtra (bool): Show extra content (for Register page)
 * - sx (object): Optional style overrides for the root Box 
 */

const bulletContainerSx = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "0px",
    gap: "16px",
    width: "427.86px",
    maxWidth: "448px",
    height: "68px",
};

const bulletBoxSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0px",
    gap: "4px",
};

const bulletBoxHeadingSx = {
    width: "150.39px",
    height: "24px",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "24px",
    /* identical to box height, or 150% */
    display: "flex",
    alignItems: "center",
    color: tokens.color.text.primary,
};

const bulletBoxInfoSx = {
    width: "341.13px",
    height: "40px",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "20px",
    display: "flex",
    color: tokens.color.text.primary,
    textAlign: "left",
};

export const SmartPayBanner = ({ showBulletPoints = false, onRegisterPage = false }) => (
    <Box
        sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 0 },
            position: "relative",
            overflow: "hidden",
            backgroundImage: tokens.color.gradient.banner,
        }}
    >
        {/* Sets up the logo */}
        <Box sx={{ textAlign: "center", position: "relative" }}>
            <Box
                component="img"
                src={logo}
                alt="SmartPay Logo"
                sx={{
                    width: 100,
                    height: "auto",
                    mx: "auto",
                    display: "block",
                }}
            />
            {/* Sets up SmartPay title */}
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: tokens.color.brand.primary,
                    mb: 1,
                }}
            >
                SmartPay
            </Typography>
            {/* Sets up brief description. */}
            <Typography
                sx={{
                    color: tokens.color.text.secondary,
                    maxWidth: 360,
                    mx: "auto",
                    lineHeight: 1.6,
                }}
            >
                {onRegisterPage ? "Join thousands of businessess managing their finances with ease" : "Seamless financial integration for the modern enterprise."}
            </Typography>
            {/* small bullet points section w icons */}
            {showBulletPoints &&
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        px: { xs: 3, md: 8 },
                        py: { xs: 6, md: 0 },
                        padding: "16px 0px 0px",
                        gap: "24px",
                        width: "427.86px",
                        height: "176px",
                    }}
                >
                    <Box sx={bulletContainerSx}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                backgroundColor: tokens.color.brand.primaryLight,
                                borderRadius: 2,
                            }}
                        >
                            <SecurityIcon sx={{ color: tokens.color.brand.primary }}></SecurityIcon>
                        </Avatar>
                        <Box sx={bulletBoxSx}>
                            <Typography sx={bulletBoxHeadingSx}>
                                Bank-level Security
                            </Typography>
                            <Typography sx={bulletBoxInfoSx}>
                                Your data is encrypted and protected with industry-leading
                                security standards.
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={bulletContainerSx}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                backgroundColor: tokens.color.brand.primaryLight,
                                borderRadius: 2,
                            }}
                        >
                            <FlashOnIcon sx={{ color: tokens.color.brand.primary }}></FlashOnIcon>
                        </Avatar>
                        <Box sx={bulletBoxSx}>
                            <Typography sx={bulletBoxHeadingSx}> Instant Setup</Typography>
                            <Typography sx={bulletBoxInfoSx}>
                                Get started in minutes and connect your financial institutions
                                seamlessly.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            }
        </Box>
    </Box>
);
