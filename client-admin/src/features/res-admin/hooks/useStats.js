import { useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useAdminOrderStore } from '../../orders/store/adminOrdersStore.js';
import { useReservationStore } from '../../reservations/store/reservationStore.js';
import { useTableStore } from '../../tables/store/tableStore.js';
import { useReportsStore } from '../../reports/store/reportsStore.js';

export const useDashboardStats = () => {
    const user = useAuthStore((s) => s.user);
    const restaurantId = user?.restaurantId;
    const restaurantName = user?.restaurantName;

    const { orders, loading: loadingOrders, getRestaurantOrders } = useAdminOrderStore();
    const { reservations, loading: loadingReservations, fetchByRestaurant } = useReservationStore();
    const { tables, loading: loadingTables, fetchTables } = useTableStore();
    const { reporte, loading: loadingReporte, getReporteRestaurante } = useReportsStore();

    useEffect(() => {
        if (!restaurantId) return;
        getRestaurantOrders(restaurantId);
        fetchTables(restaurantId);
        getReporteRestaurante(restaurantId);
    }, [restaurantId]);

    useEffect(() => {
        if (!restaurantName) return;
        fetchByRestaurant(restaurantName);
    }, [restaurantName]);

    const loading = loadingOrders || loadingReservations || loadingTables || loadingReporte;

    return {
        loading,
        orders,
        reservations,
        tables,
        reporte,
    };
};