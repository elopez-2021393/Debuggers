// client-user/src/features/orders/screens/CartScreen.jsx
// Vista de carrito en pantalla completa (accesible desde el header o navegación directa).
// El flujo principal ahora usa CartModal, pero esta pantalla sirve como alternativa.

import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../hooks/useCart";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <Card style={styles.cartItem}>
    {item.photo ? (
      <Image source={{ uri: item.photo }} style={styles.itemImage} />
    ) : (
      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
        <MaterialIcons name="restaurant-menu" size={28} color={COLORS.textMuted} />
      </View>
    )}
    <View style={styles.itemContent}>
      <Text style={styles.itemName}>{item.nombre}</Text>
      <Text style={styles.itemPrice}>Q {item.precio?.toFixed(2)} c/u</Text>

      <View style={styles.quantityControls}>
        <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
          <MaterialIcons
            name={item.cantidad === 1 ? "delete" : "remove"}
            size={16}
            color={item.cantidad === 1 ? COLORS.error : COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.cantidad}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
          <MaterialIcons name="add" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemSubtotal}>
          Subtotal: Q {item.subtotal?.toFixed(2)}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  </Card>
);

const CartScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    cart,
    cartCount,
    loading,
    hasItems,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Carrito (${cartCount})`,
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.text,
    });
  }, [navigation, cartCount]);

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
    Alert.alert("Vaciar carrito", "¿Eliminar todos los platillos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Vaciar", style: "destructive", onPress: clearCart },
    ]);
  };

  if (loading && !hasItems) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!hasItems) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="shopping-cart"
          title="Carrito vacío"
          subtitle="Agrega platillos del menú para comenzar"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {cart.items.map((item, index) => (
          <CartItem
            key={item.menuItemId || index}
            item={item}
            onIncrease={() => updateCartItem(item.menuItemId, item.cantidad + 1)}
            onDecrease={() => handleDecrease(item)}
            onRemove={() => removeCartItem(item.menuItemId)}
          />
        ))}

        <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Vaciar carrito</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer fijo con totales */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}
      >
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>Q {cart.subtotal?.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (12%)</Text>
            <Text style={styles.totalValue}>Q {cart.iva?.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>Q {cart.total?.toFixed(2)}</Text>
          </View>
        </View>
        <Button
          title="Proceder al pago"
          onPress={() => navigation.navigate("CheckoutModal", { cart })}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  cartItem: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  itemImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    padding: SPACING.md,
  },
  itemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: "center",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemSubtotal: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  clearBtn: {
    alignSelf: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  clearBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    ...SHADOWS.md,
  },
  totalsBlock: { marginBottom: SPACING.md },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  totalLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  totalValue: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  grandRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  grandLabel: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  grandValue: { color: COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  checkoutButton: { marginBottom: 0 },
});

export default CartScreen;