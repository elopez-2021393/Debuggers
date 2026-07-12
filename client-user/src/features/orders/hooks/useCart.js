// client-user/src/features/orders/hooks/useCart.js
// Hook delgado que conecta el cartStore con el userId del authStore.
// El patrón es idéntico al de client-admin: el hook resuelve el userId
// y delega al store, evitando que cada screen tenga que pasarlo manualmente.

import { useCallback } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../../../shared/store/authStore";

export const useCart = () => {
  const userId = useAuthStore((s) => s.user?._id || s.user?.id);

  const {
    cart,
    isCartOpen,
    loading,
    error,
    openCart,
    closeCart,
    toggleCart,
    fetchCart: fetchCartRaw,
    addToCart: addToCartRaw,
    updateCartItem: updateCartItemRaw,
    removeCartItem: removeCartItemRaw,
    clearCart: clearCartRaw,
    clearLocal,
    clearError,
  } = useCartStore();

  const cartCount =
    cart?.items?.reduce((sum, i) => sum + i.cantidad, 0) ?? 0;
  const hasItems = cartCount > 0;

  const fetchCart = useCallback(() => {
    if (userId) fetchCartRaw(userId);
  }, [userId, fetchCartRaw]);

  const addToCart = useCallback(
    (menuItemId, cantidad = 1, aditamentos = []) => {
      if (!userId) return Promise.resolve({ ok: false, message: "No autenticado" });
      return addToCartRaw(userId, menuItemId, cantidad, aditamentos);
    },
    [userId, addToCartRaw]
  );

  const updateCartItem = useCallback(
    (menuItemId, cantidad) => {
      if (userId) updateCartItemRaw(userId, menuItemId, cantidad);
    },
    [userId, updateCartItemRaw]
  );

  const removeCartItem = useCallback(
    (menuItemId) => {
      if (userId) removeCartItemRaw(userId, menuItemId);
    },
    [userId, removeCartItemRaw]
  );

  const clearCart = useCallback(() => {
    if (userId) return clearCartRaw(userId);
  }, [userId, clearCartRaw]);

  return {
    cart,
    isCartOpen,
    loading,
    error,
    cartCount,
    hasItems,
    openCart,
    closeCart,
    toggleCart,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    clearLocal,
    clearError,
  };
};