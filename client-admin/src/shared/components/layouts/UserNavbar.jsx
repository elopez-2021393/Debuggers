import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { useCart } from '../../../features/orders/hooks/useCart.js';

const NAV_ITEMS = [
    { label: 'Inicio', path: '/home' },
    { label: 'Restaurantes', path: '/home/restaurantes' },
    { label: 'Eventos', path: '/home/eventos' },
    { label: 'Mis Reservaciones', path: '/home/reservaciones' },
    { label: 'Mis Órdenes', path: '/home/ordenes' },
    { label: 'Mis Reseñas', path: '/home/resenas' },
];

const MENU_ACTIONS = [
    {
        label: 'Editar perfil',
        colorVar: 'rgba(255,255,255,0.6)',
        hoverBg: 'rgba(255,255,255,0.05)',
        action: 'edit',
    },
    {
        label: 'Cerrar sesión',
        colorVar: 'var(--dbe-pink)',
        hoverBg: 'rgba(242,80,156,0.1)',
        action: 'logout',
    },
];

const MenuBtn = ({ children, onClick, color, hoverBg }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block w-full text-left rounded-[9px] text-[13px] font-semibold border-none cursor-pointer transition-all"
            style={{ padding: '9px 12px', color, background: hovered ? hoverBg : 'transparent' }}
        >
            {children}
        </button>
    );
};

const CartButton = ({ itemCount, onClick }) => {
    const hasItems = itemCount > 0;
    return (
        <button
            onClick={onClick}
            aria-label={`Carrito, ${itemCount} platillo${itemCount !== 1 ? 's' : ''}`}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all"
            style={{
                border: '1px solid rgba(242,80,156,0.3)',
                background: hasItems ? 'rgba(242,80,156,0.12)' : 'rgba(242,80,156,0.08)',
                color: 'var(--dbe-pink)',
            }}
        >
            Carrito
            {hasItems && (
                <span
                    className="flex items-center justify-center rounded-full text-[10px] font-bold text-white min-w-[18px] h-[18px] px-1"
                    style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
                >
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </button>
    );
};

const AvatarMenu = ({ initials, user, onEditProfile, onLogout }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('[data-avatar-menu]')) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAction = (action) => {
        setOpen(false);
        if (action === 'edit') onEditProfile?.();
        if (action === 'logout') onLogout?.();
    };

    return (
        <div data-avatar-menu style={{ position: 'relative' }}>
            <div
                onClick={() => setOpen((p) => !p)}
                title={user?.username}
                className="flex items-center justify-center rounded-full text-[13px] font-bold cursor-pointer transition-all"
                style={{
                    width: 34,
                    height: 34,
                    background: 'var(--dbe-gradient)',
                    border: open ? '2px solid rgba(242,80,156,0.6)' : '2px solid transparent',
                }}
            >
                {initials}
            </div>

            {open && (
                <div
                    className="animate-fadeIn absolute right-0 overflow-hidden"
                    style={{
                        top: 'calc(100% + 8px)',
                        width: 200,
                        borderRadius: 14,
                        background: '#16161f',
                        border: '1px solid rgba(242,80,156,0.15)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                        zIndex: 200,
                    }}
                >
                    <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="font-bold text-[13px] text-white m-0">
                            {user?.firstName} {user?.surname}
                        </p>
                        <p className="text-[11px] mt-0.5 m-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            @{user?.username}
                        </p>
                        <span
                            className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(242,80,156,0.15)', color: 'var(--dbe-pink)' }}
                        >
                            Usuario
                        </span>
                    </div>
                    <div className="p-1.5">
                        {MENU_ACTIONS.map(({ label, colorVar, hoverBg, action }) => (
                            <MenuBtn
                                key={action}
                                onClick={() => handleAction(action)}
                                color={colorVar}
                                hoverBg={hoverBg}
                            >
                                {label}
                            </MenuBtn>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const UserNavbar = ({ onEditProfile, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const { toggleCart, itemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()
        : 'U';

    const isActive = (path) => {
        if (path === '/home') return location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav
            className="sticky top-0 z-50"
            style={{ background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
            {/* Barra principal */}
            <div className="flex items-center justify-between px-4 md:px-6" style={{ height: 56 }}>
                <span
                    className="text-[17px] font-bold cursor-pointer"
                    onClick={() => navigate('/home')}
                >
                    Debuggers<span style={{ color: 'var(--dbe-pink)' }}>Eats</span>
                </span>

                {/* Links — solo desktop */}
                <div className="hidden md:flex gap-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="px-3 py-1.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all"
                            style={{
                                background: isActive(item.path) ? 'rgba(242,80,156,0.12)' : 'transparent',
                                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <CartButton itemCount={itemCount} onClick={toggleCart} />
                    <AvatarMenu
                        initials={initials}
                        user={user}
                        onEditProfile={onEditProfile}
                        onLogout={onLogout}
                    />
                    {/* Hamburguesa — solo móvil */}
                    <button
                        className="md:hidden p-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                        onClick={() => setMobileMenuOpen((p) => !p)}
                        aria-label="Menú"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Menú móvil desplegable */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden flex flex-col px-4 pb-3 gap-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="text-left px-3 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all"
                            style={{
                                background: isActive(item.path) ? 'rgba(242,80,156,0.12)' : 'transparent',
                                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
};