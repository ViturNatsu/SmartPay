import {createNewCardRequest} from "@/api/cardrequest/cardrequestApi.js";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";


export const useNewCardRequestOtpVerify = () => {

  return useOtpVerify({RequestAPI: createNewCardRequest});

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(false);
  //
  // const verifyNewCardRequestOtp = async (payload) => {
  //   setLoading(true);
  //   try{
  //     const res = await createNewCardRequest(payload);
  //     setError(null);
  //     return res;
  //   }catch(err){
  //     setError(err?.response?.data?.message || err.message || "Something went wrong");
  //     throw err;
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // }
  //
  // const reset = () => {
  //   setLoading(false);
  //   setError(null);
  // }
  //
  // return {verifyNewCardRequestOtp, loading, error, reset};
}