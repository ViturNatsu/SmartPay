import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {useAuth} from "@/context/AuthContext.jsx";
import {getFilteredUserAccounts, getInUseUserAccounts} from "@/api/accounts/accountApi.js";
import {handleAxiosError} from "@/api/axios.js";
import {Alert, Box, Card, CardContent, Snackbar, Stack, Typography} from "@mui/material";
import {batchCreatePaymentMethod} from "@/api/paymentmethods/paymentmethodApi.js";
import Button from "@mui/material/Button";
import { tokens } from "@/style/Theme.jsx";
function SimulatedBankAuthSuccess() {
  const {tokenClaims} = useAuth();
  const navigate = useNavigate();
  const {bankName, institutionNumber} = useParams();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [disabledAccounts, setDisabledAccounts] = useState([]);
  const [noAccountsToSelect, setNoAccountsToSelect] = useState(false);
    const [failSnackbar, setFailSnackBar] = useState(false);
  const [fetchedAccounts, setFetchedAccounts] = useState(null);
  const [inUseAccounts, setInUseAccounts] = useState(null);

  //Fetch filtered accounts and get a list of in use accounts
  useEffect(() => {
    console.log(tokenClaims.userId);

    const fetchFilteredAccounts = async () => {
      const res = await getFilteredUserAccounts(tokenClaims.userId,
          {institutionNumber: institutionNumber});
      console.log("Insitution accounts:");
      console.log(res);
      setFetchedAccounts(res);
    };

    const fetchInUseAccounts = async () => {
      const inUse = await getInUseUserAccounts(tokenClaims.userId);
      console.log("In use accounts:");
      console.log(inUse);
      setInUseAccounts(inUse);
    };

    fetchFilteredAccounts().catch(err => handleAxiosError(err));
    fetchInUseAccounts().catch(err => handleAxiosError(err));
  }, []);

  //Process the Account lists to determine useable and unusable accounts
  useEffect(() => {
    if (fetchedAccounts === null || inUseAccounts === null) return;

    let usableAccounts = [];
    let unUsableAccounts = [];
    fetchedAccounts.map((acc) => {
      if(acc != null && Object.hasOwn(acc, "active")){
        if(acc.active === true){
          if(inUseAccounts.some(inUseAcc => inUseAcc.id === acc.id)) {
            unUsableAccounts = [...unUsableAccounts, acc];
          } else {
            usableAccounts = [...usableAccounts, acc]
          }
        }
      }
    })
    setAccounts(usableAccounts);
    setDisabledAccounts(unUsableAccounts);
  }, [fetchedAccounts, inUseAccounts]);
  useEffect(() => {
        setNoAccountsToSelect(accounts.length === 0);
        setFailSnackBar(accounts.length === 0);
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
                  ? tokens.color.background.disabled
                  : selectedAccounts.includes(account.accountNumberDigest) ? tokens.color.background.selected : tokens.color.background.stack ,
              borderRadius: "12px",
              p: 2,
              margin:2,
              cursor: disabled ? "arrow" : "pointer",
              opacity: disabled ? 0.5 : 1,
              filter: disabled ? "greyscale(100%)": "",

      }}

      >
      <Stack>
          <Typography sx={{ color: tokens.color.text.secondary }}>
              {account.accountName}
          </Typography>
          <Typography sx={{ color: tokens.color.text.number.neutral , textAlign: "left"}}>
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
                boxShadow: tokens.shadow.small,
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
                    {noAccountsToSelect
                        ?
                        <Button
                            variant="contained"
                            onClick={() => {navigate("/payment-methods")}}
                            sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" } }}
                        >
                            Back
                        </Button>
                        :
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => {navigate("/payment-methods")}}
                                sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" },
                                    bgcolor: tokens.color.text.muted }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleLinkingPaymentMethods}
                                sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" }}}
                            >
                                Confirm and Link
                            </Button>
                        </Stack>
                    }
                </Stack>
            </CardContent>
        </Card>


        <Card
            elevation={0}
            sx={{
                width: "100%",
                bgcolor: tokens.color.background.surface,
                borderRadius: "16px",
                border: `1px solid ${tokens.color.border.gray}`,
                p: 3,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >


            <Stack spacing={1.0}>
                {accounts.map(account => renderAccount(account, false))}
                {disabledAccounts.map(account => renderAccount(account, true))}
            </Stack>


            <Snackbar
                open={failSnackbar}
                autoHideDuration={4000}
                onClose={() => setFailSnackBar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setFailSnackBar(false)}
                    severity="error"
                    variant="filled"
                >
                    No available Accounts to link!
                </Alert>
            </Snackbar>
        </Card>

    </>
  );
}
export default SimulatedBankAuthSuccess;