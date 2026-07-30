import {useOtpRequest} from "@/hooks/OtpHooks/OtpRequests/OtpRequestBase/useOtpRequest.js";
import {requestNewCardOtp} from "@/api/cardrequest/cardrequestApi.js";

export const useRenewCardOtpRequest = () => {
  return useOtpRequest({
    requestAPI: requestNewCardOtp,
  });
}