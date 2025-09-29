const SESSION_DURATION_MS = 3 * 60 * 60 * 1000;

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_EXPIRES_KEY = 'sessionExpiresAt';
const USER_ROLE_KEY = 'userRole';
const USER_EMAIL_KEY = 'userEmail';
const LOGOUT_MESSAGE_KEY = 'logoutMessage';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  touchSession();
}

export function setUserContext(role?: string | null, email?: string | null): void {
  if (typeof window === 'undefined') return;
  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
  }
  if (email) {
    localStorage.setItem(USER_EMAIL_KEY, email);
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(SESSION_EXPIRES_KEY);
}

export function touchSession(): void {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
}

export function getSessionExpiry(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_EXPIRES_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setLogoutMessage(message: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LOGOUT_MESSAGE_KEY, message);
}

export function consumeLogoutMessage(): string | null {
  if (typeof window === 'undefined') return null;
  const message = sessionStorage.getItem(LOGOUT_MESSAGE_KEY);
  if (message) {
    sessionStorage.removeItem(LOGOUT_MESSAGE_KEY);
  }
  return message;
}

export const AuthStorage = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuth,
  touchSession,
  getSessionExpiry,
  setUserContext,
  setLogoutMessage,
  consumeLogoutMessage,
};
