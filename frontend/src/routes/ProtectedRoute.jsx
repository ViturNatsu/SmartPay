import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ requiredRole }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) return null;

  // not logged in -> send to login page
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // if a role was requested, check it
  if (requiredRole) {
    if (!user.role) {
      // user doesn't have a role at all – send to forbidden page
      return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }
    // normalize to upper case since backend uses uppercase strings
    const hasRole = user.role.toUpperCase() === requiredRole.toUpperCase();
    if (!hasRole) {
      // not the right role – send to forbidden page
      return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
