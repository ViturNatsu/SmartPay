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
import { SessionManagerProvider, useSessionManager, decodeJwtPayload } from "./SessionManagerContext";

const AuthContext = createContext(undefined);

const AuthProviderInner = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Minimal identity derived from access token (non-authoritative)
  const [tokenClaims, setTokenClaims] = useState(null);
  const { startSessionMonitoring, stopSessionMonitoring } = useSessionManager();
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

  const setAuthFromTokens = useCallback(
    async ({ accessToken, refreshToken }) => {
      if (accessToken) {
        setAccessToken(accessToken);
      }
      if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

      if (!accessToken) {
        setUser(null);
        setTokenClaims(null);
        return;
      }

      // Store minimal identity from token while we fetch full profile
      const claims = decodeJwtPayload(accessToken);
      if (claims) {
<<<<<<< HEAD
=======
        setUser((prev) => ({
          ...(prev || {}),
          id: claims.sub ?? null,
          email: claims.email ?? null,
          role: claims.role ?? null,
        }));
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
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
        // Don't clear auth just because getMyUser failed - user is still authenticated
      }

      // Disabled for now Start session monitoring after successful authentication
      startSessionMonitoring();
    },
    [getMyUser, startSessionMonitoring]
  );

  const clearAuth = useCallback(async() => {
    setUser(null);
    setTokenClaims(null);
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");
    await authApi.logout();
    stopSessionMonitoring();
  }, [stopSessionMonitoring]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      clearAuth();
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
<<<<<<< HEAD
        console.log("refreshed tokens")
=======
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
        if (!cancelled && res?.accessToken) {
          setAccessToken(res.accessToken);

          if (res.refreshToken) {
            sessionStorage.setItem("refresh_token", res.refreshToken);
          }

          // Update minimal identity from refreshed access token
          const claims = decodeJwtPayload(res.accessToken);
          if (claims) {
<<<<<<< HEAD
=======
            setUser((prev) => ({
              ...(prev || {}),
              id: claims.sub ?? null,
              email: claims.email ?? null,
              role: claims.role ?? null,
            }));
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
            setTokenClaims({
              userId: claims.sub ?? null,
              role: claims.role ?? null,
              email: claims.email ?? null,
            });
          } else {
            setTokenClaims(null);
          }

          await getMyUser();

          // Disabled for now. Start session monitoring after successful bootstrap
          startSessionMonitoring();
        } else if (!cancelled) {
          clearAuth();
        }
      } catch (err){
        if(err.status!=401)clearAuth();
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

// Wrapper that provides SessionManager context
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const handleSessionExpired = useCallback(() => {
    // Clear tokens
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");

    // Redirect to login using react-router
    navigate("/login", { replace: true, state: { signoutReason: "inactivity" } });
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
