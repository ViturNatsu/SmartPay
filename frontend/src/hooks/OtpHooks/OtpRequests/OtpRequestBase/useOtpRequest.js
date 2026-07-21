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
 * @returns {{
 *   handleOtpRequest: Function,
 *   handleResend: Function,
 *   timeLeft: number,
 *   isSent: boolean,
 *   loading: boolean,
 *   error: (string|null),
 *   reset: Function
 * }} OTP request handlers and state.
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
 * const { handleOtpRequest } = useCardLockOtpRequest();
 *
 * const payload = ({example: example});
 *
 * return (
 *   <Button onClick={()=>{handleOtpRequest(payload)}}>
 *     Lock Card
 *   </Button>
 * );
 */

export const useOtpRequest = ({requestAPI} = {}) => {

  const [isSent, setIsSent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const lastRequestRef = useRef(null);

  const {
    timeLeft,
    stop,
    start: startCooldown,
  } = useCountdownTimer(30);

  const makeOtpRequest = async (payload) => {
    setRequesting(true);
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
      setRequesting(false);
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
    if (requesting || timeLeft > 0) return;
    if (!lastRequestRef.current) return;

    return await handleOtpRequest(lastRequestRef.current);
  };

  const reset = () => {
    stop();
    setIsSent(false);
    setRequesting(false);
    setError(null);
    lastRequestRef.current = null;
  }

  // perform a "Fake" request, which does not hit any endpoint, but updates states as if a successful request was made.
  // useful if a page doesn't perform an endpoint request, but must still show OTP states. (example: Showing resend cooldown)
  const mockOtpRequest = async (payload) => {
    lastRequestRef.current = payload;
    setIsSent(true);
    setError(null);
    startCooldown();
  }

  return {
    handleOtpRequest,
    handleResend,
    mockOtpRequest,
    timeLeft,
    isSent,
    requesting,
    error,
    reset
  };
};