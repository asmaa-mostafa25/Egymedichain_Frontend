import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

import LoadingScreen from '../components/common/LoadingScreen';
import config from '../config';

const { ROLES } = config;

// Lazy load pages
const Login = lazy(() => import('../pages/auth/LoginNew'));
const HomePage = lazy(() => import('../pages/HomePage/HomePage'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Monitoring = lazy(() => import('../pages/monitoring/Monitoring'));
// const Inventory = lazy(() => import('../pages/inventory/Inventory'));
const Shipments = lazy(() => import('../pages/shipments/Shipments'));
const Approvals = lazy(() => import('../pages/approvals/Approvals'));
const Reports = lazy(() => import('../pages/reports/Reports'));
const Staff = lazy(() => import('../pages/staff/Staff'));
const ManufacturingOversight = lazy(() => import('../pages/manufacturing-oversight/ManufacturingOversight'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const AuditLogs = lazy(() => import('../pages/audit/AuditLogs'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const ImportOperations = lazy(() =>
  import('../pages/import-operations/ImportOperations')
);
const WarehouseMonitoring = lazy(() => import('../pages/warehouse-monitoring/WarehouseMonitoring'));
const PharmacyCompliance = lazy(() => import('../pages/pharmacy-compliance/PharmacyCompliance'));
const VerifyEmail = lazy(() => import('../pages/FrogetPassword/VerifyEmail'));
const ForgetPassword = lazy(() => import('../pages/FrogetPassword/ForgetPassword'));
const ResetPassword = lazy(() => import('../pages/FrogetPassword/ResetPassword'));



// Suspense wrapper
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);    




const allRoles = Object.values(ROLES);
const adminRoles = [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN];

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={allRoles}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      // ✅ Home page
      {
        path: 'home',
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'warehouse-monitoring',
        element: (
          <SuspenseWrapper>
            <WarehouseMonitoring />
          </SuspenseWrapper>
        ),
      },

      {
path: 'pharmacy-compliance',
        element: (
          <SuspenseWrapper>
            <PharmacyCompliance />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'monitoring',
        element: (
          <SuspenseWrapper>
            <Monitoring />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'manufacturing-oversight',
        element: (
          <SuspenseWrapper>
            <ManufacturingOversight />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shipments',
        element: (
          <SuspenseWrapper>
            <Shipments />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'approvals',
        element: (
          <ProtectedRoute allowedRoles={[...adminRoles, ROLES.AUDITOR]}>
            <SuspenseWrapper>
              <Approvals />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <SuspenseWrapper>
            <Reports />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <SuspenseWrapper>
              <Staff />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit',
        element: (
          <ProtectedRoute allowedRoles={[...adminRoles, ROLES.AUDITOR]}>
            <SuspenseWrapper>
              <AuditLogs />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'import-operations',
        element: (
          <ProtectedRoute allowedRoles={allRoles}>
            <SuspenseWrapper>
              <ImportOperations />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <SuspenseWrapper>
        <Unauthorized />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/forget-password',
    element: (
      <SuspenseWrapper>
        <ForgetPassword />
      </SuspenseWrapper>
    ),
  },
  
  {
    path: '/reset-password/:token',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/verify-email/:token',
    element: (
      <SuspenseWrapper>
        <VerifyEmail />
      </SuspenseWrapper>
    ),
  }
,  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;