import React from "react";
import {
  Container,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        {/* Title */}
        <Typography variant="h3" gutterBottom fontWeight={600}>
          Privacy Policy
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last updated: January 1, 2026
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* Introduction */}
        <Typography variant="h5" gutterBottom fontWeight={500}>
          1. Introduction
        </Typography>
        <Typography variant="body1" paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Typography>

        {/* Data Collection */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="Personal Data" secondary="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Usage Data" secondary="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Cookies" secondary="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." />
          </ListItem>
        </List>

        {/* Use of Data */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          3. How We Use Information
        </Typography>
        <Typography variant="body1" paragraph>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
          sequi nesciunt.
        </Typography>

        {/* Data Sharing */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          4. Data Sharing & Disclosure
        </Typography>
        <Typography variant="body1" paragraph>
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
          consectetur, adipisci velit, sed quia non numquam eius modi tempora
          incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
        </Typography>

        {/* Security */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          5. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
          suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
        </Typography>

        {/* User Rights */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          6. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
          quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat
          quo voluptas nulla pariatur.
        </Typography>

        {/* Contact */}
        <Typography variant="h5" gutterBottom fontWeight={500} sx={{ mt: 4 }}>
          7. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact
          us at:
        </Typography>

        <Typography variant="body1" fontWeight={500}>
          Email: support@example.com
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
