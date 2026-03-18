import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';
import Employees from './pages/Employees';
import Providers from './pages/Providers';
import GateA from './pages/GateA';
import GateE from './pages/GateE';
import Modules from './pages/Modules';
import GestaoPatio from './pages/GestaoPatio';
import Infractions from './pages/Infractions';
import Reports from './pages/Reports';
import Users from './pages/Users';
import ResetPassword from './pages/ResetPassword';
import Support from './pages/Support';
import { ModuleProvider } from './store/ModuleContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-background-primary text-text-primary">Carregando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ModuleProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="providers" element={<Providers />} />
              <Route path="gate-a" element={<GateA />} />
              <Route path="gate-e" element={<GateE />} />
              <Route path="gestao-patio" element={<GestaoPatio />} />
              <Route path="modules" element={<Modules />} />
              <Route path="users" element={<Users />} />
              <Route path="infractions" element={<Infractions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Routes>
        </Router>
      </ModuleProvider>
    </AuthProvider>
  );
}

export default App;
