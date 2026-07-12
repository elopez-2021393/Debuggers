// client-user/src/features/orders/screens/CartModal.jsx
// Modal del carrito tipo bottom-sheet, equivalente al CartDrawer de client-admin.
// Se muestra sobre la pantalla actual (sin navegar) gracias al store global.

import React, { useEffect } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../hooks/useCart";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";

// ── Ítem de carrito ──────────────────────────────────────────────────────────
const CartItemRow = ({ item, onIncrease, onDecrease, onRemove }) => (
    <View style={styles.cartItemRow}>
        {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.itemThumb} />
        ) : (
            <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                <MaterialIcons name="restaurant-menu" size={20} color={COLORS.textMuted} />
            </View>
        )}

        <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
                {item.nombre}
            </Text>
            <Text style={styles.itemPrice}>Q {item.precio?.toFixed(2)}</Text>
        </View>

        <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
                <MaterialIcons
                    name={item.cantidad === 1 ? "delete" : "remove"}
                    size={16}
                    color={item.cantidad === 1 ? COLORS.error : COLORS.text}
                />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.cantidad}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
                <MaterialIcons name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
        </View>

        <Text style={styles.itemSubtotal}>Q {item.subtotal?.toFixed(2)}</Text>
    </View>
);

// ── Modal principal ──────────────────────────────────────────────────────────
const CartModal = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const {
        cart,
        isCartOpen,
        loading,
        hasItems,
        cartCount,
        closeCart,
        fetchCart,
        updateCartItem,
        removeCartItem,
        clearCart,
    } = useCart();

    // Refrescar el carrito cada vez que se abre el modal
    useEffect(() => {
        if (isCartOpen) fetchCart();
    }, [isCartOpen]);

    const handleDecrease = (item) => {
        if (item.cantidad <= 1) {
            Alert.alert("Eliminar ítem", `¿Quitar "${item.nombre}" del carrito?`, [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => removeCartItem(item.menuItemId),
                },
            ]);
        } else {
            updateCartItem(item.menuItemId, item.cantidad - 1);
        }
    };

    const handleClearCart = () => {
        Alert.alert("Vaciar carrito", "¿Eliminar todos los platillos del carrito?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Vaciar", style: "destructive", onPress: clearCart },
        ]);
    };

    const handleCheckout = () => {
        closeCart();
        // Navegar al CheckoutModal con los datos actuales del carrito
        navigation.navigate("CheckoutModal", { cart });
    };

    return (
        <Modal
            visible={isCartOpen}
            animationType="slide"
            transparent
            onRequestClose={closeCart}
        >
            {/* Overlay semitransparente */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={closeCart}
            />

            {/* Panel del carrito */}
            <View style={[styles.panel, { paddingBottom: insets.bottom + SPACING.md }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Tu carrito</Text>
                        {cartCount > 0 && (
                            <Text style={styles.headerSubtitle}>
                                {cartCount} platillo{cartCount !== 1 ? "s" : ""}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={closeCart} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Contenido */}
                {loading && !cart ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : !hasItems ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="shopping-cart" size={52} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
                        <Text style={styles.emptySubtitle}>Agrega platillos del menú para comenzar</Text>
                        <TouchableOpacity onPress={closeCart} style={styles.browseCta}>
                            <Text style={styles.browseCtaText}>Explorar menú</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={cart.items}
                        keyExtractor={(item) => item.menuItemId}
                        renderItem={({ item }) => (
                            <CartItemRow
                                item={item}
                                onIncrease={() => updateCartItem(item.menuItemId, item.cantidad + 1)}
                                onDecrease={() => handleDecrease(item)}
                                onRemove={() => removeCartItem(item.menuItemId)}
                            />
                        )}
                        style={styles.list}
                        contentContainerStyle={{ paddingBottom: SPACING.sm }}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
                                <Text style={styles.clearBtnText}>Vaciar carrito</Text>
                            </TouchableOpacity>
                        }
                    />
                )}

                {/* Footer con totales y CTA */}
                {hasItems && (
                    <View style={styles.footer}>
                        <View style={styles.totalsBlock}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal</Text>
                                <Text style={styles.totalValue}>Q {cart.subtotal?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>IVA (12%)</Text>
                                <Text style={styles.totalValue}>Q {cart.iva?.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.totalRow, styles.grandTotalRow]}>
                                <Text style={styles.grandTotalLabel}>Total</Text>
                                <Text style={styles.grandTotalValue}>Q {cart.total?.toFixed(2)}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={handleCheckout}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.checkoutBtnText}>Confirmar pedido</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "85%",
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        // Degradado simulado con backgroundColor; en producción se puede usar LinearGradient
        backgroundColor: "#1a1a24",
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
    closeBtn: {
        padding: SPACING.xs,
    },
    centered: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: SPACING.xxl,
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontWeight: "600",
        marginTop: SPACING.md,
    },
    emptySubtitle: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        textAlign: "center",
        marginTop: SPACING.xs,
    },
    browseCta: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    browseCtaText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
    },
    list: {
        flexGrow: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    },
    // ── Cart item row ────────────────────────────────────────────────
    cartItemRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.sm,
    },
    itemThumb: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.sm,
        resizeMode: "cover",
    },
    itemThumbPlaceholder: {
        backgroundColor: COLORS.surfaceAlt,
        justifyContent: "center",
        alignItems: "center",
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        color: COLORS.text,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
    },
    itemPrice: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.surfaceAlt,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qtyText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        minWidth: 18,
        textAlign: "center",
    },
    itemSubtotal: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        minWidth: 56,
        textAlign: "right",
    },
    clearBtn: {
        marginTop: SPACING.md,
        alignSelf: "center",
    },
    clearBtnText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
    },
    // ── Footer ────────────────────────────────────────────────────────
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    },
    totalsBlock: {
        marginBottom: SPACING.md,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.xs,
    },
    totalLabel: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    totalValue: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    grandTotalRow: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    grandTotalLabel: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
    },
    grandTotalValue: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
    },
    checkoutBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: "center",
        marginBottom: SPACING.sm,
    },
    checkoutBtnText: {
        color: "#fff",
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
    },
});

export default CartModal;