import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {useAuth} from "@/context/AuthContext.jsx";
import {getFilteredUserAccounts} from "@/api/accounts/accountApi.js";
import {handleAxiosError} from "@/api/axios.js";
import {Box, Card, CardContent, Stack, Typography} from "@mui/material";
import {batchCreatePaymentMethod, createPaymentMethod} from "@/api/paymentmethods/paymentmethodApi.js";
import Button from "@mui/material/Button";


function SimulatedBankAuthSuccess() {
  const {tokenClaims} = useAuth();
  const navigate = useNavigate();
  const {bankName, institutionNumber} = useParams();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [disabledAccounts, setDisabledAccounts] = useState([]);

  useEffect(() => {
      console.log(tokenClaims.userId);
      async function initLoad(){
          const res = await getFilteredUserAccounts(tokenClaims.userId,
              {institutionNumber: institutionNumber})

          let usableAccounts = [];
          let unUsableAccounts = []
          res.map((acc) => {
              if(acc != null && Object.hasOwn(acc, "active")){
                  if(acc.active === true){
                      usableAccounts = [...usableAccounts, acc]
                  }else{
                      unUsableAccounts = [...unUsableAccounts, acc];
                  }
              }
          })
          setAccounts(usableAccounts);
          setDisabledAccounts(unUsableAccounts);
      }
      initLoad().catch(err => handleAxiosError(err));
      }, []);
  useEffect(() => {
        console.log(accounts)
    }, [accounts]);

  const handleLinkingPaymentMethods = async () => {
      if(selectedAccounts.length === 0) return;

      let payloads = [];
      selectedAccounts.forEach(accountDigest => {
          const payload = {
              bankId: institutionNumber,
              bankDisplayName: bankName,
              active: true,
              accountIdentifierDigest: accountDigest,
              user: {
                  id: tokenClaims.userId
              }
          }
          payloads = [...payloads, payload];
      });
      await batchCreatePaymentMethod(payloads)

      // hack to wait for DB sync
      await new Promise(r => setTimeout(r, 100));
      navigate("/payment-methods")
  }

  const handleSelectingPaymentMethod =  (accountDigest) => {
      if(selectedAccounts.includes(accountDigest)){
          setSelectedAccounts(selectedAccounts.filter(accNum => accNum !== accountDigest));
      }else{
          setSelectedAccounts([...selectedAccounts, accountDigest]);
      }
  }


  const renderAccount = (account, disabled) => (
      <Stack
          key={account.id}
          component={disabled ? "div" : "button"}
          onClick={() => disabled
              ? undefined
              : handleSelectingPaymentMethod(account.accountNumberDigest)}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ bgcolor: disabled
                  ? "#caccce"
                  : selectedAccounts.includes(account.accountNumberDigest) ? "#DFF6F8" : "#F9FAFB" ,
              borderRadius: "12px",
              p: 2,
              margin:2,

              cursor: disabled ? "arrow" : "pointer",
              opacity: disabled ? 0.5 : 1,
              filter: disabled ? "greyscale(100%)": "",

      }}

      >
      <Stack>
          <Typography sx={{ color: "#4B5563" }}>
              {account.accountName}
          </Typography>
          <Typography sx={{ color: "#6B7280" , textAlign: "left"}}>
              {account.accountNumber.substring(2)}
          </Typography>
      </Stack>
      </Stack>
  );




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
                {accounts.map(account => renderAccount(account, false))}
                {disabledAccounts.map(account => renderAccount(account, true))}
            </Stack>
        </Card>
    </>
  );
}
export default SimulatedBankAuthSuccess;