// client-user/src/features/orders/screens/OrderDetailScreen.jsx

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useOrders } from "../hooks/useOrders";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";

const STATUS_COLORS = {
  Pendiente: "#ff9800",
  En_preparación: "#42a5f5",
  Aceptado: "#26c6da",
  Listo: "#66bb6a",
  Entregado: "#4caf50",
  Cancelado: "rgba(255,255,255,0.35)",
};

const STATUS_LABELS = {
  Pendiente: "Pendiente",
  En_preparación: "En preparación",
  Aceptado: "Aceptado",
  Listo: "Listo",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

const OrderDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { orderDetail, loading, error, fetchOrderDetail, cancelOrder } = useOrders();
  const [restaurantName, setRestaurantName] = useState("Cargando...");

  const fetchOrder = useCallback(async () => {
    try {
      await fetchOrderDetail(orderId);
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el detalle del pedido");
    }
  }, [orderId, fetchOrderDetail]);

  const fetchRestaurantName = async () => {
    if (orderDetail?.restaurantId) {
      try {
        const response = await restaurantClient.get(`/restaurants/${orderDetail.restaurantId}`);
        const data = response.data.data || response.data;
        setRestaurantName(data.name);
      } catch (err) {
        setRestaurantName("Restaurante");
      }
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    fetchRestaurantName();
  }, [orderDetail]);

  const handleCancel = async () => {
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro de que deseas cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelOrder(orderId);
              Alert.alert("Éxito", "Pedido cancelado correctamente");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", "No se pudo cancelar el pedido");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error || !orderDetail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar el pedido</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[orderDetail.status] || COLORS.textMuted;
  const canCancel = orderDetail.status === "Pendiente";

  const date = new Date(orderDetail.createdAt);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[orderDetail.status] || orderDetail.status}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formattedDate}</Text>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Items del pedido</Text>
          {orderDetail.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemDetails}>
                  {item.cantidad} x Q {item.precio}
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>Q {item.subtotal}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Información de entrega</Text>
          <InfoRow icon="location-on" label="Dirección" value={orderDetail.direccion?.descripcion} />
          <InfoRow icon="phone" label="Teléfono" value={orderDetail.telefono} />
          <InfoRow icon="payment" label="Tipo de pago" value={orderDetail.tipoPago} />
          {orderDetail.estimadoEntrega && (
            <InfoRow icon="schedule" label="Tiempo estimado" value={orderDetail.estimadoEntrega} />
          )}
        </Card>

        {orderDetail.notas && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notesText}>{orderDetail.notas}</Text>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <SummaryRow label="Subtotal" value={`Q ${orderDetail.subtotal}`} />
          <SummaryRow label="IVA (12%)" value={`Q ${orderDetail.iva}`} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Q {orderDetail.total}</Text>
          </View>
        </Card>

        {canCancel && (
          <Button
            title="Cancelar pedido"
            variant="secondary"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const SummaryRow = ({ label, value }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  restaurantName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  itemDetails: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  itemSubtotal: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  notesText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
  },
  cancelButton: {
    marginBottom: SPACING.xl,
  },
});

export default OrderDetailScreen;
