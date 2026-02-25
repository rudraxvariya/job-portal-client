import { axiosInstance } from "../config/axios";
import { AUTH_TOKEN_STORAGE_KEY } from "../constants/auth";

export { AUTH_TOKEN_STORAGE_KEY };

/** Set to true after successful login so redirect works before next request. */
let loggedInThisSession = false;

/**
 * Call this after a successful login so the user is treated as authenticated immediately.
 */
export function setLoggedInThisSession(): void {
  loggedInThisSession = true;
}

/**
 * Saves the auth token to localStorage. Call after successful login.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

/**
 * Returns the auth token from localStorage if present, otherwise null.
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Removes the auth token from localStorage. Call on logout.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

/**
 * Call this after logout to clear the token and in-session auth flag.
 */
export function clearLoggedInSession(): void {
  loggedInThisSession = false;
  clearAuthToken();
}

/**
 * Returns true if the user is considered logged in (token in localStorage or just logged in this session).
 */
export function isAuthenticated(): boolean {
  return loggedInThisSession || Boolean(getAuthToken());
}

/**
 * Asks the backend if the current request is authenticated (Authorization header is set by axios).
 * Call this on app load when getAuthToken() is false to restore session from a valid token.
 * On success, sets loggedInThisSession so the user stays logged in.
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
