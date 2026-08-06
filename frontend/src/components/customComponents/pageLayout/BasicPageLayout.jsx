import {tokens} from "@/style/Theme.jsx";
import {Box, Container, Typography} from "@mui/material";

export const BasicPageLayout = ({title, subtitle, children}) => {

  return (
    <Box sx={{
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

        <Box
          sx={{
            paddingLeft: 2,
            paddingRight: 2}}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}