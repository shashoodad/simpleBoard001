import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../config';
import { useSessionWatcher } from '../hooks/useSessionWatcher';
import { AuthStorage } from '../lib/auth';
import { authFetch, SessionExpiredError } from '../lib/authFetch';
import type { BoardSummary } from '../types/board';

interface NavItem {
  to: string;
  label: string;
  requireAdmin?: boolean;
}

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '게시판' },
  { to: '/posts/new', label: '글쓰기' },
  { to: '/admin', label: '관리자 대시보드', requireAdmin: true },
  { to: '/admin/board-access', label: '권한 관리', requireAdmin: true },
];

function HeaderNav() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isBoardsOpen, setIsBoardsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromStorage = () => {
      setRole(localStorage.getItem('userRole'));
      setEmail(localStorage.getItem('userEmail'));
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/boards`);
        if (!response.ok) {
          return;
        }
        const data: BoardSummary[] = await response.json();
        setBoards(data);
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
          navigate('/login', { replace: true });
        }
      }
    };

    fetchBoards();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    AuthStorage.clearAuth();
    AuthStorage.setLogoutMessage('로그아웃 되었습니다.');
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleBoardSelect = useCallback(
    (boardId: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedBoardId', String(boardId));
      }
      navigate(`/boards/${boardId}`);
      setIsBoardsOpen(false);
    },
    [navigate]
  );

  const isAdmin = role === 'admin';
  const visibleItems = NAV_ITEMS.filter((item) => (item.requireAdmin ? isAdmin : true));

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          <div className="app-logo">심플보드 프로젝트</div>
          <nav className="app-nav">
            {visibleItems.map((item) => {
              if (item.to === '/') {
                return (
                  <div
                    key={item.to}
                    className={isBoardsOpen ? 'nav-item open' : 'nav-item'}
                    onMouseEnter={() => setIsBoardsOpen(true)}
                    onMouseLeave={() => setIsBoardsOpen(false)}
                  >
                    <NavLink to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                      {item.label}
                    </NavLink>
                    <div className="nav-dropdown">
                      {boards.length === 0 ? (
                        <span className="nav-dropdown__empty">게시판이 없습니다</span>
                      ) : (
                        boards.map((board) => (
                          <button
                            type="button"
                            key={board.id}
                            className="nav-dropdown__item"
                            onClick={() => handleBoardSelect(board.id)}
                          >
                            {board.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="app-header__right">
          {email ? <span className="user-email">{email}</span> : null}
          <button type="button" className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: AppShellProps) {
  useSessionWatcher();

  return (
    <div className="app-shell">
      <HeaderNav />
      <main className="app-content">{children}</main>
    </div>
  );
}
