import {useOtpRequest} from "@/hooks/OtpHooks/OtpRequests/OtpRequestBase/useOtpRequest.js";
import {createCardLockRequestOTP} from "@/api/cards/cardsApi.js";

export const useCardLockOtpRequest = () => {
  return useOtpRequest({
    requestAPI: createCardLockRequestOTP,
  });
}