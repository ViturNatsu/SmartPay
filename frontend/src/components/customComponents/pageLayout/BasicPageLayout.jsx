import {tokens} from "@/style/Theme.jsx";
import {Box, Container, Typography} from "@mui/material";

export const BasicPageLayout = ({title, subtitle, children}) => {

  return (
    <Box sx={{
      background: tokens.color.brand.primaryBackground,
      minHeight: "100%",
      width: "100%",
      boxSizing: "border-box",
      p: { xs: 2, md: 2.5 },
    }}>
      <Container maxWidth="lg">
        <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ mb: 3, color: tokens.color.text.secondary }}>
          {subtitle}
        </Typography>
        {children}
      </Container>
    </Box>
  );
  }

// <Typography
//   variant="h4"
//   sx={{fontWeight: 800, mb: 0.75, letterSpacing: "-0.04em"}}
// >
//   Wallet
// </Typography>
// <Typography sx={{color: tokens.color.text.heading, fontSize: 15}}>
//   Manage your SmartPay wallet, view your balance and load funds to
//   send money or make payments.
// </Typography>