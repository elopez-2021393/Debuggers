import { useCallback } from "react";
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from "../../auth/store/authStore.js";
import { showSuccess, showError, showInfo } from "../../../shared/utils/toast.js";

export const useCart = () => {
    const userId = useAuthStore((s) => s.user?._id || s.user?.id);
    const {
        cart,
        isOpen,
        loading,
        error,
        openCart,
        closeCart,
        toggleCart,
        getCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        clearLocal,
        clearError,
    } = useCartStore();

    const itemCount = cart?.items?.reduce((sum, i) => sum + i.cantidad, 0) ?? 0;
    const hasItems = itemCount > 0;

    const handleAddToCart = useCallback(
        async (menuItemId, cantidad = 1, aditamentos = []) => {
            if (!userId) return;
            const result = await addToCart(userId, { menuItemId, cantidad, aditamentos });
            if (result.ok) {
                showSuccess('Platillo agregado al carrito');
            } else {
                showError(result.message);
            }
            return result;
        },
        [userId, addToCart]
    );

    const handleUpdateCartItem = useCallback(
        (menuItemId, cantidad) => {
            if (!userId) return;
            updateCartItem(userId, menuItemId, cantidad);
        },
        [userId, updateCartItem]
    );

    const handleRemoveCartItem = useCallback(
        (menuItemId) => {
            if (!userId) return;
            removeCartItem(userId, menuItemId);
        },
        [userId, removeCartItem]
    );

    const handleClearCart = useCallback(async () => {
        if (!userId) return;
        await clearCart(userId);
        showInfo('Carrito vaciado');
    }, [userId, clearCart]);

    const handleGetCart = useCallback(() => {
        if (!userId) return;
        getCart(userId);
    }, [userId, getCart]);

    return {
        cart,
        isOpen,
        loading,
        error,
        itemCount,
        hasItems,
        openCart,
        closeCart,
        toggleCart,
        getCart: handleGetCart,
        addToCart: handleAddToCart,
        updateCartItem: handleUpdateCartItem,
        removeCartItem: handleRemoveCartItem,
        clearCart: handleClearCart,
        clearLocal,
        clearError,
    };
};