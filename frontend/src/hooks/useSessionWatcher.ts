import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { AuthStorage } from '../lib/auth';

const ACTIVITY_EVENTS: (keyof DocumentEventMap | keyof WindowEventMap)[] = [
  'click',
  'keydown',
  'mousemove',
  'scroll',
  'touchstart',
];

export function useSessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleActivity = () => {
      if (AuthStorage.getAccessToken()) {
        AuthStorage.touchSession();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && AuthStorage.getAccessToken()) {
        AuthStorage.touchSession();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity));
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const expiresAt = AuthStorage.getSessionExpiry();
      if (!expiresAt) return;
      if (Date.now() >= expiresAt) {
        AuthStorage.clearAuth();
        AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      }
    }, 30 * 1000);

    return () => clearInterval(timer);
  }, [navigate, location]);
}
