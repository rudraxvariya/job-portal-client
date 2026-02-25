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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const linkClass =
    "block md:inline-block py-3 md:py-2 px-4 md:px-3 rounded-lg font-medium text-blue-600 bg-transparent hover:bg-blue-50 hover:text-blue-700 transition-colors text-left md:text-center";

  return (
    <header className="relative z-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-h-13 sm:min-h-14 px-4 sm:px-6 lg:px-8">
        <Link
          to={LOGO_LINK_PATH}
          className="flex items-center shrink-0"
          aria-label="Jobify home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src={logoUrl}
            alt="Jobify"
            className="h-8 sm:h-9 w-auto"
          />
        </Link>

        {/* Hamburger - visible on mobile only, min 44px touch target */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 touch-manipulation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="w-6 h-6 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop nav - hidden on mobile */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {links.map(({ label, path }) => (
            <Link key={path} to={path} className={linkClass}>
              {label}
            </Link>
          ))}
          {authenticated && (
            <>
              <Link to="/jobs/new" className={linkClass}>
                Create Job
              </Link>
              <Link to="/update-profile" className={linkClass}>
                Profile
              </Link>
              <button
                type="button"
                className={`navbar__link--logout ${linkClass}`}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile nav dropdown - full width below header, only when open */}
      <nav
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-2">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={linkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {authenticated && (
            <>
              <Link
                to="/jobs/new"
                className={linkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Job
              </Link>
              <Link
                to="/update-profile"
                className={linkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                type="button"
                className={`navbar__link--logout ${linkClass}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
