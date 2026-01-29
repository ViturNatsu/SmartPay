import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import * as authApi from "../api/authApi";

const SessionManagerContext = createContext(undefined);

// Time constants
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes logout
const ACTIVE_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes refresh tokens
const REFRESH_LEEWAY_MS = 2000; // Refresh 2s before token expires

export const SessionManagerProvider = ({ children, onSessionExpired }) => {
  // Refs to hold timers and state without triggering re-renders
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const isActiveRef = useRef(false); // Track if listeners are active
  const accessExpRef = useRef(null); // Access token expiry in ms

  const base64UrlDecode = (str) => {
    try {
      const pad = (s) => s + "===".slice((s.length + 3) % 4);
      const b64 = pad(str.replace(/-/g, "+").replace(/_/g, "/"));
      const decoded = atob(b64);
      const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      return text;
    } catch {
      return null;
    }
  };
  const decodeJwt = (token) => {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = base64UrlDecode(parts[1]);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const updateAccessTokenExpiry = useCallback(() => {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      accessExpRef.current = null;
      return;
    }

    const payload = decodeJwt(refreshToken);
    if (payload?.exp) {
      // Store refresh token expiry (in milliseconds)
      accessExpRef.current = payload.exp * 1000;
    }
  }, []);

  // Function to refresh tokens from backend
  const refreshTokens = useCallback(async () => {
    console.log("session refresh called")
    if (isRefreshingRef.current) return; // Avoid overlapping refreshes

    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      // No token session expired
      onSessionExpired?.();
      return;
    }

    try {
      isRefreshingRef.current = true;
      const data = await authApi.refreshTokens();

      // authApi.refreshTokens handles updating sessionStorage and accessToken
      updateAccessTokenExpiry();
      return data;
    } catch (err) {
      // Refresh failed (expired/invalid) force logout
      console.error("Token refresh failed:", err);
      onSessionExpired?.();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onSessionExpired]);

  const checkTokenExpiry = useCallback(() => {
    if (!accessExpRef.current) return false;

    const now = Date.now();
    const timeLeft = accessExpRef.current - now;

    // If token expired, trigger session expired
    if (timeLeft <= 0) {
      console.log("Token expired");
      onSessionExpired?.();
      return true;
    }

    // If token about to expire within leeway, trigger refresh
    if (timeLeft <= REFRESH_LEEWAY_MS) {
      console.log("Token about to expire, refreshing...");
      refreshTokens().catch(() => { });
      return true;
    }

    return false;
  }, [onSessionExpired, refreshTokens]);

  // Called when user has been inactive for INACTIVITY_LIMIT
  const handleInactivity = useCallback(() => {
    console.log("Session expired due to inactivity");
    onSessionExpired?.();
  }, [onSessionExpired]);

  // Called on any user activity to reset timers
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (checkTokenExpiry()) {
      return; // Token expired or being refreshed
    }

    // Reset inactivity timer
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(handleInactivity, INACTIVITY_LIMIT);

    // Schedule token refresh if user active long enough
    if (!refreshTimerRef.current) {
      refreshTimerRef.current = setTimeout(function tryRefresh() {
        const sinceLast = Date.now() - lastActivityRef.current;
        if (sinceLast >= ACTIVE_REFRESH_THRESHOLD) {
          // User has been active for threshold refresh tokens
          refreshTokens().catch(() => { });
          // Schedule next refresh while user remains active
          refreshTimerRef.current = setTimeout(
            tryRefresh,
            ACTIVE_REFRESH_THRESHOLD
          );
        } else {
          // Not active long enough clear timer
          clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      }, ACTIVE_REFRESH_THRESHOLD);
    }
  }, [handleInactivity, refreshTokens]);

  // Start session monitoring: attach listeners for activity and visibility
  const startListeners = useCallback(() => {
    if (isActiveRef.current) return; // Already monitoring
    updateAccessTokenExpiry();
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) =>
      document.addEventListener(ev, handleActivity, { passive: true })
    );

    const visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        handleActivity(); // Reset timers on tab focus
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    // Initialize timers immediately
    handleActivity();
    isActiveRef.current = true;
  }, [handleActivity]);

  // Stop session monitoring: remove listeners and clear timers
  const stopListeners = useCallback(() => {
    if (!isActiveRef.current) return; // Already stopped

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => document.removeEventListener(ev, handleActivity));
    document.removeEventListener("visibilitychange", handleActivity);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    accessExpRef.current = null;
    isActiveRef.current = false;
  }, [handleActivity]);

  // Cleanup on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      stopListeners();
    };
  }, [stopListeners]);

  const value = {
    startSessionMonitoring: startListeners,
    stopSessionMonitoring: stopListeners,
    refreshTokens, // Exposed for manual refresh if needed
  };

  return (
    <SessionManagerContext.Provider value={value}>
      {children}
    </SessionManagerContext.Provider>
  );
};

export const useSessionManager = () => {
  const ctx = useContext(SessionManagerContext);
  if (!ctx) {
    throw new Error(
      "useSessionManager must be used within a SessionManagerProvider"
    );
  }
  return ctx;
};
