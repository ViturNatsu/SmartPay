import {useState} from "react";
import {createNewCardRequest} from "@/api/cardrequest/cardrequestApi.js";


export const useNewCardRequestOtpVerify = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const verifyNewCardRequestOtp = async (accessCode, confirmationStatus) => {
    setLoading(true);
    try{
      const res = await createNewCardRequest(accessCode, confirmationStatus);
      setError(null);
      return res;
    }catch(err){
      setError(err?.response?.data?.message || err.message || "Something went wrong");
      throw err;
    }
    finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setLoading(false);
    setError(null);
  }

  return {verifyNewCardRequestOtp, loading, error, reset};
}