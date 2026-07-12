import { create } from 'zustand';
import {
    addToCart as addToCartRequest,
    getCart as getCartRequest,
    updateCartItem as updateCartItemRequest,
    removeCartItem as removeCartItemRequest,
    clearCart as clearCartRequest
} from '../../../shared/apis';

export const useCartStore = create((set, get) => ({
    cart: null,
    isOpen: false,
    loading: false,
    error: null,

    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

    get itemCount() {
        return get().cart?.items?.reduce((sum, i) => sum + i.cantidad, 0) ?? 0;
    },//Contar la cantidad de items que tiene el carrito

    getCart: async (userId) => {
        try {
            set({
                loading: true,
                error: null
            });
            const res = await getCartRequest(userId);
            set({
                cart: res.data.data ?? null, loading: false
            });
        } catch {
            set({ loading: false });
        }//El carrito vacío no significa error, porque en el back responde con 200 data = null
    },

    addToCart: async (userId, { menuItemId, cantidad, aditamentos = [] }) => {
        try {
            set({
                loading: true,
                error: null
            });
            const res = await addToCartRequest(userId, { menuItemId, cantidad, aditamentos });
            set({
                cart: res.data.data, loading: false, isOpen: true
            });
            return { ok: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al agregar al carrito';
            set({
                error: message,
                loading: false
            });
            return { ok: false, message }
        }
    },

    updateCartItem: async (userId, menuItemId, cantidad) => {
        const prev = get().cart;
        if (prev) {
            const optimistic = {
                ...prev,
                items: cantidad === 0
                    ? prev.items.filter((i) => i.menuItemId !== menuItemId)
                    : prev.items.map((i) =>
                        i.menuItemId === menuItemId
                            ? { ...i, cantidad, subtotal: parseFloat((i.precio * cantidad).toFixed(2)) }
                            : i
                    ),
            };
            set({ cart: optimistic });
        }//Primero se actualiza local el carrito para mejor UX

        try {
            const res = await updateCartItemRequest(userId, menuItemId, cantidad);
            set({ cart: res.data.data });
        } catch (err) {
            set({ cart: prev });
            const message = err.response?.data?.message || 'Error al actualizar el carrito';
            set({ error: message });
        }//si falla se revierte la actualizacion local (optimistic)
    },

    removeCartItem: async (userId, menuItemId) => {
        const prev = get().cart;
        if (prev) {
            set({
                cart: {
                    ...prev,
                    items: prev.items.filter((i) => i.menuItemId !== menuItemId),
                },
            });
        }//quitar el item

        try {
            const res = await removeCartItemRequest(userId, menuItemId);
            set({ cart: res.data.data });
        } catch {
            set({ cart: prev });
        }
    },

    clearCart: async (userId) => {
        try {
            await clearCartRequest(userId);
            set({ cart: null, isOpen: false });
        } catch {
            set({ cart: null, isOpen: false });
        }
    },

    //Limpiar cuando el pedido es confirmado
    clearLocal: () => set({ cart: null, isOpen: false }),
    clearError: () => set({ error: null })
}))