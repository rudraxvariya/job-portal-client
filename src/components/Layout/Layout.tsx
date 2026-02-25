import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getAuthToken, verifyAuth } from "../../lib/auth";
import { Navbar } from "../Navbar";
import "./Layout.css";

/**
 * App layout: navbar + main content. On load, verifies auth when token isn't readable (e.g. httpOnly)
 * so the user stays logged in after refresh.
 */
export function Layout() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      setAuthChecked(true);
      return;
    }
    verifyAuth().finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="layout layout--loading">
        <div className="layout__spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="layout min-h-screen flex flex-col">
      <Navbar />
      <main className="layout__main flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
