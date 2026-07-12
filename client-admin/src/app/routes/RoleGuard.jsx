import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Spinner } from '../../features/auth/components/Spinner.jsx';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

  if (isLoadingAuth) return <Spinner />;

  const hasAccess = isAuthenticated && allowedRoles.includes(user?.role);

  if (!hasAccess) return <Navigate to='/unauthorized' replace />;

  return children;
};
