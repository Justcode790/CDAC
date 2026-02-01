/**
 * SUVIDHA 2026 - Protected Route Component
 * 
 * Protects routes that require authentication
 * Redirects to appropriate login page based on role
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROLES } from '../utils/constants';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to landing
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  // If role-based access is specified, check user role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user's role
    if (user?.role === ROLES.PUBLIC) {
      return <Navigate to={ROUTES.CITIZEN_DASHBOARD} replace />;
    } else if (user?.role === ROLES.OFFICER) {
      return <Navigate to={ROUTES.OFFICER_DASHBOARD} replace />;
    } else if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return children;
};

export default ProtectedRoute;
