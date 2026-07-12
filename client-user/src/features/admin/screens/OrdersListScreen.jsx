// client-user/src/features/admin/screens/OrdersListScreen.jsx

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Modal, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import {
  useResAdminOrders,
  ORDER_STATUS,
  VALID_TRANSITIONS,
  NEXT_STATUS,
} from "../hooks/useResAdminOrders";

// ─── Configuración visual ─────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [ORDER_STATUS.PENDIENTE]: { label: "Pendiente", color: "#fbbf24", icon: "hourglass-empty" },
  [ORDER_STATUS.ACEPTADO]: { label: "Aceptado", color: "#60a5fa", icon: "check-circle-outline" },
  [ORDER_STATUS.EN_PREPARACION]: { label: "En preparación", color: "#c084fc", icon: "outdoor-grill" },
  [ORDER_STATUS.LISTO]: { label: "Listo", color: COLORS.primary, icon: "done-all" },
  [ORDER_STATUS.ENTREGADO]: { label: "Entregado", color: "#4ade80", icon: "local-shipping" },
  [ORDER_STATUS.CANCELADO]: { label: "Cancelado", color: "#f87171", icon: "cancel" },
};

const NEXT_LABEL = {
  [ORDER_STATUS.PENDIENTE]: "Aceptar pedido",
  [ORDER_STATUS.ACEPTADO]: "Iniciar preparación",
  [ORDER_STATUS.EN_PREPARACION]: "Marcar listo",
  [ORDER_STATUS.LISTO]: "Marcar entregado",
};

const STATUS_FILTERS = [
  { label: "Activos", params: {} },
  { label: "Pendientes", params: { status: ORDER_STATUS.PENDIENTE } },
  { label: "Aceptados", params: { status: ORDER_STATUS.ACEPTADO } },
  { label: "En preparación", params: { status: ORDER_STATUS.EN_PREPARACION } },
  { label: "Listos", params: { status: ORDER_STATUS.LISTO } },
  { label: "Historial", params: { todos: true } },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: COLORS.textMuted };
  return (
    <View style={[badge.wrap, { backgroundColor: `${cfg.color}20`, borderColor: `${cfg.color}30` }]}>
      <View style={[badge.dot, { backgroundColor: cfg.color }]} />
      <Text style={[badge.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const badge = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
});

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────

const OrderCard = ({ order, onViewDetail, onAdvanceStatus, onCancel, loadingAction }) => {
  const nextSt = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABEL[order.status];
  const canCancel = [ORDER_STATUS.PENDIENTE, ORDER_STATUS.ACEPTADO].includes(order.status);
  const isTerminal = [ORDER_STATUS.ENTREGADO, ORDER_STATUS.CANCELADO].includes(order.status);
  const isLoading = loadingAction === order._id;

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("es-GT", { day: "2-digit", month: "short" });
  const timeStr = date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card style={card.wrap}>
      {/* Cabecera */}
      <TouchableOpacity style={card.header} onPress={() => onViewDetail(order)} activeOpacity={0.7}>
        <View>
          <Text style={card.id}>#{order._id?.slice(-6).toUpperCase()}</Text>
          {/* FIX: · como string explícito para evitar el error de Text en Android */}
          <Text style={card.date}>{dateStr}{" \u00B7 "}{timeStr}</Text>
        </View>
        <StatusBadge status={order.status} />
      </TouchableOpacity>

      {/* Platillos */}
      {order.items?.length > 0 && (
        <View style={card.items}>
          {order.items.slice(0, 3).map((item, i) => (
            <Text key={i} style={card.item} numberOfLines={1}>
              {item.nombre || item.name}
              <Text style={card.itemQty}> ×{item.cantidad || item.quantity}</Text>
            </Text>
          ))}
          {order.items.length > 3 && (
            <Text style={card.itemMore}>+{order.items.length - 3} más</Text>
          )}
        </View>
      )}

      {/* Nota */}
      {order.notas ? (
        <View style={card.noteBox}>
          <Text style={card.noteText} numberOfLines={2}>"{order.notas}"</Text>
        </View>
      ) : null}

      {/* Footer */}
      <View style={card.footer}>
        <Text style={card.total}>Q{order.total?.toFixed(2)}</Text>
        {order.tipoPago ? (
          <View style={card.payBadge}>
            <Text style={card.payText}>{order.tipoPago}</Text>
          </View>
        ) : null}
      </View>

      {/* Acciones */}
      {!isTerminal && (
        <View style={card.actions}>
          {nextSt && nextLabel && (
            <TouchableOpacity
              style={[card.btnPrimary, isLoading && card.btnDisabled]}
              onPress={() => onAdvanceStatus(order)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={card.btnPrimaryText}>{nextLabel}</Text>}
            </TouchableOpacity>
          )}
          <View style={card.secondaryRow}>
            <TouchableOpacity
              style={[card.btnSecondary, { flex: 1 }]}
              onPress={() => onViewDetail(order)}
            >
              <Text style={card.btnSecondaryText}>Ver detalle</Text>
            </TouchableOpacity>
            {canCancel && (
              <TouchableOpacity
                style={[card.btnDanger, isLoading && card.btnDisabled]}
                onPress={() => onCancel(order)}
                disabled={isLoading}
              >
                <Text style={card.btnDangerText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {isTerminal && (
        <TouchableOpacity style={card.btnSecondary} onPress={() => onViewDetail(order)}>
          <Text style={card.btnSecondaryText}>Ver detalle</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const card = StyleSheet.create({
  wrap: { marginBottom: SPACING.md, padding: 0, overflow: "hidden" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  id: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "700", fontVariant: ["tabular-nums"] },
  date: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  items: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  item: { color: "rgba(255,255,255,0.7)", fontSize: FONT_SIZE.sm, marginBottom: 2 },
  itemQty: { color: COLORS.textMuted },
  itemMore: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "600", marginTop: 2 },
  noteBox: {
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    backgroundColor: "rgba(251,191,36,0.05)", borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)", borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  noteText: { color: "rgba(251,191,36,0.7)", fontSize: FONT_SIZE.xs, fontStyle: "italic" },
  footer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  total: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  payBadge: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: BORDER_RADIUS.xl, paddingHorizontal: 8, paddingVertical: 2 },
  payText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  actions: { padding: SPACING.md, paddingTop: 0, gap: SPACING.sm },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2, alignItems: "center", justifyContent: "center", minHeight: 40,
  },
  btnPrimaryText: { color: "#fff", fontSize: FONT_SIZE.sm, fontWeight: "700" },
  secondaryRow: { flexDirection: "row", gap: SPACING.sm },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.xs + 2, alignItems: "center",
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  btnSecondaryText: { color: "rgba(255,255,255,0.4)", fontSize: FONT_SIZE.xs, fontWeight: "600" },
  btnDanger: {
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, alignItems: "center",
    justifyContent: "center",
  },
  btnDangerText: { color: "#f87171", fontSize: FONT_SIZE.xs, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});

// ─── Modal de detalle ─────────────────────────────────────────────────────────

const STATUS_ACTION_LABELS = {
  [ORDER_STATUS.ACEPTADO]: "Aceptar pedido",
  [ORDER_STATUS.EN_PREPARACION]: "Iniciar preparación",
  [ORDER_STATUS.LISTO]: "Marcar como listo",
  [ORDER_STATUS.ENTREGADO]: "Marcar como entregado",
  [ORDER_STATUS.CANCELADO]: "Cancelar pedido",
};

const OrderDetailModal = ({ visible, order, onClose, onUpdateStatus, loadingAction }) => {
  if (!order) return null;
  const transitions = VALID_TRANSITIONS[order.status] ?? [];
  const date = new Date(order.createdAt);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mdl.overlay}>
        <View style={mdl.sheet}>
          {/* Header */}
          <View style={mdl.header}>
            <View>
              <Text style={mdl.headerTitle}>Detalle del pedido</Text>
              <Text style={mdl.headerSub}>#{order._id?.slice(-6).toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={mdl.closeBtn}>
              <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <ScrollView style={mdl.body} showsVerticalScrollIndicator={false}>
            {/* Estado + fecha — FIX: · dentro de string */}
            <View style={mdl.row}>
              <StatusBadge status={order.status} />
              <Text style={mdl.dateText}>
                {date.toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })}
                {" \u00B7 "}
                {date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>

            {/* Cliente */}
            {(order.telefono || order.direccion) && (
              <>
                <Text style={mdl.sectionLabel}>Cliente</Text>
                <View style={mdl.block}>
                  {order.telefono ? (
                    <View style={mdl.fieldRow}>
                      <Text style={mdl.fieldKey}>Teléfono</Text>
                      <Text style={mdl.fieldVal}>{order.telefono}</Text>
                    </View>
                  ) : null}
                  {order.direccion?.descripcion ? (
                    <View style={mdl.fieldRow}>
                      <Text style={mdl.fieldKey}>Dirección</Text>
                      <Text style={mdl.fieldVal}>{order.direccion.descripcion}</Text>
                    </View>
                  ) : null}
                  {order.direccion?.referencias ? (
                    <Text style={mdl.fieldNote}>{order.direccion.referencias}</Text>
                  ) : null}
                  {order.direccion?.tipo ? (
                    <View style={mdl.fieldRow}>
                      <Text style={mdl.fieldKey}>Tipo</Text>
                      <Text style={mdl.fieldVal}>{order.direccion.tipo}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}

            {/* Platillos */}
            <Text style={mdl.sectionLabel}>Platillos</Text>
            <View style={mdl.block}>
              {order.items?.map((item, idx) => (
                <View key={idx} style={mdl.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={mdl.itemName}>
                      {item.nombre || item.name}
                      <Text style={mdl.itemQty}> ×{item.cantidad || item.quantity}</Text>
                    </Text>
                    {item.aditamentos?.length > 0 && (
                      <Text style={mdl.itemExtra}>{item.aditamentos.join(", ")}</Text>
                    )}
                  </View>
                  {item.subtotal != null && (
                    <Text style={mdl.itemPrice}>Q{item.subtotal.toFixed(2)}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Totales */}
            <View style={[mdl.block, { gap: SPACING.xs }]}>
              {order.subtotal != null && (
                <View style={mdl.totalRow}>
                  <Text style={mdl.totalLabel}>Subtotal</Text>
                  <Text style={mdl.totalLabelVal}>Q{order.subtotal.toFixed(2)}</Text>
                </View>
              )}
              {order.iva != null && (
                <View style={mdl.totalRow}>
                  <Text style={mdl.totalLabel}>IVA (12%)</Text>
                  <Text style={mdl.totalLabelVal}>Q{order.iva.toFixed(2)}</Text>
                </View>
              )}
              <View style={[mdl.totalRow, mdl.totalFinal]}>
                <Text style={mdl.totalFinalLabel}>Total</Text>
                <Text style={mdl.totalFinalVal}>Q{order.total?.toFixed(2)}</Text>
              </View>
              {order.tipoPago && (
                <View style={mdl.totalRow}>
                  <Text style={mdl.totalLabel}>Método de pago</Text>
                  <Text style={mdl.totalLabelVal}>{order.tipoPago}</Text>
                </View>
              )}
            </View>

            {/* Notas */}
            {order.notas ? (
              <>
                <Text style={mdl.sectionLabel}>Notas del cliente</Text>
                <View style={[mdl.block, mdl.noteBlock]}>
                  <Text style={mdl.noteText}>"{order.notas}"</Text>
                </View>
              </>
            ) : null}

            {/* Cambiar estado */}
            {transitions.length > 0 && (
              <>
                <Text style={mdl.sectionLabel}>Cambiar estado</Text>
                <View style={{ gap: SPACING.sm }}>
                  {transitions.map((nextSt) => {
                    const isDanger = nextSt === ORDER_STATUS.CANCELADO;
                    return (
                      <TouchableOpacity
                        key={nextSt}
                        style={[
                          mdl.actionBtn,
                          isDanger ? mdl.actionBtnDanger : mdl.actionBtnPrimary,
                          loadingAction && mdl.actionBtnDisabled,
                        ]}
                        onPress={() => onUpdateStatus(order, nextSt)}
                        disabled={!!loadingAction}
                        activeOpacity={0.8}
                      >
                        {loadingAction
                          ? <ActivityIndicator size="small" color={isDanger ? "#f87171" : "#fff"} />
                          : <Text style={[mdl.actionBtnText, isDanger && mdl.actionBtnTextDanger]}>
                            {STATUS_ACTION_LABELS[nextSt]}
                          </Text>
                        }
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={{ height: SPACING.xl * 2 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const mdl = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "92%", borderWidth: 1, borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
  },
  headerTitle: { color: "#fff", fontSize: FONT_SIZE.lg, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: FONT_SIZE.xs, fontVariant: ["tabular-nums"], marginTop: 2 },
  closeBtn: { padding: 4 },
  body: { padding: SPACING.lg },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  dateText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 1,
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  block: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  fieldRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 3 },
  fieldKey: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  fieldVal: { color: "rgba(255,255,255,0.7)", fontSize: FONT_SIZE.xs, flexShrink: 1, textAlign: "right" },
  fieldNote: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, paddingVertical: 3 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: SPACING.xs },
  itemName: { color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.sm, fontWeight: "600" },
  itemQty: { color: COLORS.textMuted, fontWeight: "400" },
  itemExtra: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  itemPrice: { color: "rgba(255,255,255,0.6)", fontSize: FONT_SIZE.sm, flexShrink: 0 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  totalLabelVal: { color: "rgba(255,255,255,0.5)", fontSize: FONT_SIZE.xs },
  totalFinal: { paddingTop: SPACING.xs, marginTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalFinalLabel: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  totalFinalVal: { color: COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  noteBlock: { borderColor: "rgba(251,191,36,0.2)", backgroundColor: "rgba(251,191,36,0.03)" },
  noteText: { color: "rgba(251,191,36,0.7)", fontSize: FONT_SIZE.sm, fontStyle: "italic" },
  actionBtn: {
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md,
    alignItems: "center", justifyContent: "center", minHeight: 44,
  },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnDanger: { backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: "#fff", fontSize: FONT_SIZE.md, fontWeight: "700" },
  actionBtnTextDanger: { color: "#f87171" },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────

const OrdersListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    orders, loading, loadingAction,
    fetchOrders, startPolling, stopPolling,
    updateOrderStatus, cancelOrder, nextStatus,
  } = useResAdminOrders();

  const [activeFilter, setActiveFilter] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Carga inicial + polling
  useEffect(() => {
    const params = STATUS_FILTERS[activeFilter].params;
    fetchOrders(params);
    stopPolling();
    startPolling(params);
    return () => stopPolling();
  }, [activeFilter]);

  // Re-fetch al volver a la pantalla
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchOrders(STATUS_FILTERS[activeFilter].params);
    });
    return unsub;
  }, [navigation, activeFilter]);

  const openDetail = useCallback((order) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  }, []);

  const handleAdvanceStatus = useCallback(async (order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setActionLoadingId(order._id);
    const result = await updateOrderStatus(order._id, order.status, next);
    setActionLoadingId(null);
    if (!result.ok) Alert.alert("Error", result.message || "No se pudo actualizar el estado");
  }, [nextStatus, updateOrderStatus]);

  const handleUpdateStatusFromModal = useCallback(async (order, nextSt) => {
    if (nextSt === ORDER_STATUS.CANCELADO) {
      setDetailVisible(false);
      setCancelTarget(order);
      setCancelVisible(true);
      return;
    }
    const result = await updateOrderStatus(order._id, order.status, nextSt);
    if (result.ok) {
      setDetailVisible(false);
      setSelectedOrder(null);
    } else {
      Alert.alert("Error", result.message || "No se pudo actualizar");
    }
  }, [updateOrderStatus]);

  const handleCancelFromCard = useCallback((order) => {
    setCancelTarget(order);
    setCancelVisible(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelVisible(false);
    setActionLoadingId(cancelTarget._id);
    const result = await cancelOrder(cancelTarget._id);
    setActionLoadingId(null);
    setCancelTarget(null);
    if (!result.ok) Alert.alert("Error", result.message || "No se pudo cancelar el pedido");
  }, [cancelTarget, cancelOrder]);

  const pendingCount = orders.filter((o) => o.status === ORDER_STATUS.PENDIENTE).length;

  const renderItem = useCallback(({ item }) => (
    <OrderCard
      order={item}
      onViewDetail={openDetail}
      onAdvanceStatus={handleAdvanceStatus}
      onCancel={handleCancelFromCard}
      loadingAction={actionLoadingId}
    />
  ), [openDetail, handleAdvanceStatus, handleCancelFromCard, actionLoadingId]);

  return (
    <View style={styles.container}>
      {/* ── Header — FIX: paddingTop dinámico con insets ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Pedidos</Text>
            {pendingCount > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  {pendingCount} nuevo{pendingCount !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {orders.length} pedido{orders.length !== 1 ? "s" : ""}
            {" \u00B7 actualiza cada 30 s"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => fetchOrders(STATUS_FILTERS[activeFilter].params)}
          style={[styles.refreshBtn, loading && styles.refreshBtnDisabled]}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <MaterialIcons name="refresh" size={22} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      {/* ── Filtros — FIX: altura fija para que no crezca con lista vacía ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersBar}
        contentContainerStyle={styles.filtersContent}
      >
        {STATUS_FILTERS.map(({ label }, idx) => (
          <TouchableOpacity
            key={label}
            onPress={() => setActiveFilter(idx)}
            style={[styles.filterTab, activeFilter === idx && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, activeFilter === idx && styles.filterTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Lista ── */}
      {loading && orders.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="receipt-long" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No hay pedidos</Text>
          <Text style={styles.emptySubtitle}>
            {STATUS_FILTERS[activeFilter].label === "Activos"
              ? "Sin pedidos activos en este momento"
              : `Sin pedidos en "${STATUS_FILTERS[activeFilter].label}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Modal detalle ── */}
      <OrderDetailModal
        visible={detailVisible}
        order={selectedOrder}
        onClose={() => { setDetailVisible(false); setSelectedOrder(null); }}
        onUpdateStatus={handleUpdateStatusFromModal}
        loadingAction={actionLoadingId}
      />

      {/* ── Modal confirmación cancelar ── */}
      <Modal visible={cancelVisible} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <MaterialIcons name="warning" size={40} color="#f87171" style={{ marginBottom: SPACING.md }} />
            <Text style={styles.confirmTitle}>¿Cancelar pedido?</Text>
            <Text style={styles.confirmMsg}>
              El pedido #{cancelTarget?._id?.slice(-6).toUpperCase()} será cancelado. Esta acción no se puede deshacer.
            </Text>
            <View style={styles.confirmActions}>
              <Button
                title="Volver"
                onPress={() => { setCancelVisible(false); setCancelTarget(null); }}
                style={styles.confirmBtnBack}
                textStyle={{ color: COLORS.text }}
              />
              <Button
                title="Sí, cancelar"
                onPress={handleConfirmCancel}
                style={styles.confirmBtnConfirm}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // FIX: paddingTop se aplica inline con insets — aquí solo va paddingBottom
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  pendingBadge: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  pendingBadgeText: { color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: "700" },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  refreshBtn: { padding: SPACING.xs, marginTop: 2 },
  refreshBtnDisabled: { opacity: 0.5 },

  // FIX: height fija para que el ScrollView horizontal no se expanda verticalmente
  filtersBar: {
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: "center",
    height: 52,
  },
  filterTab: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { color: "rgba(255,255,255,0.4)", fontSize: FONT_SIZE.xs, fontWeight: "600" },
  filterTabTextActive: { color: "#fff" },

  listContent: { padding: SPACING.lg },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md },
  emptyTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textAlign: "center", paddingHorizontal: SPACING.xl },

  confirmOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center" },
  confirmBox: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl, width: "85%", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  confirmTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginBottom: SPACING.sm },
  confirmMsg: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textAlign: "center", marginBottom: SPACING.lg },
  confirmActions: { flexDirection: "row", gap: SPACING.md, width: "100%" },
  confirmBtnBack: { flex: 1, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  confirmBtnConfirm: { flex: 1, backgroundColor: "#ef4444" },
});

export default OrdersListScreen;