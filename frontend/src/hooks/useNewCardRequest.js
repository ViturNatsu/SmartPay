import {useState} from "react";
import {requestNewCardOtp} from "@/api/cardrequest/cardrequestApi.js";
import {useCountdownTimer} from "@/utils/timers/useCountdownTimer.js";

export const useNewCardRequest = () => {

  const {
    timeLeft,
    stop,
    start: startCooldown,
  } = useCountdownTimer(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSent, setIsSent] = useState(false);

  const requestNewCardRequestOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await requestNewCardOtp();
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
  }

  const handleSendOtp = async () => {

    const res = await requestNewCardRequestOTP();

    if (res) {
      startCooldown();
    }

    return res;
  };

  const handleResend = async () => {
    if (loading || timeLeft > 0) return;

    return await handleSendOtp();
  };

  const reset = () => {
    stop();
    setIsSent(false);
    setLoading(false);
    setError(null);
  }

  return {
    handleResend,
    handleSendOtp,
    loading,
    error,
    timeLeft,
    isSent,
    reset
  };
}