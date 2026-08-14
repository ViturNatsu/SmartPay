import { useRef, useState} from "react";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";

/**
 * Custom hook for requesting and resending OTP codes.
 *
 * This hook abstracts OTP request flows by handling:
 *  - Sending OTP requests through a provided API function.
 *  - Tracking request status and errors.
 *  - Managing resend cooldown timing.
 *  - Persisting the latest request payload for resend operations.
 *
 * @param {Object} params
 * @param {Function} params.requestAPI - Function used to send the OTP request.
 *
 * @returns {{handlers: {handleOtpRequest: function(*): Promise<*>, handleResend: function(): Promise<undefined|*>, handleMockOtpRequest: function(*): Promise<void>, reset: function(): void}, state: {timeLeft: number, isSent: boolean, isRequesting: boolean, error: string}}} OTP request handlers and state.
 *
 * @example Create a specialized OTP hook by composing `useOtpRequest`.
 *
 *
 * // Note: createCardLockRequestOTP is a valid request API
 *
 * export const useCardLockOtpRequest = () => {
 *   return useOtpRequest({
 *     requestAPI: createCardLockRequestOTP,
 *   });
 * };
 *
 * // Usage in a component
 *
 * const otpRequestObject = useCardLockOtpRequest();
 *
 * const payload = ({example: example});
 *
 * return (
 *   <Button onClick={otpRequestObject.handlers.handleOtpRequest(object)}>
 *     Lock Card
 *   </Button>
 * );
 */

export const useOtpRequest = ({requestAPI} = {}) => {

  const [isSent, setIsSent] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const lastRequestRef = useRef(null);
  const [resent, setResent] = useState(false);

  const {
    timeLeft,
    stop,
    start: startCooldown,
  } = useCountdownTimer(30);

  const makeOtpRequest = async (payload) => {
    setIsRequesting(true);
    setError(null);

    try {
      const res = await requestAPI(payload);
      setIsSent(true);
      setError(null);
      return res;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong");
      throw err;
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOtpRequest = async (payload) => {
    lastRequestRef.current = payload

    const res = await makeOtpRequest(payload);

    if (res) {
      startCooldown();
    }

    return res;
  };

  const handleResend = async () => {
    setResent(true);
    if (isRequesting || timeLeft > 0) return;
    if (!lastRequestRef.current) return;

    return await handleOtpRequest(lastRequestRef.current);
  };

  const reset = () => {
    stop();
    setIsSent(false);
    setIsRequesting(false);
    setError(null);
    lastRequestRef.current = null;
  }

  // perform a "Fake" request, which does not hit any endpoint, but updates states as if a successful request was made.
  // useful if a page doesn't perform an endpoint request, but must still show OTP states. (example: Showing resend cooldown)
  const handleMockOtpRequest = async (payload) => {
    lastRequestRef.current = payload;
    setIsSent(true);
    setError(null);
    startCooldown();
  }

  return {
    handlers: {
      handleOtpRequest,
      handleResend,
      handleMockOtpRequest,
      reset
    },
    state: {
      timeLeft,
      isSent,
      isRequesting,
      error,
    },
  };
};