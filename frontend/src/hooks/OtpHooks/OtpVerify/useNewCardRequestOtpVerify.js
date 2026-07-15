import {createNewCardRequest} from "@/api/cardrequest/cardrequestApi.js";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";


export const useNewCardRequestOtpVerify = () => {

  return useOtpVerify({RequestAPI: createNewCardRequest});
}