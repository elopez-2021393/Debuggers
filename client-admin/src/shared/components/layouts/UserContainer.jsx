import { useState } from 'react';
import { CartDrawer } from '../../../features/orders/components/CartDrawer.jsx';
import { EditProfileModal } from '../../../features/users/components/EditProfileModal.jsx';
import { updateProfile } from '../../../shared/apis/auth.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { UserNavbar } from './UserNavbar.jsx';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const UserContainer = ({ onLogout, children }) => {
    const { user, updateUser } = useAuthStore();
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async (data) => {
        setSaving(true);
        try {
            await updateProfile(data);
            updateUser(data);
            showSuccess('Perfil actualizado');
            setEditOpen(false);
            return true;
        } catch (err) {
            showError(err.response?.data?.message || 'Error al actualizar');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#111118',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
        }}>
            <UserNavbar
                onLogout={onLogout}
                onEditProfile={() => setEditOpen(true)}
            />
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'clamp(16px, 4vw, 40px) clamp(16px, 5vw, 40px)',
                minWidth: 0,
            }}>
                {children}
            </main>
            <CartDrawer />
            <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={handleSaveProfile}
                user={user}
                loading={saving}
            />
        </div>
    );
};