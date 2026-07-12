import { create } from 'zustand';
import {
    getRestaurantOrders as getRestaurantOrdersRequest,
    getOrdersById as getOrdersByIdRequest,
    updateOrderStatus as updateOrderStatusRequest,
    cancelOrder as cancelOrderRequest
} from '../../../shared/apis';

export const useAdminOrderStore = create((set, get) => ({
    orders: [],
    selectedOrder: null,
    loading: false,
    loadingDetail: false,
    loadingAction: false,
    error: null,

    getRestaurantOrders: async (restaurantId, params = {}) => {
        try {
            set({ loading: true, error: null });
            const res = await getRestaurantOrdersRequest(restaurantId, params);
            set({ orders: res.data.data, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener los pedidos',
                loading: false,
            });
        }
    },

    getOrdersById: async (orderId) => {
        try {
            set({ loadingDetail: true, error: null });
            const res = await getOrdersByIdRequest(orderId);
            set({ selectedOrder: res.data.data, loadingDetail: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener el pedido',
                loadingDetail: false,
            });
        }
    },

    updateOrderStatus: async(orderId, status)=>{
        try{
            set({loadingAction: true, error: null});
            const res = await updateOrderStatusRequest(orderId, status);
            const updatedStatus = res.data.data.status;

            set((s)=>({
                orders: s.orders.map((o)=>
                    o._id === orderId ? {...o, status: updatedStatus} : o
                ),

                selectedOrder:
                    s.selectedOrder?._id === orderId
                        ?{...s.selectedOrder, status: updatedStatus}
                        : s.selectedOrder,
                loadingAction: false,
            }));
            return { ok: true, status: updatedStatus};
        }catch(err){
            const message = err.response?.data?.message || 'Error al actualizar el estado';
            set({error: message, loadingAction: false});
            return { ok: false, message}
        }
    },

    cancelOrder: async(orderId)=>{
        try{
            set({ loadingAction: true, error: null});
            const res = await cancelOrderRequest(orderId);
            const updated = res.data.data;
            set((s)=>({
                orders: s.orders.map((o)=>(o._id === orderId ? updated : o)),
                selectedOrder:
                    s.selectedOrder?._id === orderId ? updated: s.selectedOrder,
                loadingAction: false
            }));
            return {ok: true};
        }catch(err){
            const message = err.response?.data?.message || 'Error al cancelar el pedido';
            set({error: message, loadingAction: false});
            return {ok: false, message};
        }
    },

    setSelectedOrder: (order)=> set({ selectedOrder: order}),
    clearError: ()=> set({error: null}),
}));