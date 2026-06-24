import { Box, useTheme } from "@mui/material";

export default function CustomNoRowsOverlay() {
    const theme = useTheme();
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}
        >
        No transactions found
        </Box>
    );
}