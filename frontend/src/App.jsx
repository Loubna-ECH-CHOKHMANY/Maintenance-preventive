import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import MachinesPage     from './pages/MachinesPage';
import PointsPage       from './pages/PointsPage';
import InterventionsPage from './pages/InterventionsPage';
import PlanningPage     from './pages/PlanningPage';
import TechniciensPage  from './pages/TechniciensPage';
import PannesPage       from './pages/PannesPage';
import StockPage        from './pages/StockPage';
import KpiPage          from './pages/KpiPage';
import ReportsPage      from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import QRCodePage       from './pages/QRCodePage';
import AuditPage        from './pages/AuditPage';

function AuthGuard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleGuard({ roles, fallback = '/interventions', children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Don't show 403 - redirect to a page they can access
    return <Navigate to={fallback} replace />;
  }
  return children;
}

// Smart home redirect based on role
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (['ADMIN', 'RESPONSABLE_MAINTENANCE'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/interventions" replace />;
}

const ADMIN_RESP = ['ADMIN', 'RESPONSABLE_MAINTENANCE'];
const ADMIN_ONLY = ['ADMIN'];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index element={<HomeRedirect />} />
            <Route path="dashboard"     element={<RoleGuard roles={ADMIN_RESP} fallback="/interventions"><DashboardPage /></RoleGuard>} />
            <Route path="machines"      element={<RoleGuard roles={['ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE']} fallback="/interventions"><MachinesPage /></RoleGuard>} />
            <Route path="points"        element={<RoleGuard roles={ADMIN_RESP} fallback="/interventions"><PointsPage /></RoleGuard>} />
            <Route path="interventions" element={<InterventionsPage />} />
            <Route path="planning"      element={<PlanningPage />} />
            <Route path="pannes"        element={<PannesPage />} />
            <Route path="stock"         element={<StockPage />} />
            <Route path="kpi"           element={<RoleGuard roles={ADMIN_RESP} fallback="/interventions"><KpiPage /></RoleGuard>} />
            <Route path="rapports"      element={<RoleGuard roles={ADMIN_RESP} fallback="/interventions"><ReportsPage /></RoleGuard>} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="qrcode"        element={<QRCodePage />} />
            <Route path="audit"         element={<RoleGuard roles={ADMIN_ONLY} fallback="/interventions"><AuditPage /></RoleGuard>} />
            <Route path="techniciens"   element={<RoleGuard roles={ADMIN_ONLY} fallback="/interventions"><TechniciensPage /></RoleGuard>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
