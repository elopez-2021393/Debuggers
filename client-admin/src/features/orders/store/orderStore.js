import { create } from 'zustand';
import {
    getUserOrders as getUserOrdersRequest,
    getOrdersById as getOrderByIdRequest, 
    confirmOrder as confirmOrderRequest,
    cancelOrder as cancelOrderRequest,
} from '../../../shared/apis';

export const useOrderStore = create((set, get) => ({
    orders: [],
    selectedOrder: null,
    loading: false,
    loadingDetail: false,
    error: null,

    getUserOrders: async (userId, status) => {
        try {
            set({ loading: true, error: null });
            const res = await getUserOrdersRequest(userId, status);
            set({ orders: res.data.data, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener tus pedidos.',
                loading: false,
            });
        }
    },

    getOrderById: async (orderId) => {
        try {
            set({ loadingDetail: true, error: null });
            const res = await getOrderByIdRequest(orderId);
            set({ selectedOrder: res.data.data, loadingDetail: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener el pedido',
                loadingDetail: false,
            });
        }
    },

    confirmOrder: async (body) => {
        try {
            set({ loading: true, error: null });
            const res = await confirmOrderRequest(body);
            set({ loading: false });
            return { ok: true, data: res.data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al confirmar el pedido';
            set({ error: message, loading: false });
            return { ok: false, message };
        }
    },

    cancelOrder: async (orderId) => {
        try {
            set({ loading: true, error: null });
            const res = await cancelOrderRequest(orderId);
            const updated = res.data.data;
            set((s) => ({
                orders: s.orders.map((o) => (o._id === orderId ? updated : o)),
                selectedOrder: s.selectedOrder?._id === orderId ? updated : s.selectedOrder,
                loading: false,
            }));
            return { ok: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al cancelar el pedido';
            set({ error: message, loading: false });
            return { ok: false, message };
        }
    },

    setSelectedOrder: (order) => set({ selectedOrder: order }),
    clearError: () => set({ error: null }),
}));