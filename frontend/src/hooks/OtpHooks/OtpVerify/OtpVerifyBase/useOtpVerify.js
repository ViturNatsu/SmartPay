import {useState} from "react";
import {sendVerifyCode} from "@/api/authApi.js";


export const useOtpVerify = ({
      RequestAPI = sendVerifyCode,
    } = {}
  ) => {

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);

  const sendOtpVerify = async (payload) => {
    setIsVerifying(true);
    try{
      const res = await RequestAPI(payload);
      setError(null);
      return res;
    }catch(err){
      setError(err?.response?.data?.message || err.message || "Something went wrong");
      throw err;
    }
    finally {
      setIsVerifying(false);
    }
  }

  const reset = () => {
    setIsVerifying(false);
    setError(null);
  }

  return {
    handlers: {
      sendOtpVerify,
      reset,
    },
    state: {
      isVerifying,
      error,
    }
  }
}