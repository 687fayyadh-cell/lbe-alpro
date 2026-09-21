// SinergiITS auth token storage (G0 decision: localStorage MVP).
// Single place allowed to touch the JWT. Components must use useAuth,
// never localStorage directly.
// Risk: localStorage is readable by any JS on this origin, so an XSS flaw
// leaks the token. Mitigations for later units: strict CSP, no inline
// scripts, short JWT expiry, consider httpOnly cookies.

const TOKEN_KEY = "sinergiits_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}
