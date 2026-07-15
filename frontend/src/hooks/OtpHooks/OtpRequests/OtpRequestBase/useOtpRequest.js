import { useRef, useState} from "react";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";

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