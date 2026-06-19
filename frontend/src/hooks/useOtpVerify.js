import {useState} from "react";
import {sendVerifyCode} from "@/api/authApi.js";


export const useOtpVerify = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sendOtpVerify = async (payload) => {
    setLoading(true);
    try{
      const res = await sendVerifyCode(payload);
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

  return {sendOtpVerify,loading, error, reset};
}