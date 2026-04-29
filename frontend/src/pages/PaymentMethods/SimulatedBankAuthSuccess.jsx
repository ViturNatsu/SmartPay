import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {useAuth} from "@/context/AuthContext.jsx";
import {getInactiveUserAccounts, getUserAccounts} from "@/api/accounts/accountApi.js";
import {handleAxiosError} from "@/api/axios.js";
import {Box, Card, CardContent, Stack, Typography} from "@mui/material";
import {batchCreatePaymentMethod, createPaymentMethod} from "@/api/paymentmethods/paymentmethodApi.js";
import Button from "@mui/material/Button";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";


function SimulatedBankAuthSuccess() {
  const {tokenClaims} = useAuth();
  const navigate = useNavigate();
  const {bankName, institutionNumber} = useParams();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  useEffect(() => {
      async function initLoad(){
          const res = await getInactiveUserAccounts(tokenClaims.userId, institutionNumber)
          setAccounts(res);
      }
      initLoad().catch(err => handleAxiosError(err));
      }, []);
  useEffect(() => {
        console.log(accounts)
    }, [accounts]);

  const handleLinkingPaymentMethods = async () => {
      if(selectedAccounts.length === 0) return;

      let payloads = [];
      selectedAccounts.forEach(accountNumber => {
          const payload = {
              bankId: institutionNumber,
              bankDisplayName: bankName,
              active: true,
              accountIdentifierMasked: accountNumber,
              user: {
                  id: tokenClaims.userId
              }
          }
          payloads = [...payloads, payload];
      });
      await batchCreatePaymentMethod(payloads)
      navigate("/payment-methods")
  }

  const handleSelectingPaymentMethod =  (accountNumber) => {
      if(selectedAccounts.includes(accountNumber)){
          setSelectedAccounts(selectedAccounts.filter(accNum => accNum !== accountNumber));
      }else{
          setSelectedAccounts([...selectedAccounts, accountNumber]);
      }
  }

  return (
    <>
      <Navbar/>

        <Card
            //ref={topOfDisplayRef}
            sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Link accounts
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>
                            Select accounts to link as payment methods.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleLinkingPaymentMethods}
                        sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" } }}
                    >
                        Confirm and Link
                    </Button>
                </Stack>
            </CardContent>
        </Card>


        <Card
            elevation={0}
            sx={{
                width: "100%",
                bgcolor: "#fff",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                p: 3,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >


            <Stack spacing={1.0}>
                {accounts.map((account) => (
                    <Stack
                        key={account.number}
                        component={"button"}
                        onClick={() => handleSelectingPaymentMethod(account.accountNumber)}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ bgcolor: selectedAccounts.includes(account.accountNumber) ? "#CFFAFE" : "#F9FAFB" ,
                            borderRadius: "12px",
                            p: 2,
                            cursor: "pointer" }}
                    >
                        <Stack>
                            <Typography sx={{ color: "#4B5563" }}>
                                {account.accountName}
                            </Typography>
                            <Typography sx={{ color: "#6B7280" }}>
                                {account.accountNumber}
                            </Typography>
                        </Stack>
                    </Stack>

                ))}
            </Stack>
        </Card>
    </>
  );
}
export default SimulatedBankAuthSuccess;