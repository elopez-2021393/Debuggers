// client-user/src/features/orders/screens/OrdersListScreen.jsx

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useOrders } from "../hooks/useOrders";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
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

const STATUS_FILTERS = [
  { value: "Todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "En_preparación", label: "En preparación" },
  { value: "Aceptado", label: "Aceptado" },
  { value: "Listo", label: "Listo" },
  { value: "Entregado", label: "Entregado" },
  { value: "Cancelado", label: "Cancelado" },
];

const OrderCard = ({ item, onViewDetail, onCancel }) => {
  const [restaurantName, setRestaurantName] = useState("Cargando...");
  const statusColor = STATUS_COLORS[item.status] || COLORS.textMuted;
  const canCancel = item.status === "Pendiente";

  useEffect(() => {
    restaurantClient
      .get(`/restaurants/${item.restaurantId}`)
      .then((r) => setRestaurantName(r.data.data?.name || r.data.name || "Restaurante"))
      .catch(() => setRestaurantName("Restaurante"));
  }, [item.restaurantId]);

  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro de que deseas cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: () => onCancel(item._id) },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName} numberOfLines={1}>{restaurantName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[item.status] || item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="calendar-today" size={16} color={COLORS.textSecondary} />
        <Text style={styles.cardText}>{formattedDate}</Text>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="attach-money" size={16} color={COLORS.primary} />
        <Text style={styles.totalText}>Q {item.total}</Text>
      </View>

      {item.estimadoEntrega ? (
        <View style={styles.cardRow}>
          <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
          <Text style={styles.cardText}>{item.estimadoEntrega}</Text>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <Button
          title="Ver detalle"
          variant="secondary"
          onPress={() => onViewDetail(item._id)}
          style={styles.detailButton}
        />
        {canCancel && (
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
        )}
      </View>
    </Card>
  );
};

const OrdersListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { orders, loading, fetchMyOrders, cancelOrder } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  useEffect(() => {
    if (user?._id) {
      fetchMyOrders(user._id, selectedStatus === "Todos" ? null : selectedStatus);
    }
  }, [user, fetchMyOrders, selectedStatus]);

  const handleViewDetail = (orderId) => navigation.navigate("OrderDetail", { orderId });

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);
      Alert.alert("Éxito", "Pedido cancelado correctamente");
      fetchMyOrders(user._id, selectedStatus === "Todos" ? null : selectedStatus);
    } catch {
      Alert.alert("Error", "No se pudo cancelar el pedido");
    }
  };

  const filteredOrders =
    selectedStatus === "Todos"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header con título */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
        </Text>
      </View>

      {/* Filtros de estado */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const active = selectedStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(item.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard item={item} onViewDetail={handleViewDetail} onCancel={handleCancel} />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() =>
          fetchMyOrders(user._id, selectedStatus === "Todos" ? null : selectedStatus)
        }
        ListEmptyComponent={
          <EmptyState
            icon="shopping-bag"
            title={orders.length === 0 ? "No hay pedidos" : "Sin resultados"}
            subtitle={
              orders.length === 0
                ? "Realiza tu primer pedido para comenzar"
                : "Prueba con otro filtro"
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  filtersContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersList: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  listContent: {
    padding: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  restaurantName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  totalText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  detailButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default OrdersListScreen;