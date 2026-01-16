import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";
import * as authApi from "../api/authApi";
import type { AuthUser, LoginRequest } from "../types/Auth";

//by calling the useAuth hook these values and functions become accessible anywhere in the application
interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    login: (payload: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    //use authApi to make axios calls to the server and use AuthProvider to process the response
    const login = useCallback(async (payload: LoginRequest) => {

    }, []);

    const logout = useCallback(async () => {

    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: /*current user*/ null,
            loading,
            login,
            logout,
        }),
        [loading, login, logout,]
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
