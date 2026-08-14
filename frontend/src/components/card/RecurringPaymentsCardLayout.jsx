import {Box, Button, Card, Link, Stack, Typography, useTheme} from "@mui/material";
import {tokens} from "@/style/Theme.jsx";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import {RecurringPaymentsCardEntry} from "@/components/recurringPayments/CardEntry/RecurringPaymentsCardEntry.jsx";
import {useRecurringPayeesData} from "@/hooks/RecurringPayeeHooks/useRecurringPayeesData.js";
import {useEffect} from "react";

export const RecurringPaymentsCardLayout = () => {

  const theme = useTheme();
  const {handlers, state } = useRecurringPayeesData()

  useEffect(() => {
    handlers.getRecurringPayeesData()
      .then(r => console.log(r))
      .catch(e => console.log(e));
  }, [])

  return (
    <Card
      sx={{
        boxSizing: "border-box",
        width: "100%",
        p: "1.5rem",
      }}
    >
      <Stack spacing={1.5}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            Recurring Payments
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              cursor: "pointer",
              "&:hover .manage-all-text": {
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <Link
                href="/recurring-payments"
                underline="hover"
              >
                {"Manage All -->\n"}
              </Link>
            </Typography>
          </Stack>
        </Stack>

        {/* Payments */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "auto",
            scrollbarGutter: "stable",
            pb: 0.5,
          }}
        >
          {state.data?.length > 0 ? (
            state.data.map((item) => (
              <RecurringPaymentsCardEntry
                key={item.payeeId}
                payeeName={item.payeeName}
                price={item.amount}
                date={item.date}
              />
            ))
          ) : (
            <Card
              sx={{
                width: "100%",
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "none",
                backgroundColor: tokens.color.background.app,

              }}
            >
              <Typography variant="body2" color="text.secondary">
                No recurring payments setup.{" "}
                <Link
                  href="/recurring-payments"
                  underline="hover"
                >
                  {"Set one up -->"}
                </Link>
              </Typography>

            </Card>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}