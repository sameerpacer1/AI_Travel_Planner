import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
