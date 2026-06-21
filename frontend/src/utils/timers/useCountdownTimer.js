import { useEffect, useRef, useState, useCallback } from "react";

export const useCountdownTimer = (initialSeconds = 0) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  const start = useCallback((seconds = initialSeconds) => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
  }, []);

  const reset = useCallback((seconds = initialSeconds) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  }, [initialSeconds]);

  // ONLY depends on isRunning
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
  };
};