import { useNavigate } from "react-router-dom";

// currently, after registering, the user is simply sent back to the login page instead of signing them in automatically.
// if this behavior is to be changed in the future, please update this file to do so.
export function useRegisterNavigation() {
  const navigate = useNavigate();

  return () => {
    navigate("/login", { replace: true });
  };
}