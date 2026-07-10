import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

import LoadingScreen from '../components/common/LoadingScreen';
import config from '../config';

const { ROLES } = config;

// Lazy load pages
const Login = lazy(() => import('../pages/auth/LoginNew'));
const Overview  = lazy(() => import('../pages/Overview/Overview'));
const RegistrationRequests = lazy(() => import('../pages/RegistrationRequests/registrationrequests'));
const AdminAudit = lazy(() => import('../pages/admin-audit/Admin&Audit'));




const Staff = lazy(() => import('../pages/staff/Staff'));
const Alerts = lazy(() => import('../pages/alerts-public-scans/Alerts&PublicScans'));
const ProfilePage = lazy(() => import('../pages/settings/ProfilePage'));
const Settings = lazy(() => import('../pages/settings/Settings'));

const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));

const MedicineBatchManagement = lazy(() => import('../pages/medicine-batch-monitoring/Medicine&BatchMonitoring'));
const EntitiesManagement = lazy(() => import('../pages/entities-management/EntitiesManagement'));
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
        element: <Navigate to="/overview" replace />,
      },
      // ✅ Home page
      {
        path: 'overview',
        element: (
          <SuspenseWrapper>
            <Overview />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'medicine-batch-monitoring',
        element: (
          <SuspenseWrapper>
            <MedicineBatchManagement />
          </SuspenseWrapper>
        ),
      },

      {
        path: 'entities-management/*',
        element: (
          <SuspenseWrapper>
            <EntitiesManagement />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'registrationrequests',
        element: (
          <SuspenseWrapper>
            <RegistrationRequests />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin-audit',
        element: (
          <SuspenseWrapper>
            <AdminAudit />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'alerts-public-scans',
        element: (
          <SuspenseWrapper>
            <Alerts />
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
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={allRoles}>
            <SuspenseWrapper>
              <ProfilePage />
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