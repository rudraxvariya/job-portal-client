import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../lib/auth";

/**
 * Renders the child route only when there is no token (guest).
 * If token is present, redirects to home.
 */
export function GuestRoute() {
  const authenticated = isAuthenticated();

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
