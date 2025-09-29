import { NavLink } from 'react-router-dom';

import { useSessionWatcher } from '../hooks/useSessionWatcher';

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
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const isAdmin = role === 'admin';

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-logo">SimpleBoard001</div>
        <nav className="app-nav">
          {NAV_ITEMS.filter((item) => (item.requireAdmin ? isAdmin : true)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
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
