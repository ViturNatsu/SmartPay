import { useRef, useState} from "react";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";

/**
 * Custom hook for requesting and resending OTP codes.
 *
 * Responsibilities:
 *  - Send an OTP request through the provided API function.
 *  - Track whether an OTP has been sent.
 *  - Manage loading and error states.
 *  - Enforce a cooldown period before allowing OTP resends.
 *  - Store the last request payload to support resending.
 *
 * @param {Object} params
 * @param {Function} params.requestAPI - API function responsible for sending the OTP request.
 *
 * @returns {Object} OTP request state and handlers.
 * @returns {Function} returns.handleOtpRequest - Sends an OTP request with the provided payload.
 * @returns {Function} returns.handleResend - Resends the previous OTP request after the cooldown expires.
 * @returns {number} returns.timeLeft - Remaining cooldown time in seconds.
 * @returns {boolean} returns.isSent - Whether an OTP has been successfully sent.
 * @returns {boolean} returns.loading - Whether an OTP request is currently in progress.
 * @returns {string|null} returns.error - Error message from the latest failed request.
 * @returns {Function} returns.reset - Resets OTP state and clears the cooldown timer.
 *
 * @example Create a specialized OTP hook by composing `useOtpRequest`.
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

export const useOtpRequest = ({requestAPI}) => {

  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastRequestRef = useRef(null);

  const {
    timeLeft,
    stop,
    start: startCooldown,
  } = useCountdownTimer(30);

  const makeOtpRequest = async (payload) => {
    setLoading(true);
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
      setLoading(false);
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
    if (loading || timeLeft > 0) return;
    if (!lastRequestRef.current) return;

    return await handleOtpRequest(lastRequestRef.current);
  };

  const reset = () => {
    stop();
    setIsSent(false);
    setLoading(false);
    setError(null);
    lastRequestRef.current = null;
  }

  return {
    handleOtpRequest,
    handleResend,
    timeLeft,
    isSent,
    loading,
    error,
    reset
  };
};