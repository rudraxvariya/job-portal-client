import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, clearLoggedInSession } from "../../lib/auth";
import { axiosInstance } from "../../config/axios";
import { NAV_LINKS, LOGO_LINK_PATH } from "./navConfig";
import logoUrl from "../../assets/jobify.PNG";
import "./Navbar.css";

const GUEST_ONLY_PATHS = ["/login", "/signup"];

export function Navbar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const authenticated = isAuthenticated();
  const links = authenticated
    ? NAV_LINKS.filter(({ path }) => !GUEST_ONLY_PATHS.includes(path))
    : NAV_LINKS;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.get("/auth/logout");
    } finally {
      clearLoggedInSession();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link
          to={LOGO_LINK_PATH}
          className="navbar__logo-link"
          aria-label="Jobify home"
        >
          <img src={logoUrl} alt="Jobify" className="navbar__logo" />
        </Link>
        <nav className="navbar__nav">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className="navbar__link navbar__link--primary"
            >
              {label}
            </Link>
          ))}
          {authenticated && (
            <>
              <Link
                to="/jobs/new"
                className="navbar__link navbar__link--primary"
              >
                Create Job
              </Link>
              <Link
                to="/update-profile"
                className="navbar__link navbar__link--primary"
              >
                Profile
              </Link>
              <button
                type="button"
                className="navbar__link navbar__link--primary navbar__link--logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
