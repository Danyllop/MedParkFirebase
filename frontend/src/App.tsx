import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ModuleProvider } from './store/ModuleContext';

// Layout and static components
import Layout from './components/Layout';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Employees = lazy(() => import('./pages/Employees'));
const Providers = lazy(() => import('./pages/Providers'));
const GateA = lazy(() => import('./pages/GateA'));
const GateE = lazy(() => import('./pages/GateE'));
const Modules = lazy(() => import('./pages/Modules'));
const GestaoPatio = lazy(() => import('./pages/GestaoPatio'));
const Infractions = lazy(() => import('./pages/Infractions'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Support = lazy(() => import('./pages/Support'));

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background-primary text-text-primary">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      <p className="text-sm font-medium">Carregando...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingFallback />;

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
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </Router>
      </ModuleProvider>
    </AuthProvider>
  );
}

export default App;
