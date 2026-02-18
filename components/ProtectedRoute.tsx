
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to home or open auth modal (handled in App via state if needed, but here simple redirect)
    // We pass state to let the parent know why we redirected
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User authorized but wrong role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
