import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, role, checkAuth } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated) {
    const hasValidAuth = checkAuth();
    if (!hasValidAuth) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
