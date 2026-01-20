import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start true to check session


  // Login using cookie-based auth
  const login = useCallback(async (payload) => {
    setLoading(true);
    
  }, []);

  // Logout by clearing server cookie
  const logout = useCallback(async () => {
    setLoading(true);
    
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
