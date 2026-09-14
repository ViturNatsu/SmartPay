import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
import {Stack, Typography, Link} from "@mui/material";
import {tokens} from "@/style/Theme.jsx";

export const Support = () => {
  return (
    <BasicPageLayout
      title="Support"
      subtitle="Contact options"
    >
      <Stack spacing={1.5}>
        <Typography sx={{color: tokens.color.text.secondary}}>
          Need help with your SmartPay account? Reach our support team using the options below.
        </Typography>
        <Typography>
          Email:{" "}
          <Link href="mailto:support@example.com">support@example.com</Link>
        </Typography>
      </Stack>
    </BasicPageLayout>
  );
};
