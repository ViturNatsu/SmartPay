import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axios";
import {
  SessionManagerProvider,
  useSessionManager,
  decodeJwtPayload,
} from "./SessionManagerContext";

const AuthContext = createContext(undefined);
let bootstrapRefreshPromise = null;

const AuthProviderInner = ({ children, clearAuthRef }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenClaims, setTokenClaims] = useState(null);

  const { startSessionMonitoring, stopSessionMonitoring } = useSessionManager();

  // ── BroadcastChannel for cross-tab logout sync ──────────────────
  const logoutChannelRef = useRef(null);

  // Keep stable refs to session monitoring functions so the bootstrap
  // useEffect doesn't need them in its dependency array (which would
  // cause it to re-run every time SessionManagerContext re-renders).
  const startSessionMonitoringRef = useRef(startSessionMonitoring);
  const stopSessionMonitoringRef = useRef(stopSessionMonitoring);
  useEffect(() => {
    startSessionMonitoringRef.current = startSessionMonitoring;
    stopSessionMonitoringRef.current = stopSessionMonitoring;
  }, [startSessionMonitoring, stopSessionMonitoring]);

  const navigate = useNavigate();

  const getMyUser = useCallback(async () => {
    // In the normal flow we call the customer endpoint.  For admins there is
    // no customer record, so avoid the 404 by only hitting the API when the
    // token claims indicate a non‑admin role.  The caller should have already
    // stored tokenClaims via setTokenClaims.
    if (tokenClaims?.role === "ADMIN") {
      // use the minimal info we know from the JWT
      setUser({
        id: tokenClaims.userId || null,
        email: tokenClaims.email || null,
        role: tokenClaims.role || null,
      });
      return;
    }

    try {
      const userData = await authApi.getMyUser();
      if (userData) {
        setUser({
          id: userData.id ?? null,
          email: userData.email ?? null,
          role: userData.role ?? null,
          firstName: userData.firstName ?? null,
          lastName: userData.lastName ?? null,
          addressLine1: userData.addressLine1 ?? null,
          addressLine2: userData.addressLine2 ?? null,
          city: userData.city ?? null,
          country: userData.country ?? null,
          dob: userData.dob ?? null,
          dobNotInFuture: userData.dobNotInFuture ?? null,
          governmentIdNumber: userData.governmentIdNumber ?? null,
          governmentIdType: userData.governmentIdType ?? null,
          occupation: userData.occupation ?? null,
          phoneNumber: userData.phoneNumber ?? null,
          postalCode: userData.postalCode ?? null,
          province: userData.province ?? null,
          socialInsuranceNumber: userData.socialInsuranceNumber ?? null,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  }, [tokenClaims]);

  // Clears local auth state only — no API call. Safe to call any time,
  // including from bootstrap failure where there's no valid token.
  const clearAuth = useCallback(() => {
    setUser(null);
    setTokenClaims(null);
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");
    stopSessionMonitoringRef.current();
  }, []); // stable — no deps that can change

  // Expose clearAuth to the outer AuthProvider via ref
  useEffect(() => {
    if (clearAuthRef) clearAuthRef.current = clearAuth;
  }, [clearAuth, clearAuthRef]);

  // Called from VerifyOtp after successful OTP verification.
  // Stores tokens, decodes claims, fetches full user profile.
  const setAuthFromTokens = useCallback(
    async ({ accessToken, refreshToken }) => {
      // try {
      //   logoutChannelRef.current?.postMessage({ type: "FORCE_LOGOUT" });
      // } catch (error) {}

      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

      if (!accessToken) {
        setUser(null);
        setTokenClaims(null);
        return;
      }

      const claims = decodeJwtPayload(accessToken);
      if (claims) {
        const extracted = {
          userId: claims.sub ?? null,
          role: claims.role ?? null,
          email: claims.email ?? null,
        };
        setTokenClaims(extracted);

        // for admin users we don't hit the customer endpoint (no record)
        if (extracted.role && extracted.role.toUpperCase() === "ADMIN") {
          setUser({
            id: extracted.userId,
            email: extracted.email,
            role: extracted.role,
          });
        } else {
          try {
            await getMyUser();
          } catch (error) {
            console.error("Failed to get user data:", error);
          }
        }

        // return the claims so callers can react immediately
        return extracted;
      } else {
        setTokenClaims(null);
      }

      startSessionMonitoringRef.current();
    },
    [getMyUser],
  );

  // User-initiated logout — calls API to invalidate server session,
  // then clears local state.
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout("USER_INITIATED");
      // Notify other tabs that this user logged out
      try {
        logoutChannelRef.current?.postMessage({ type: "LOGOUT" });
      } catch (_bc) {
        // BroadcastChannel may be closed or unavailable — ignore
      }
    } catch (_) {
      // Server-side invalidation failed — still clear local state
    } finally {
      clearAuth();
      setLoading(false);
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  // Runs once on mount to restore session from a stored refresh token.
  // Empty dep array is intentional — bootstrap should only run once.
  // Functions are accessed via refs to avoid stale closure issues.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = sessionStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No token — not logged in, just stop showing the loading state
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        if (!bootstrapRefreshPromise) {
          bootstrapRefreshPromise = authApi.refreshTokens().finally(() => {
            bootstrapRefreshPromise = null;
          });
        }

        const res = await bootstrapRefreshPromise;

        if (cancelled) return;

        if (res?.accessToken) {
          setAccessToken(res.accessToken);

          if (res.refreshToken) {
            sessionStorage.setItem("refresh_token", res.refreshToken);
          }

          const claims = decodeJwtPayload(res.accessToken);
          if (claims) {
            const extracted = {
              userId: claims.sub ?? null,
              role: claims.role ?? null,
              email: claims.email ?? null,
            };
            setTokenClaims(extracted);

            if (extracted.role && extracted.role.toUpperCase() === "ADMIN") {
              setUser({
                id: extracted.userId,
                email: extracted.email,
                role: extracted.role,
              });
            } else {
              await getMyUser();
            }
          } else {
            setTokenClaims(null);
          }

          startSessionMonitoringRef.current();
        } else {
          clearAuth();
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Bootstrap refresh failed:", err);

          // Only clear auth if there is truly no refresh token left
          const stillHasRefreshToken = sessionStorage.getItem("refresh_token");

          if (!stillHasRefreshToken) {
            clearAuth();
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── BroadcastChannel setup ──────────────────────────────────────
  // Listens for logout events from other tabs. When received, clears
  // local auth state and redirects to login. This does NOT fire in the
  // tab that initiated the logout — BroadcastChannel only delivers to
  // *other* contexts.
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel("smartpay_auth");
      logoutChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msgType = event.data?.type;
        if (
          msgType === "LOGOUT" ||
          msgType === "SESSION_EXPIRED" ||
          msgType === "FORCE_LOGOUT"
        ) {
          clearAuth();
          // Use the appropriate reason so the Login page shows the right message
          const reason =
            msgType === "SESSION_EXPIRED"
              ? "inactivity"
              : msgType === "FORCE_LOGOUT"
                ? "session_replaced"
                : "session_invalidated";

          sessionStorage.setItem("signoutReason", reason);
          navigate("/login", { replace: true });
        }
      };
    } catch (_) {
      // BroadcastChannel not supported — cross-tab sync won't work,
      // but single-tab logout still functions normally.
    }

    return () => {
      try {
        channel?.close();
      } catch (_) {
        /* ignore */
      }
      logoutChannelRef.current = null;
    };
  }, [clearAuth, navigate]);

  const value = useMemo(
    () => ({
      user,
      tokenClaims,
      loading,
      setAuthFromTokens,
      getMyUser,
      logout,
    }),
    [user, tokenClaims, loading, getMyUser, setAuthFromTokens, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const clearAuthRef = useRef(null);

  // BroadcastChannel for notifying other tabs about session expiry
  const sessionChannelRef = useRef(null);

  useEffect(() => {
    try {
      sessionChannelRef.current = new BroadcastChannel("smartpay_auth");
    } catch (_) {
      /* not supported */
    }
    return () => {
      try {
        sessionChannelRef.current?.close();
      } catch (_) {
        /* ignore */
      }
      sessionChannelRef.current = null;
    };
  }, []);

  const handleSessionExpired = useCallback(() => {
    // console.log("[SESSION] 🔴 handleSessionExpired called — clearing auth and navigating to /login");

    // Revoke the backend session BEFORE clearing local tokens.
    // authApi.logout() reads the refresh token from sessionStorage,
    // so it must run before clearAuth removes it.
    authApi.logout("INACTIVITY").catch(() => {
      // Fire-and-forget: local cleanup happens regardless
    });

    // Notify other tabs about the session expiry
    try {
      sessionChannelRef.current?.postMessage({ type: "SESSION_EXPIRED" });
    } catch (_) {
      /* ignore */
    }

    // Don't redirect if user is already on a public page (e.g., /verify while
    // fetching OTP from MailHog). The old session cleanup is still needed, but
    // redirecting would interrupt the new login flow.
    const currentPath = window.location.pathname;
    const publicPages = [
      "/login",
      "/verify",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];
    const onPublicPage = publicPages.some((p) => currentPath.startsWith(p));

    // Set signoutReason BEFORE clearAuth — clearAuth triggers ProtectedRoute
    // to redirect, which mounts Login synchronously.  Login's useState
    // initializer reads signoutReason at mount time, so it must already be set.
    if (!onPublicPage) {
      sessionStorage.setItem("signoutReason", "inactivity");
    }

    // Full cleanup: clears user, tokenClaims, tokens, and stops monitoring
    // so ProtectedRoute redirects even on browser back-button
    if (clearAuthRef.current) {
      clearAuthRef.current();
    } else {
      // Fallback if ref not yet set (shouldn't happen in practice)
      clearAccessToken();
      sessionStorage.removeItem("refresh_token");
    }

    if (!onPublicPage) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <SessionManagerProvider onSessionExpired={handleSessionExpired}>
      <AuthProviderInner clearAuthRef={clearAuthRef}>
        {children}
      </AuthProviderInner>
    </SessionManagerProvider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
