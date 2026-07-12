// client-user/src/features/orders/store/cartStore.js
// Store global de Zustand para el carrito, igual al patrón de client-admin.
// Esto garantiza que cartCount, cart items y el modal del carrito se sincronicen
// entre RestaurantMenuScreen, CartScreen y CheckoutModal sin pasar props.

import { create } from "zustand";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useCartStore = create((set, get) => ({
    cart: null,          // { items, subtotal, iva, total }
    isCartOpen: false,   // controla el CartModal (bottom sheet)
    loading: false,
    error: null,

    // ── Visibilidad del modal de carrito ──────────────────────────────
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

    // ── Helpers derivados ─────────────────────────────────────────────
    get cartCount() {
        return get().cart?.items?.reduce((sum, i) => sum + i.cantidad, 0) ?? 0;
    },
    get hasItems() {
        return (get().cart?.items?.length ?? 0) > 0;
    },

    // ── CRUD del carrito ──────────────────────────────────────────────
    fetchCart: async (userId) => {
        if (!userId) return;
        try {
            set({ loading: true, error: null });
            const res = await restaurantClient.get(`/orders/cart/${userId}`);
            const data = res.data.data ?? { items: [], subtotal: 0, iva: 0, total: 0 };
            set({ cart: data, loading: false });
        } catch (err) {
            set({
                loading: false,
                error:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Error al cargar el carrito",
            });
        }
    },

    addToCart: async (userId, menuItemId, cantidad = 1, aditamentos = []) => {
        if (!userId) return { ok: false, message: "userId requerido" };
        try {
            set({ loading: true, error: null });
            const res = await restaurantClient.post(`/orders/cart/${userId}`, {
                menuItemId,
                cantidad,
                aditamentos,
            });
            const data = res.data.data ?? { items: [], subtotal: 0, iva: 0, total: 0 };
            set({ cart: data, loading: false, isCartOpen: true }); // abre el modal automáticamente
            return { ok: true };
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Error al agregar al carrito";
            set({ loading: false, error: message });
            return { ok: false, message };
        }
    },

    updateCartItem: async (userId, menuItemId, cantidad) => {
        if (!userId) return;
        const prev = get().cart;

        // Optimistic update para mejor UX
        if (prev) {
            const optimistic = {
                ...prev,
                items:
                    cantidad === 0
                        ? prev.items.filter((i) => i.menuItemId !== menuItemId)
                        : prev.items.map((i) =>
                            i.menuItemId === menuItemId
                                ? { ...i, cantidad, subtotal: parseFloat((i.precio * cantidad).toFixed(2)) }
                                : i
                        ),
            };
            set({ cart: optimistic });
        }

        try {
            const res = await restaurantClient.patch(
                `/orders/cart/${userId}/${menuItemId}`,
                { cantidad }
            );
            set({ cart: res.data.data });
        } catch (err) {
            set({
                cart: prev,
                error:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Error al actualizar el carrito",
            });
        }
    },

    removeCartItem: async (userId, menuItemId) => {
        if (!userId) return;
        const prev = get().cart;
        // Optimistic: quitar el ítem localmente
        if (prev) {
            set({
                cart: {
                    ...prev,
                    items: prev.items.filter((i) => i.menuItemId !== menuItemId),
                },
            });
        }
        try {
            const res = await restaurantClient.delete(
                `/orders/cart/${userId}/${menuItemId}`
            );
            set({ cart: res.data.data });
        } catch {
            set({ cart: prev });
        }
    },

    clearCart: async (userId) => {
        if (!userId) return;
        try {
            await restaurantClient.delete(`/orders/cart/${userId}`);
        } catch {
            // silencioso
        } finally {
            set({ cart: null, isCartOpen: false });
        }
    },

    clearLocal: () => set({ cart: null, isCartOpen: false }),
    clearError: () => set({ error: null }),
}));