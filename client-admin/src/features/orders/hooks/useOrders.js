// src/features/orders/hooks/useOrders.js

import { useCallback } from 'react';
import { useOrderStore } from '../store/orderStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { CANCEL_WINDOW_MS, ORDER_STATUS } from '../constants/order.constans.js';

export const useOrders = () => {
    const userId = useAuthStore((s) => s.user?._id || s.user?.id);
    const clearLocal = useCartStore((s) => s.clearLocal);
    const {
        orders,
        selectedOrder,
        loading,
        loadingDetail,
        error,
        getUserOrders,
        getOrderById,
        confirmOrder,
        cancelOrder,
        setSelectedOrder,
        clearError,
    } = useOrderStore();

    const handleGetUserOrders = useCallback(
        (status) => {
            if (!userId) return;
            getUserOrders(userId, status);
        },
        [userId, getUserOrders]
    );

    const handleConfirmOrder = useCallback(
        async (formData) => {
            const result = await confirmOrder(formData);
            if (result.ok) {
                clearLocal();
                showSuccess('¡Pedido confirmado! Pronto recibirás tu comida.');
            } else {
                showError(result.message);
            }
            return result;
        },
        [confirmOrder, clearLocal]
    );

    const handleCancelOrder = useCallback(
        async (orderId) => {
            const result = await cancelOrder(orderId);
            if (result.ok) {
                showSuccess('Pedido cancelado correctamente');
            } else {
                showError(result.message);
            }
            return result;
        },
        [cancelOrder]
    );

    const canCancelOrder = useCallback((order) => {
        if (!order) return false;
        if (order.status !== ORDER_STATUS.PENDIENTE) return false;
        const elapsed = Date.now() - new Date(order.createdAt).getTime();
        return elapsed < CANCEL_WINDOW_MS;
    }, []);

    const cancelTimeLeft = useCallback((order) => {
        if (!order || order.status !== ORDER_STATUS.PENDIENTE) return 0;
        const elapsed = Date.now() - new Date(order.createdAt).getTime();
        const remaining = CANCEL_WINDOW_MS - elapsed;
        return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
    }, []);

    return {
        orders,
        selectedOrder,
        loading,
        loadingDetail,
        error,
        getUserOrders: handleGetUserOrders,
        getOrderById,
        confirmOrder: handleConfirmOrder,
        cancelOrder: handleCancelOrder,
        canCancelOrder,
        cancelTimeLeft,
        setSelectedOrder,
        clearError,
    };
};