import {useOtpRequest} from "@/hooks/OtpHooks/OtpRequests/OtpRequestBase/useOtpRequest.js";
import {requestOtpCode} from "@/api/authApi.js";

export const useCardRevealOtpRequest = () => {
  return useOtpRequest({
    requestAPI: requestOtpCode,
  });
}