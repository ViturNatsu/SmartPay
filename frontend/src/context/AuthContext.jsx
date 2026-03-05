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
import { SessionManagerProvider, useSessionManager, decodeJwtPayload } from "./SessionManagerContext";

const AuthContext = createContext(undefined);

const AuthProviderInner = ({ children, clearAuthRef }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenClaims, setTokenClaims] = useState(null);

  const { startSessionMonitoring, stopSessionMonitoring } = useSessionManager();

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
  }, []);

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

      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

      if (!accessToken) {
        setUser(null);
        setTokenClaims(null);
        return;
      }

      const claims = decodeJwtPayload(accessToken);
      if (claims) {
        setTokenClaims({
          userId: claims.sub ?? null,
          role: claims.role ?? null,
          email: claims.email ?? null,
        });
      } else {
        setTokenClaims(null);
      }

      try {
        await getMyUser();
      } catch (error) {
        console.error("Failed to get user data:", error);
      }

      startSessionMonitoringRef.current();
    },
    [getMyUser]
  );

  // User-initiated logout — calls API to invalidate server session,
  // then clears local state.
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
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
        const res = await authApi.refreshTokens();

        if (cancelled) return;

        if (res?.accessToken) {
          setAccessToken(res.accessToken);

          if (res.refreshToken) {
            sessionStorage.setItem("refresh_token", res.refreshToken);
          }

          const claims = decodeJwtPayload(res.accessToken);
          if (claims) {
            setTokenClaims({
              userId: claims.sub ?? null,
              role: claims.role ?? null,
              email: claims.email ?? null,
            });
          } else {
            setTokenClaims(null);
          }

          await getMyUser();
          startSessionMonitoringRef.current();
        } else {
          clearAuth();
        }
      } catch (err) {
        if (!cancelled) {
          // Token is expired or invalid — clear it so we don't loop
          sessionStorage.removeItem("refresh_token");
          clearAuth();
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

  const value = useMemo(
    () => ({
      user,
      tokenClaims,
      loading,
      setAuthFromTokens,
      getMyUser,
      logout,
    }),
    [user, tokenClaims, loading, getMyUser, setAuthFromTokens, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const clearAuthRef = useRef(null);

  const handleSessionExpired = useCallback(() => {
    console.log("[SESSION] 🔴 handleSessionExpired called — clearing auth and navigating to /login");
    // Full cleanup: clears user, tokenClaims, tokens, and stops monitoring
    // so ProtectedRoute redirects even on browser back-button
    if (clearAuthRef.current) {
      clearAuthRef.current();
    } else {
      // Fallback if ref not yet set (shouldn't happen in practice)
      clearAccessToken();
      sessionStorage.removeItem("refresh_token");
    }

    // Don't redirect if user is already on a public page (e.g., /verify while
    // fetching OTP from MailHog). The old session cleanup is still needed, but
    // redirecting would interrupt the new login flow.
    const currentPath = window.location.pathname;
    const publicPages = ["/login", "/verify", "/register", "/forgot-password", "/reset-password", "/verify-email"];
    if (publicPages.some((p) => currentPath.startsWith(p))) {
      console.log(`[SESSION] On public page ${currentPath} — skipping redirect`);
      return;
    }

    // Use sessionStorage to signal the reason — router state gets overwritten
    // by ProtectedRoute's <Navigate> which fires in the same render cycle.
    sessionStorage.setItem("signoutReason", "inactivity");
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <SessionManagerProvider onSessionExpired={handleSessionExpired}>
      <AuthProviderInner clearAuthRef={clearAuthRef}>{children}</AuthProviderInner>
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