import { axiosInstance } from "../config/axios";

/**
 * Cookie name where the auth token is stored (set by the backend on login).
 * Change this if your API uses a different cookie name.
 */
export const AUTH_TOKEN_COOKIE = "token";

/** Set to true after successful login so redirect to home works (e.g. when token is httpOnly). */
let loggedInThisSession = false;

/**
 * Call this after a successful login so the user is treated as authenticated
 * until the next full page load (when cookie will be sent by the browser).
 */
export function setLoggedInThisSession(): void {
  loggedInThisSession = true;
}

/**
 * Call this after logout to clear the in-session auth flag.
 */
export function clearLoggedInSession(): void {
  loggedInThisSession = false;
}

/**
 * Reads a cookie value by name.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2].trim() : null;
}

/**
 * Returns the auth token from cookies if present, otherwise null.
 * Note: httpOnly cookies are not visible to JS; use verifyAuth() to detect session after refresh.
 */
export function getAuthToken(): string | null {
  return getCookie(AUTH_TOKEN_COOKIE);
}

/**
 * Returns true if the user is considered logged in (token in cookies or just logged in this session).
 */
export function isAuthenticated(): boolean {
  return loggedInThisSession || Boolean(getAuthToken());
}

/**
 * Asks the backend if the current request is authenticated (cookie is sent automatically).
 * Call this on app load when getAuthToken() is false (e.g. token is httpOnly).
 * On success, sets loggedInThisSession so the user stays logged in after refresh.
 */
export async function verifyAuth(): Promise<boolean> {
  try {
    await axiosInstance.get("/users/current-user");
    setLoggedInThisSession();
    return true;
  } catch {
    return false;
  }
}
