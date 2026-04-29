import React, {useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Box, Select, MenuItem, FormControl, Button, Typography, Dialog, DialogContent } from "@mui/material";
import { useTheme } from "@mui/material/styles";
//import { getInstitutionById } from "../../api/financialinstitution/financialinstitutionApi";

function LinkBankAccount({open, onClose}) {
    const theme = useTheme();
    //const { institutionNumber } = useParams();
    const navigate = useNavigate();

    // selectedBank=name, selectedInstitution = institution number
    const [selectedBank, setSelectedBank] = useState("");
    const [selectedInstitution, setSelectedInstitution] = useState("");

    const banks = new Map();
    banks.set("BMO", "001")
    banks.set("RBC", "003");
    banks.set("CIBC", "010");
    banks.set("TD", "004");
    banks.set("Scotiabank", "002");
    banks.set("National Bank", "006");
    banks.set("Desjardins", "815");
    banks.set("Tangerine", "614");


    const ERROR_TEXT = "Please select a financial institution to continue"
    const handleClick = () => {
        navigate(`/simulatedbankauth/${selectedBank}`)
    }

    // todo: delete once confirmed financial institution is manually selected
    /*const fetchInstitution = async () => {
        try {
            const institutionNumber = 123; // Placeholder institution number for testing
            const resp = await getInstitutionById(institutionNumber);
            console.log("logging resp", resp);
            setSelectedInstitution(resp.name);
        } catch (err) {
            setSelectedInstitution(err.message)
        }
    }*/

    /*useEffect(() => {
        fetchInstitution();
    })*/

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogContent>
                <Box sx={{maxWidth: 420, width: "100%", mx: "auto", p: 2}}>

                    <Typography
                        variant="h6"
                        sx={{fontWeight: 600, color: "text.primary", mb: 2}}
                    >
                        Connect Bank Account
                    </Typography>

                    <FormControl fullWidth sx={{mb: 2}}>
                        <Select
                            displayEmpty
                            value={selectedBank}
                            // setting the bank's name and number
                            onChange={(e) => {
                                setSelectedBank(e.target.value);
                                setSelectedInstitution(banks[e.target.value]);
                            } }
                            sx={{
                                borderRadius: 3,
                                bgcolor: "background.paper",
                                fontSize: 15,
                                fontWeight: 500,
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.palette.divider,
                                    borderWidth: "0.5px",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "grey.400",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#0d6a8c",
                                    borderWidth: "1px",
                                },
                                "& .MuiSelect-select": {
                                    py: 2,
                                    px: 2.5,
                                    color: selectedBank ? "text.primary" : "text.disabled",
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        borderRadius: 3,
                                        border: `0.5px solid ${theme.palette.divider}`,
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                        mt: 0.5,
                                    },
                                },
                            }}
                        >
                            <MenuItem value=""></MenuItem>
                            {[...banks.entries()].map(([bank, tarnsitNumber]) => (
                                <MenuItem key={bank} value={bank}
                                          sx={{
                                              fontSize: 15,
                                              fontWeight: 500,
                                              py: 2,
                                              px: 2.5,
                                              "&.Mui-selected": {
                                                  bgcolor: "#eaf8fc",
                                                  color: "#0d6a8c",
                                                  "&:hover": {bgcolor: "#d9f3fa"},
                                              },
                                              "&:hover": {bgcolor: "grey.50"},
                                          }}
                                >{bank}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedBank === "" && <Typography
                        variant="body2"
                        sx={{color: "error.main", mb: 2, px: 0.5}}
                    >
                        Please select a financial institution to continue
                    </Typography>}

                    <Button onClick={handleClick} disabled={selectedBank === ""}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                bgcolor: "#a8e6f0",
                                color: "#0d2a40",
                                fontWeight: 500,
                                fontSize: 16,
                                textTransform: "none",
                                letterSpacing: 0.2,
                                boxShadow: "none",
                                "&:hover": {bgcolor: "#89dced", boxShadow: "none"},
                                "&:active": {transform: "scale(0.98)"},
                                "&.Mui-disabled": {bgcolor: "#eaf5f8", color: "#8ba4ae"},
                            }}
                    >
                        Continue with {selectedBank}
                    </Button>
                </Box>

                {/*<p>Selected instution based on API call: {selectedInstitution}</p>*/}
            </DialogContent>
        </Dialog>
    )
}
export default LinkBankAccount;