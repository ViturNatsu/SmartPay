import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axios";
import { SessionManagerProvider, useSessionManager } from "./SessionManagerContext";

const AuthContext = createContext(undefined);

const AuthProviderInner = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { startSessionMonitoring, stopSessionMonitoring } = useSessionManager();
  const navigate = useNavigate();
  const getMyUser = useCallback(async () => {
    try {
      const userData = await authApi.getMyUser();
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const setAuthFromTokens = useCallback(
    async ({ accessToken, refreshToken }) => {
      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

      if (!accessToken) {
        setUser(null);
        return;
      }

      await getMyUser();

      // Start session monitoring after successful authentication
      startSessionMonitoring();
    },
    [getMyUser, startSessionMonitoring]
  );

  const clearAuth = useCallback(() => {
    setUser(null);
    stopSessionMonitoring();
  }, [stopSessionMonitoring]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setLoading(false);
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  // check for existing session on component mount
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      try {
        const refreshToken = sessionStorage.getItem("refresh_token");

        if (!refreshToken) {
          if (!cancelled) clearAuth();
          return;
        }

        const res = await authApi.refreshTokens();

        if (!cancelled && res?.accessToken) {
          setAccessToken(res.accessToken);

          if (res.refreshToken) {
            sessionStorage.setItem("refresh_token", res.refreshToken);
          }

          await getMyUser();

          // Start session monitoring after successful bootstrap
          startSessionMonitoring();
        } else if (!cancelled) {
          clearAuth();
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearAuth, getMyUser, startSessionMonitoring]);

  const value = useMemo(
    () => ({
      user,
      loading,
      setAuthFromTokens,
      logout,
    }),
    [user, loading, setAuthFromTokens, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Wrapper that provides SessionManager context
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const handleSessionExpired = useCallback(() => {
    // Clear tokens
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");

    // Redirect to login using react-router
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <SessionManagerProvider onSessionExpired={handleSessionExpired}>
      <AuthProviderInner>{children}</AuthProviderInner>
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