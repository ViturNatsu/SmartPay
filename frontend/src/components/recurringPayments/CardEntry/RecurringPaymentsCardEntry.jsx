import {Box, Card, Stack, Typography} from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
export const RecurringPaymentsCardEntry = ({payeeName="Unnamed Entry", price= "0.00", date}) => {

  const formattedDate = new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));


  return (
    <Card
      sx={{
        boxSizing: "border-box",
        p: 1.5,
        width: 170,
        minHeight: 110,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        sx={{
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        {/* Top: icon + amount */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <ImageIcon sx={{ fontSize: 24 }} />
          </Box>

          <Typography
            variant="body2"
            fontWeight={700}
          >
            ${price}
          </Typography>
        </Stack>

        <Stack spacing={0.25}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{
              color: "text.primary",
            }}
          >
            {payeeName}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.65rem",
              lineHeight: 1.2,
              color: "text.secondary",
            }}
          >
            Next {formattedDate}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  )
}