import {useAuth} from "@/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export function useLoginRoleNavigation() {
  const { setAuthFromTokens, tokenClaims } = useAuth();
  const navigate = useNavigate();

  return async (loginOtpResponse) => {
    const newClaims = await setAuthFromTokens({
      accessToken: loginOtpResponse.accessToken,
      refreshToken: loginOtpResponse.refreshToken,
    });

    const role = newClaims?.role || tokenClaims?.role;

    if (role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };
}