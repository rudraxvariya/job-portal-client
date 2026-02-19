import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../lib/auth";

/**
 * Renders the child route only if the user has a token in cookies.
 * Otherwise redirects to /login.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
