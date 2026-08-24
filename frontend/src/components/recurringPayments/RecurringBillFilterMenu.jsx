import { Button, Card, Typography, InputLabel } from "@mui/material";
import { tokens } from "@/style/Theme";

export default function RecurringBillFilterMenu({ billFilters, toggleBillFilter, clearBillFilters }) {
  const statusOptions = [
    "Active",
    "Paused",
    "Cancelled",
    "Action Required"
  ];

  const scheduleOptions = [
    "Monthly",
    "Yearly"
  ];

    return (
        <Card className="filter-menu"
            sx={{
                borderRadius: 2,
                boxShadow: tokens.shadow.small,
                p: tokens.layout.pagePadding,
                mb: 5,
                position: "absolute",
                zIndex: 1000,
                width: "325px",
            }}
        >

            <Typography variant="body2"
                sx={{
                    margin: "0 0 14px 0",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: tokens.color.text.muted
                }}
            >Status</Typography>
            {statusOptions.map(status => (

                <InputLabel
                    key={status}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: tokens.color.text.black
                    }}
                >
                    <input
                        type="checkbox"
                        checked={billFilters.status.some(currentStatus => currentStatus.toLowerCase() === String(status).toLowerCase())}
                        onChange={() => toggleBillFilter("status", status)}

                        style={{
                            accentColor: tokens.color.button.primaryBg,
                            width: "18px",
                            height: "18px",
                            margin: 0,
                        }}
                    />
                    {status}
                </InputLabel>
            ))}

            <div className="divider" style={{
                borderTop: "2px solid",
                borderTopColor: tokens.color.border.gray,
                margin: "20px 0 16px"
            }} />

            <Typography variant="body2"
                sx={{
                    margin: "0 0 14px 0",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: tokens.color.text.muted
                }}
            >Recurring period</Typography>
            {scheduleOptions.map(period => (

                <InputLabel
                    key={period}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: tokens.color.text.black
                    }}
                >
                    <input
                        type="checkbox"
                        checked={billFilters.schedule.some(schedule => schedule.toLowerCase() === String(period).toLowerCase())}
                        onChange={() => toggleBillFilter("schedule", period)}
                        style={{
                            accentColor: tokens.color.button.primaryBg,
                            width: "18px",
                            height: "18px",
                            margin: 0,
                        }}
                    />
                    {period}
                </InputLabel>
            ))}

            <div className="divider" />
            <Button
                variant="outlined"
                onClick={() => clearBillFilters()}
                sx={{
                    alignSelf: { xs: "stretch", sm: "auto" },
                    width: "100%",
                    marginTop: "18px",
                    color: tokens.color.text.black
                }}>
                Clear filters
            </Button>
        </Card>
    );
};