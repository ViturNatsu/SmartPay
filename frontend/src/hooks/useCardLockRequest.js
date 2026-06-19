import { createCardLockRequestOTP } from "@/api/cards/cardsApi.js";
import { useRef, useState} from "react";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";

export const useCardLockRequestData = () => {

  const {
    timeLeft,
    stop,
    start: startCooldown,
  } = useCountdownTimer(30);

  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastRequestRef = useRef(null);

  const requestCardLockOTP = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createCardLockRequestOTP(payload);
      if (res.status !== 202) {
        setIsSent(false);
        // silently returning without raising error. Behavior should be adjusted in the future.
        // this code is currently tracking what happens when the status code is different.
        return;
      }

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

  const handleSendOtp = async (payload) => {
    lastRequestRef.current = payload

    const res = await requestCardLockOTP(payload);

    if (res) {
      startCooldown();
    }

    return res;
  };

  const handleResend = async () => {
    if (loading || timeLeft > 0) return;
    if (!lastRequestRef.current) return;

    return await handleSendOtp(lastRequestRef.current);
  };

  const reset = () => {
    stop();
    setIsSent(false);
    setLoading(false);
    setError(null);
    lastRequestRef.current = null;
  }

  return {
    handleSendOtp,
    handleResend,
    timeLeft,
    isSent,
    loading,
    error,
    reset
  };
};