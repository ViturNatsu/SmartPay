import {useOtpRequest} from "@/hooks/OtpHooks/OtpRequests/OtpRequestBase/useOtpRequest.js";
import {requestResetCode} from "@/api/authApi.js";

export const useCardRevealOtpRequest = () => {
  return useOtpRequest({
    requestAPI: requestResetCode,
  });
}