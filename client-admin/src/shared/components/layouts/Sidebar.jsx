import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const allItems = [
    { label: 'Resumen', to: '/dashboard/resumen', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Restaurantes', to: '/dashboard/restaurants', roles: ['ADMIN_ROLE'] },
    { label: 'Usuarios', to: '/dashboard/users', roles: ['ADMIN_ROLE'] },
    { label: 'Reportes plataforma', to: '/dashboard/reportes-plataforma', roles: ['ADMIN_ROLE'] },
    { label: 'Menú', to: '/dashboard/menu', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Eventos', to: '/dashboard/events', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Pedidos', to: '/dashboard/orders', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Reservaciones', to: '/dashboard/reservations', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Reseñas', to: '/dashboard/reviews', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Mesas', to: '/dashboard/tables', roles: ['RES_ADMIN_ROLE'] },
    { label: 'Reportes', to: '/dashboard/reportes', roles: ['RES_ADMIN_ROLE'] },
  ];

  const items = allItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside
      className={`
        fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-56 flex flex-col p-3
        transition-transform duration-300
        lg:static lg:translate-x-0 lg:h-auto lg:min-h-[calc(100vh-3.5rem)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        background: '#111118',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Botón cerrar en móvil */}
      <button
        onClick={onClose}
        className='lg:hidden self-end mb-2 p-1.5 rounded-lg text-xs'
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
      >
        ✕ Cerrar
      </button>

      <ul className='space-y-1 mt-2'>
        {items.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition sidebar-item${active ? ' active' : ''}`}
                style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#fff';
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};