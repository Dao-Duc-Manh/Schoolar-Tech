import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const useProtectedRoute = (requiredRole?: string) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (requiredRole && user?.role !== requiredRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, user?.role, requiredRole, navigate]);

  return isAuthenticated && (!requiredRole || user?.role === requiredRole);
};

