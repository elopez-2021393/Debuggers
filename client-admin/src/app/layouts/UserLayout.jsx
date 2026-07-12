import { useAuthStore } from '../../features/auth/store/authStore.js';
import { UserContainer } from '../../shared/components/layouts/UserContainer.jsx';
import { Outlet } from 'react-router-dom';

export const UserLayout = () => {
    const { logout } = useAuthStore();
    return (
        <UserContainer onLogout={logout}>
            <Outlet />
        </UserContainer>
    );
};