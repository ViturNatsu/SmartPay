import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import * as authApi from "../api/authApi";
import { getAccessToken } from "../api/axios";

const SessionManagerContext = createContext(undefined);

// Fallback if the access token cannot be decoded
const DEFAULT_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

// Lightweight JWT payload decoder (no signature verification)
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

export const decodeJwtPayload = (token) => {
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

export const SessionManagerProvider = ({ children, onSessionExpired }) => {
  // ── Refs ──────────────────────────────────────────────────────────
  const lastActivityRef = useRef(Date.now());
  const expiryTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const isActiveRef = useRef(false);
  const accessExpRef = useRef(null);
  const inactivityLimitRef = useRef(DEFAULT_TOKEN_LIFETIME_MS);
  const refreshThresholdRef = useRef(DEFAULT_TOKEN_LIFETIME_MS * 0.75);
  const refreshLeewayRef = useRef(DEFAULT_TOKEN_LIFETIME_MS * 0.25);

  // Keep a stable ref to onSessionExpired so all closures see the latest value
  const onSessionExpiredRef = useRef(onSessionExpired);
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  // ── Decode token ──────────────────────────────────────────────────
  const updateAccessTokenExpiry = useCallback(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      // console.log("[SESSION] No access token — using defaults");
      inactivityLimitRef.current = DEFAULT_TOKEN_LIFETIME_MS;
      refreshThresholdRef.current = DEFAULT_TOKEN_LIFETIME_MS * 0.75;
      refreshLeewayRef.current = DEFAULT_TOKEN_LIFETIME_MS * 0.25;
      accessExpRef.current = null;
      return;
    }

    const payload = decodeJwtPayload(accessToken);
    if (payload?.exp && payload?.iat) {
      const tokenLifetimeMs = (payload.exp - payload.iat) * 1000;
      inactivityLimitRef.current = tokenLifetimeMs;
      refreshThresholdRef.current = tokenLifetimeMs * 0.75;
      refreshLeewayRef.current = tokenLifetimeMs * 0.25;
      accessExpRef.current = payload.exp * 1000;
      // console.log(
      //   `[SESSION] Token decoded — lifetime=${tokenLifetimeMs / 1000}s, ` +
      //   `refreshAt=${(tokenLifetimeMs * 0.75) / 1000}s, ` +
      //   `expiresAt=${new Date(payload.exp * 1000).toLocaleTimeString()}`
      // );
    } else if (payload?.exp) {
      const remainingMs = Math.max(payload.exp * 1000 - Date.now(), 0);
      const lifetimeMs = remainingMs || DEFAULT_TOKEN_LIFETIME_MS;
      inactivityLimitRef.current = lifetimeMs;
      refreshThresholdRef.current = lifetimeMs * 0.75;
      refreshLeewayRef.current = lifetimeMs * 0.25;
      accessExpRef.current = payload.exp * 1000;
      // console.log(`[SESSION] Token decoded (no iat) — remaining=${lifetimeMs / 1000}s`);
    } else {
      // console.log("[SESSION] Could not decode token — using defaults");
      inactivityLimitRef.current = DEFAULT_TOKEN_LIFETIME_MS;
      refreshThresholdRef.current = DEFAULT_TOKEN_LIFETIME_MS * 0.75;
      refreshLeewayRef.current = DEFAULT_TOKEN_LIFETIME_MS * 0.25;
      accessExpRef.current = null;
    }
  }, []);

  // ── Set / reset the expiry timer to the token's actual exp time ───
  const resetExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);

    const timeUntilExpiry = accessExpRef.current
      ? Math.max(accessExpRef.current - Date.now(), 0)
      : inactivityLimitRef.current;

    // console.log(`[SESSION] Expiry timer → ${(timeUntilExpiry / 1000).toFixed(1)}s`);

    expiryTimerRef.current = setTimeout(() => {
      // Guard: only fire if monitoring is still active
      if (!isActiveRef.current) return;
      // console.log("[SESSION] ⚠️ ACCESS TOKEN EXPIRED — logging user out!");
      onSessionExpiredRef.current?.();
    }, timeUntilExpiry);
  }, []);

  // ── Refresh tokens ────────────────────────────────────────────────
  const refreshTokens = useCallback(async () => {
    // console.log("[SESSION] refreshTokens() called");
    if (isRefreshingRef.current) {
      // console.log("[SESSION] Already refreshing — skipping");
      return;
    }

    const rt = sessionStorage.getItem("refresh_token");
    if (!rt) {
      // console.log("[SESSION] No refresh token — session expired");
      onSessionExpiredRef.current?.();
      return;
    }

    try {
      isRefreshingRef.current = true;
      // console.log("[SESSION] Calling POST /api/v1/auth/refresh…");
      const data = await authApi.refreshTokens();
      // console.log("[SESSION] Refresh SUCCESS");

      updateAccessTokenExpiry();
      // Push the expiry timer out to the NEW token's exp
      resetExpiryTimer();
      return data;
    } catch (err) {
      // console.error("[SESSION] Refresh FAILED:", err);
      onSessionExpiredRef.current?.();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [updateAccessTokenExpiry, resetExpiryTimer]);

  // ── Activity handler ──────────────────────────────────────────────
  // Only fires on deliberate user input: mousedown, keydown, touchstart.
  // NOT on: wheel (accidental trackpad), visibilitychange (tab switching),
  //         scroll (React re-renders), mousemove (passive cursor movement).
  const handleActivity = useCallback((e) => {
    // Ignore events after monitoring has been stopped
    if (!isActiveRef.current) return;

    const evType = e?.type || "init";
    // console.log(`[SESSION] 👆 Activity detected: ${evType}`);

    lastActivityRef.current = Date.now();

    // If token is within 25% of its lifetime, try an immediate refresh
    if (accessExpRef.current) {
      const timeLeft = accessExpRef.current - Date.now();
      if (timeLeft <= refreshLeewayRef.current && !isRefreshingRef.current) {
        // console.log(`[SESSION] Activity with ${(timeLeft / 1000).toFixed(1)}s left — immediate refresh`);
        refreshTokens();
        return;
      }
    }

    // Reset expiry timer to fire at the token's actual exp
    resetExpiryTimer();

    // Schedule proactive refresh at 75 % of token lifetime (only once per cycle)
    if (!refreshTimerRef.current) {
      const delay = refreshThresholdRef.current;
      // console.log(`[SESSION] Scheduling refresh check in ${(delay / 1000).toFixed(1)}s`);

      refreshTimerRef.current = setTimeout(function tryRefresh() {
        if (!isActiveRef.current) return; // monitoring stopped
        const sinceLast = Date.now() - lastActivityRef.current;
        // console.log(
        //   `[SESSION] Refresh check — last activity ${(sinceLast / 1000).toFixed(1)}s ago ` +
        //   `(threshold=${(refreshThresholdRef.current / 1000).toFixed(1)}s)`
        // );

        if (sinceLast < refreshThresholdRef.current) {
          // console.log("[SESSION] User was recently active → refreshing");
          refreshTokens()
            .then(() => {
              refreshTimerRef.current = setTimeout(tryRefresh, refreshThresholdRef.current);
            })
            .catch(() => {
              refreshTimerRef.current = null;
            });
        } else {
          // console.log("[SESSION] User was NOT recently active → skipping refresh");
          refreshTimerRef.current = null;
        }
      }, delay);
    }
  }, [refreshTokens, resetExpiryTimer]);

  // ── Start / stop monitoring ───────────────────────────────────────
  const startListeners = useCallback(() => {
    if (isActiveRef.current) return;
    // console.log("[SESSION] ✅ Starting session monitoring (events: mousedown, keydown, touchstart)");

    updateAccessTokenExpiry();

    // Only deliberate user interactions count as activity
    const events = ["mousedown", "keydown", "touchstart"];
    events.forEach((ev) =>
      document.addEventListener(ev, handleActivity, { passive: true })
    );

    isActiveRef.current = true;
    // Kick off initial timers (pass no event — logged as "init")
    handleActivity();
  }, [handleActivity, updateAccessTokenExpiry]);

  const stopListeners = useCallback(() => {
    if (!isActiveRef.current) return;
    // console.log("[SESSION] 🛑 Stopping session monitoring");

    // Mark inactive FIRST so any lingering callbacks bail out
    isActiveRef.current = false;

    const events = ["mousedown", "keydown", "touchstart"];
    events.forEach((ev) => document.removeEventListener(ev, handleActivity));

    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    accessExpRef.current = null;
  }, [handleActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListeners();
  }, [stopListeners]);

  // ── Context value ─────────────────────────────────────────────────
  const value = {
    startSessionMonitoring: startListeners,
    stopSessionMonitoring: stopListeners,
    refreshTokens,
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
