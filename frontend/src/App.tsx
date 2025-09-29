import { Navigate, Route, Routes } from 'react-router-dom';

import AppShell from './components/AppShell';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BoardAccessPage from './pages/BoardAccessPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PostEditorPage from './pages/PostEditorPage';
import PostDetailPage from './pages/PostDetailPage';
import RegistrationPage from './pages/RegistrationPage';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/posts/new"
        element={
          <RequireAuth>
            <AppShell>
              <PostEditorPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AppShell>
              <AdminDashboardPage />
            </AppShell>
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/board-access"
        element={
          <RequireAdmin>
            <AppShell>
              <BoardAccessPage />
            </AppShell>
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


