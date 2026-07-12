import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { useUIStore } from '../../auth/store/uiStore.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { formatDate } from '../../../shared/utils/formatters.js';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';

const PAGE_SIZE = 8;

const ROLE_STYLES = {
  ADMIN_ROLE: { bg: 'rgba(242,80,156,0.15)', color: '#F2509C', label: 'Admin' },
  RES_ADMIN_ROLE: { bg: 'rgba(147,98,217,0.15)', color: '#a78bfa', label: 'Admin Restaurante' },
  USER_ROLE: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', label: 'Usuario' },
};

export const Users = () => {
  const { users, loading, error, getAllUsers, toggleUserStatus, deleteUser } =
    useUserManagementStore();
  const createUser = useAuthStore((state) => state.createUser);
  const authLoading = useAuthStore((state) => state.loading);
  const { openConfirm } = useUIStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const { restaurants, getRestaurants } = useRestaurantStore(); //Para asignar res-admin

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    getRestaurants();
  }, []);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.surname || ''}`.trim().toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || username.includes(q) || email.includes(q);
      const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleToggleStatus = (user) => {
    openConfirm({
      title: user.isActive ? 'Desactivar usuario' : 'Activar usuario',
      message: `¿${user.isActive ? 'Desactivar' : 'Activar'} a "${user.username}"?`,
      onConfirm: async () => {
        const res = await toggleUserStatus(user._id);
        if (res.success)
          showSuccess(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
        else showError('Error al cambiar estado del usuario');
      },
    });
  };

  const handleDelete = (user) => {
    const assignedRestaurant = restaurants.find(
      (r) => r.assignedAdmin === user._id || r.assignedAdmin?._id === user._id
    );
    const hasRestaurant = user.role === 'RES_ADMIN_ROLE' && assignedRestaurant;

    openConfirm({
      title: 'Eliminar usuario',
      message: hasRestaurant
        ? `"${user.username}" administra "${assignedRestaurant.name}". Al eliminarlo, ese restaurante quedará sin administrador. ¿Deseas continuar?`
        : `¿Eliminar a "${user.username}" permanentemente? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        const res = await deleteUser(user._id);
        if (res.success) {
          showSuccess('Usuario eliminado correctamente');
          if (hasRestaurant) getRestaurants();
        } else {
          showError('Error al eliminar el usuario');
        }
      },
    });
  };

  const handleCreate = async (payload) => {
    const res = await createUser(payload);
    if (res.success) {
      showSuccess('Usuario creado. Se envió correo de activación.');
      await getAllUsers({ force: true });
      return true;
    }
    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Usuarios</h1>
          <p className='text-sm mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
            Listado de usuarios registrados
          </p>
        </div>
        <button
          className='dbe-btn-primary px-4 py-2 rounded-lg text-sm font-semibold'
          onClick={() => setOpenCreateModal(true)}
        >
          + Nuevo usuario
        </button>
      </div>

      <div
        className='rounded-xl p-4 mb-4'
        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre, usuario o correo...'
            className='md:col-span-2 w-full px-3 py-2 rounded-lg text-sm outline-none'
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-3 py-2 rounded-lg text-sm outline-none'
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value='ALL' style={{ background: '#1a1a2e' }}>
              Todos los roles
            </option>
            <option value='ADMIN_ROLE' style={{ background: '#1a1a2e' }}>
              ADMIN_ROLE
            </option>
            <option value='RES_ADMIN_ROLE' style={{ background: '#1a1a2e' }}>
              RES_ADMIN_ROLE
            </option>
            <option value='USER_ROLE' style={{ background: '#1a1a2e' }}>
              USER_ROLE
            </option>
          </select>
        </div>
      </div>

      <div
        className='rounded-xl overflow-hidden'
        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th
                  className='text-left px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Usuario
                </th>
                <th
                  className='text-left px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Correo
                </th>
                <th
                  className='text-left px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Rol
                </th>
                <th
                  className='text-left px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Estado
                </th>
                <th
                  className='text-left px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Creado
                </th>
                <th
                  className='text-right px-4 py-3 text-xs font-semibold'
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-10 text-center text-sm'
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.USER_ROLE;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className='px-4 py-3'>
                        <p className='font-semibold text-white text-sm'>@{u.username}</p>
                        <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {[u.firstName, u.surname].filter(Boolean).join(' ') || '—'}
                        </p>
                      </td>
                      <td className='px-4 py-3 text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {u.email}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className='px-2 py-0.5 rounded-full text-xs font-semibold'
                          style={{ background: roleStyle.bg, color: roleStyle.color }}
                        >
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className='px-2 py-0.5 rounded-full text-xs font-semibold'
                          style={
                            u.isActive
                              ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                              : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                          }
                        >
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {u.createdAt ? formatDate(u.createdAt) : '—'}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex gap-2 justify-end'>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className='px-3 py-1 rounded-lg text-xs font-medium transition'
                            style={
                              u.isActive
                                ? {
                                  background: 'rgba(234,179,8,0.1)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(234,179,8,0.2)',
                                }
                                : {
                                  background: 'rgba(34,197,94,0.1)',
                                  color: '#4ade80',
                                  border: '1px solid rgba(34,197,94,0.2)',
                                }
                            }
                          >
                            {u.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className='px-3 py-1 rounded-lg text-xs font-medium transition'
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.2)',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          className='flex items-center justify-between px-4 py-3'
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>
            Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
            {' - '}
            {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
          </p>
          <div className='flex gap-2 items-center'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-30'
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
              Anterior
            </button>
            <span className='text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-30'
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={authLoading}
        restaurants={restaurants}
      />
    </div>
  );
};
