import { useCallback, useEffect, useRef } from "react";
import { useAdminOrderStore } from "../store/adminOrdersStore.js";
import { useAuthStore } from "../../auth/store/authStore.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { VALID_TRANSITIONS, ORDER_STATUS }from '../constants/order.constans.js';

const POLL_INTERVAL_MS = 30000;

export const useAdminOrders = ()=>{
    const restaurantId = useAuthStore((s)=> s.user?.restaurantId);
    const pollRef = useRef(null);

    const {
        orders,
        selectedOrder,
        loading,
        loadingDetail,
        loadingAction,
        error,
        getRestaurantOrders,
        getOrderById, 
        updateOrderStatus,
        cancelOrder,
        setSelectedOrder,
        clearError,
    } = useAdminOrderStore();

    const fetchOrders = useCallback(
        (params = {})=>{
            if(!restaurantId) return;
            getRestaurantOrders(restaurantId, params);
        },
        [restaurantId, getRestaurantOrders]
    );

    const startPolling = useCallback((params = {}) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
        fetchOrders(params);
    }, POLL_INTERVAL_MS);
}, [fetchOrders]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []); //Poling que sirve actualizar las ordenes cada 30 segundos sin necesisdad de tocar el backend

    const handleUpdateStatus = useCallback(
        async (orderId, currentStatus, newStatus) => {
            const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
            if (!allowed.includes(newStatus)) {
                showError(`Transición inválida: ${currentStatus} → ${newStatus}`);
                return { ok: false };
            }
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.ok) {
                showSuccess(`Pedido actualizado a "${newStatus}"`);
            } else {
                showError(result.message);
            }
            return result;
        },
        [updateOrderStatus]
    );

    const handleCancelOrder = useCallback(
        async (orderId) => {
            const result = await cancelOrder(orderId);
            if (result.ok) {
                showSuccess('Pedido cancelado');
            } else {
                showError(result.message);
            }
            return result;
        },
        [cancelOrder]
    );

    const nextStatus = useCallback((currentStatus) => {
        const flow = {
            [ORDER_STATUS.PENDIENTE]: ORDER_STATUS.ACEPTADO,
            [ORDER_STATUS.ACEPTADO]: ORDER_STATUS.EN_PREPARACION,
            [ORDER_STATUS.EN_PREPARACION]: ORDER_STATUS.LISTO,
            [ORDER_STATUS.LISTO]: ORDER_STATUS.ENTREGADO,
        };
        return flow[currentStatus] ?? null;
    }, []); //Flujo actual de estado y cual es el siguiente tipo de estado.

    return {
        orders,
        selectedOrder,
        loading,
        loadingDetail,
        loadingAction,
        error,
        restaurantId,
        fetchOrders,
        startPolling,
        stopPolling,
        getOrderById,
        updateOrderStatus: handleUpdateStatus,
        cancelOrder: handleCancelOrder,
        nextStatus,
        setSelectedOrder,
        clearError,
    };
};