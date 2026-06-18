import {useState, useRef, useCallback, useEffect} from "react";
import {useLocation} from "react-router-dom";

const INACTIVITY_TIMEOUT_MS = 30_000;

/**
 * Manages card reveal state for the virtual card on the Wallet page.
 *
 * Responsibilities:
 *  - Track whether card details are currently revealed.
 *  - Auto-mask after 30 seconds of user inactivity (no mouse/key/touch events).
 *  - Auto-mask when the user navigates to a different route.
 *
 * Usage:
 *   const { isRevealed, reveal, mask } = useCardReveal();
 */
export function useCardReveal() {
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef(null);
  const location = useLocation();

  const mask = useCallback(() => {
    setIsRevealed(false);
    clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(mask, INACTIVITY_TIMEOUT_MS);
  }, [mask]);

  const reveal = useCallback(() => {
    setIsRevealed(true);
    resetTimer();
  }, [resetTimer]);

  // Re-mask whenever the user navigates to a different page
  useEffect(() => {
    mask();
  }, [location.pathname, mask]);

  // While revealed, reset the inactivity timer on any user activity
  useEffect(() => {
    if (!isRevealed) return;

    const handleActivity = () => resetTimer();
    const events = ["mousemove", "keydown", "touchstart", "click"];

    events.forEach(e => window.addEventListener(e, handleActivity));
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearTimeout(timerRef.current);
    };
  }, [isRevealed, resetTimer]);

  return {isRevealed, reveal, mask};
}
