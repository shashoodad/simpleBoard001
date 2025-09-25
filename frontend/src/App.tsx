import { Navigate, Route, Routes } from 'react-router-dom';

import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = false; // TODO: replace with auth state from context/provider

  if (!isAuthenticated) {
    return <Navigate to=\"/login\" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path=\"/login\" element={<LoginPage />} />
      <Route path=\"/register\" element={<RegistrationPage />} />
      <Route
        path=\"/admin\"
        element={
          <RequireAuth>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path=\"/\"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />
    </Routes>
  );
}
