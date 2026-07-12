import { useMemo, useEffect } from 'react';
import { StatCard } from '../../reports/components/StatCard.jsx';
import { RecentMovements } from '../components/RecentOrders.jsx';
import { RecentReservations } from '../components/RecentReservations.jsx';
import { useDashboardStats } from '../hooks/useStats.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';
import { useReviewStore } from '../../review/store/reviewStore.js';
import { ORDER_STATUS } from '../../orders/constants/order.constans.js';

export const ResAdminDashboardPage = () => {
    const { loading, orders, reservations, tables, reporte } = useDashboardStats();
    const user = useAuthStore((s) => s.user);

    const { restaurants, getRestaurants } = useRestaurantStore();
    const { reviews, getReviews } = useReviewStore();

    useEffect(() => {
        getRestaurants();
    }, []);

    useEffect(() => {
        if (user?.restaurantId) getReviews(user.restaurantId);
    }, [user?.restaurantId]);

    const restaurant = restaurants.find((r) => r._id === user?.restaurantId);

    const avgRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const stats = useMemo(() => [
        {
            label: 'Pedidos activos',
            value: loading ? '—' : orders.length,
            sub: `${orders.filter((o) => o.status === ORDER_STATUS.PENDIENTE).length} pendientes`,
        },
        {
            label: 'Reservaciones',
            value: loading ? '—' : reservations.length,
            sub: `${reservations.filter((r) => r.status === 'PENDIENTE').length} pendientes`,
        },
        {
            label: 'Mesas',
            value: loading ? '—' : `${tables.filter((t) => t.isActive).length} / ${tables.length}`,
            sub: 'activas',
        },
        {
            label: 'Ingresos totales',
            value: loading ? '—' : `Q${reporte?.totalIngresos?.toFixed(2) ?? '0.00'}`,
            sub: `${reporte?.totalPedidos ?? 0} pedidos entregados`,
        },
    ], [loading, orders, reservations, tables, reporte]);

    return (
        <div className='flex flex-col gap-6'>

            {/* ── Banner del restaurante ── */}
            <div
                className='relative rounded-2xl overflow-hidden border border-white/[0.06] min-h-[110px]'
                style={{ background: 'linear-gradient(135deg, #1a0a10 0%, #2a0f1a 50%, #111118 100%)' }}
            >
                {/* Overlay degradado */}
                <div
                    className='absolute inset-0'
                    style={{ background: 'rgba(0,0,0,0.45)' }}
                />

                {/* Contenido */}
                <div className='relative flex items-center gap-5 px-6 py-5'>
                    {restaurant?.photo ? (
                        <img
                            src={restaurant.photo}
                            alt={restaurant.name}
                            className='w-16 h-16 rounded-xl object-cover flex-shrink-0'
                            style={{ border: '2px solid rgba(255,255,255,0.3)' }}
                        />
                    ) : (
                        <div
                            className='w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0'
                            style={{ border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)' }}
                        >
                            <span className='text-2xl font-semibold text-white'>
                                {restaurant?.name?.[0]?.toUpperCase() ?? '?'}
                            </span>
                        </div>
                    )}

                    <div>
                        <p
                            className='text-xs font-medium mb-1'
                            style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        >
                            Panel de administración
                        </p>

                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl font-semibold text-white leading-tight'>
                                {restaurant?.name ?? user?.restaurantName ?? 'Mi restaurante'}
                            </h1>
                            {avgRating && (
                                <span
                                    className='flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold'
                                    style={{ background: 'rgba(255,255,255,0.12)', color: '#fbbf24' }}
                                >
                                    ★ {avgRating}
                                    <span className='text-xs font-normal' style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        ({reviews.length})
                                    </span>
                                </span>
                            )}
                        </div>

                        {restaurant?.category && (
                            <p className='text-xs mt-1' style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {restaurant.category.replace('_', ' ')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* ── Tablas recientes ── */}
            <div className='flex flex-col xl:flex-row gap-6'>
                <div className='flex-1 min-w-0'>
                    <RecentMovements orders={orders} />
                </div>
                <RecentReservations reservations={reservations} />
            </div>
        </div>
    );
};