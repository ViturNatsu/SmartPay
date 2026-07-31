import { useNavigate } from "react-router-dom";

export function useResetPasswordNavigation() {
  const navigate = useNavigate();

  return (email, code) => {
    navigate(
      `/reset-password?email=${encodeURIComponent(email)}&code=${code}`,
      { replace: true }
    );
  };
}