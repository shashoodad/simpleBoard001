import { AuthStorage } from './auth';

export class SessionExpiredError extends Error {
  name = 'SessionExpiredError';
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = AuthStorage.getAccessToken();
  if (!token) {
    throw new SessionExpiredError('세션이 만료되었습니다.');
  }

  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    AuthStorage.clearAuth();
    throw new SessionExpiredError('세션이 만료되었습니다.');
  }

  AuthStorage.touchSession();
  return response;
}
