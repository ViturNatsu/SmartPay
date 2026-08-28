import {Box, Button, Stack, Typography} from "@mui/material";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
import {useNavigate} from "react-router-dom";
import {tokens} from "@/style/Theme.jsx";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

export function Transfers() {
    const navigate = useNavigate();

    const optionButtonSx = {
        flex: 1,
        minHeight: 120,
        justifyContent: "flex-start",
        textAlign: "left",
        paddingY: 1.5,
        paddingX: tokens.layout.pagePadding,
        borderRadius: `${tokens.borderRadius.xl}px`,
        backgroundColor: tokens.color.background.surface,
        color: tokens.color.text.heading,
        border: `1px solid ${tokens.color.border.light}`,
        boxShadow: tokens.shadow.card,
        textTransform: "none",
        transition: "all 0.2s ease",

        "&:hover": {
            backgroundColor: tokens.color.background.hover,
            borderColor: tokens.color.brand.primaryMid,
            boxShadow: tokens.shadow.elevated,
            transform: "translateY(-2px)",
        },
    };

  return (
    <BasicPageLayout
      title="Transfers"
      subtitle="Send money, manage subscriptions, or pay a bill."
    >
       <Box
            sx={{
                background: tokens.color.gradient.walletBalance,
                borderRadius: `${tokens.borderRadius.xxl}px`,
                paddingX: tokens.layout.pagePadding,
                paddingTop: 2,
                paddingBottom: 0.5,
                overflow: "visible",
            }}
        >
        <Typography
            sx={{
            color: tokens.color.text.white,
            fontWeight: tokens.typography.fontWeight.bold,
            fontSize: 24,
            mb: 2,
            }}
        >
            Where would you like to start?
        </Typography>

        <Stack
            direction={{xs: "column", md: "row"}}
            spacing={2}
            sx={{
                mb: -5,
                position: "relative",
                zIndex: 1,
            }}
        >
        
        <Button
            sx={optionButtonSx}
            onClick={() => navigate("/make-a-payment")}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <SendRoundedIcon
                sx={{
                    color: tokens.color.brand.primary,
                    fontSize: 32,
                }}
                />

                <Stack spacing={0.5}>
                <Typography
                    sx={{
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.color.text.heading,
                    }}
                >
                    Send Money
                </Typography>

                <Typography
                    variant="body2"
                    sx={{color: tokens.color.text.secondary}}
                >
                    Send money to another recipient.
                </Typography>
                </Stack>
            </Stack>
            <ArrowForwardIosRoundedIcon
                sx={{
                    color: tokens.color.text.muted,
                    fontSize: 18,
                }}
            />
        </Button>

        <Button
            sx={optionButtonSx}
            onClick={() => navigate("/subscriptions")}
            >
            <Stack direction="row" spacing={2} alignItems="center">
                <SubscriptionsRoundedIcon
                sx={{
                    color: tokens.color.brand.primary,
                    fontSize: 32,
                }}
                />

                <Stack spacing={0.5}>
                <Typography
                    sx={{
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.color.text.heading,
                    }}
                >
                    Subscriptions
                </Typography>

                <Typography
                    variant="body2"
                    sx={{color: tokens.color.text.secondary}}
                >
                    Manage your recurring subscriptions.
                </Typography>
                </Stack>
            </Stack>
            <ArrowForwardIosRoundedIcon
                sx={{
                    color: tokens.color.text.muted,
                    fontSize: 18,
                }}
            />
        </Button>

        <Button
            sx={optionButtonSx}
            onClick={() => navigate("/bills")}
            >
            <Stack direction="row" spacing={2} alignItems="center">
                <ReceiptLongRoundedIcon
                sx={{
                    color: tokens.color.brand.primary,
                    fontSize: 32,
                }}
                />

                <Stack spacing={0.5}>
                <Typography
                    sx={{
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.color.text.heading,
                    }}
                >
                    Bills
                </Typography>

                <Typography
                    variant="body2"
                    sx={{color: tokens.color.text.secondary}}
                >
                    Manage and pay your recurring bills.
                </Typography>
                </Stack>
            </Stack>
            <ArrowForwardIosRoundedIcon
                sx={{
                    color: tokens.color.text.muted,
                    fontSize: 18,
                }}
            />
        </Button>
        </Stack>
        </Box>
        <Box sx={{height: 6}} />
    </BasicPageLayout>
  );
}