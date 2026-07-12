// client-user/src/features/orders/screens/CheckoutModal.jsx
// Pantalla de confirmación de pedido, equivalente al CheckoutModal de client-admin.
// Recibe `cart` como parámetro de navegación (pasado desde CartModal).

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../hooks/useCart";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../../../shared/constants/theme";
import Input from "../../../shared/components/common/Input";

const ADDRESS_TYPES = ["Casa", "Trabajo", "Otro"];
const PAYMENT_TYPES = [
  { value: "Efectivo", icon: "payments" },
  { value: "Tarjeta", icon: "credit-card" },
];

// ── Selector de chips (tipo dirección / pago) ──────────────────────────────
const ChipSelector = ({ options, selected, onSelect, renderLabel }) => (
  <View style={styles.chipsRow}>
    {options.map((opt) => {
      const value = typeof opt === "string" ? opt : opt.value;
      const isSelected = selected === value;
      return (
        <TouchableOpacity
          key={value}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onSelect(value)}
          activeOpacity={0.7}
        >
          {typeof opt !== "string" && (
            <MaterialIcons
              name={opt.icon}
              size={14}
              color={isSelected ? "#fff" : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {renderLabel ? renderLabel(opt) : value}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── Fila de resumen de ítem ────────────────────────────────────────────────
const OrderItemRow = ({ item }) => (
  <View style={styles.orderItemRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.orderItemName}>{item.nombre}</Text>
      <Text style={styles.orderItemQty}>×{item.cantidad}</Text>
    </View>
    <Text style={styles.orderItemPrice}>Q {item.subtotal?.toFixed(2)}</Text>
  </View>
);

// ── Pantalla principal ─────────────────────────────────────────────────────
const CheckoutModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cart } = route.params || {};
  const user = useAuthStore((s) => s.user);
  const { confirmOrder, loading } = useOrders();
  const { clearCart } = useCart();

  const [addressType, setAddressType] = useState("Casa");
  const [paymentType, setPaymentType] = useState("Efectivo");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      descripcion: "",
      referencias: "",
      telefono: user?.phone || "",
      notas: "",
    },
  });

  const onSubmit = async (data) => {
    if (!cart || !cart.items?.length) {
      Alert.alert("Error", "El carrito está vacío");
      return;
    }

    const orderBody = {
      restaurantId: cart.items[0]?.restaurantId,
      userId: user._id,
      items: cart.items,
      direccion: {
        tipo: addressType,
        descripcion: data.descripcion,
        referencias: data.referencias || "",
      },
      telefono: data.telefono,
      tipoPago: paymentType,
      notas: data.notas || "",
    };

    try {
      await confirmOrder(orderBody);
      await clearCart();

      Alert.alert(
        "¡Pedido realizado! 🎉",
        "Tu pedido fue confirmado. Recibirás una actualización pronto.",
        [
          {
            text: "Ver mis pedidos",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Pedidos" }] }),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Error al confirmar",
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo realizar el pedido. Intenta de nuevo."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.headerTitle}>Confirmar pedido</Text>
            {cart?.total != null && (
              <Text style={styles.headerSubtitle}>
                Total: Q {cart.total?.toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Dirección ── */}
          <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          <Text style={styles.fieldLabel}>Tipo de dirección</Text>
          <ChipSelector
            options={ADDRESS_TYPES}
            selected={addressType}
            onSelect={setAddressType}
          />

          <Input
            label="Descripción *"
            control={control}
            name="descripcion"
            rules={{ required: "La dirección es requerida", minLength: { value: 5, message: "Mínimo 5 caracteres" } }}
            error={errors.descripcion?.message}
            placeholder="Zona 1, Calle Principal 5-20, Apto. 3"
          />

          <Input
            label="Referencias (opcional)"
            control={control}
            name="referencias"
            placeholder="Casa color azul, frente al parque..."
          />

          {/* ── Contacto ── */}
          <Text style={styles.sectionTitle}>Contacto</Text>
          <Input
            label="Teléfono *"
            control={control}
            name="telefono"
            rules={{
              required: "El teléfono es requerido",
              pattern: { value: /^\d{8,15}$/, message: "8–15 dígitos" },
            }}
            error={errors.telefono?.message}
            placeholder="42459699"
            keyboardType="phone-pad"
          />

          {/* ── Método de pago ── */}
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <ChipSelector
            options={PAYMENT_TYPES}
            selected={paymentType}
            onSelect={setPaymentType}
            renderLabel={(opt) =>
              opt.value === "Tarjeta" ? "Tarjeta" : "Efectivo"
            }
          />

          {/* ── Notas ── */}
          <Text style={styles.sectionTitle}>Notas para el restaurante</Text>
          <Input
            label="Notas (opcional)"
            control={control}
            name="notas"
            placeholder="Sin picante, entregar en recepción..."
            multiline
            numberOfLines={3}
          />

          {/* ── Resumen del pedido ── */}
          {cart?.items?.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumen del pedido</Text>

              {cart.items.map((item, i) => (
                <OrderItemRow key={i} item={item} />
              ))}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Q {cart.subtotal?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IVA (12%)</Text>
                <Text style={styles.summaryValue}>Q {cart.iva?.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandLabel}>Total</Text>
                <Text style={styles.grandValue}>Q {cart.total?.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* ── CTA ── */}
          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.confirmBtnText}>Confirmar pedido</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginTop: 2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.xs },

  // Secciones
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },

  // Chips
  chipsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  chipTextSelected: { color: "#fff" },

  // Resumen
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  orderItemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  orderItemQty: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  orderItemPrice: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  summaryLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  summaryValue: { color: COLORS.text, fontSize: FONT_SIZE.sm },
  grandTotalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  grandLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  grandValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },

  // CTA
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: {
    color: "#fff",
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
});

export default CheckoutModal;