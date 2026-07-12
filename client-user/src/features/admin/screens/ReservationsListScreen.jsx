// client-user/src/features/admin/screens/ReservationsListScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import { useResAdminReservations } from "../../reservations/hooks/useReservations";

// Valores de status alineados con el backend:
// PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA
const STATUS_TRANSITIONS = {
  PENDIENTE: ["CONFIRMADA", "CANCELADA"],
  CONFIRMADA: [],   // El backend solo permite confirmar/cancelar desde PENDIENTE vía token
  FINALIZADA: [],
  CANCELADA: [],
};

const STATUS_FILTERS = ["TODOS", "PENDIENTE", "CONFIRMADA", "FINALIZADA", "CANCELADA"];

const STATUS_CONFIG = {
  PENDIENTE: { label: "Pendiente", color: "#fbbf24", icon: "hourglass-empty" },
  CONFIRMADA: { label: "Confirmada", color: "#4ade80", icon: "check-circle-outline" },
  FINALIZADA: { label: "Finalizada", color: "#60a5fa", icon: "done-all" },
  CANCELADA: { label: "Cancelada", color: "#f87171", icon: "cancel" },
};

const STATUS_ACTION_LABELS = {
  CONFIRMADA: "Confirmar reservación",
  CANCELADA: "Cancelar reservación",
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: COLORS.textMuted };
  return (
    <View
      style={[
        badge.wrap,
        {
          backgroundColor: `${cfg.color}20`,
          borderColor: `${cfg.color}30`,
        },
      ]}
    >
      <View style={[badge.dot, { backgroundColor: cfg.color }]} />
      <Text style={[badge.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const badge = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
});

// ─── Card ─────────────────────────────────────────────────────────────────────
const ReservationCard = ({ item, onManage }) => {
  const transitions = STATUS_TRANSITIONS[item.status] ?? [];
  const isTerminal = transitions.length === 0;

  return (
    <Card style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName}>{item.peopleName}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <MaterialIcons name="people" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {item.peopleNumber} persona{item.peopleNumber !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {item.reservationDate
              ? new Date(item.reservationDate).toLocaleDateString("es-GT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "—"}
            {item.reservationHour ? ` · ${item.reservationHour}` : ""}
          </Text>
        </View>
        {item.tableId && (
          <View style={styles.detailRow}>
            <MaterialIcons
              name="table-restaurant"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>
              Mesa {item.tableId?.tableNumber || item.tableId}
            </Text>
          </View>
        )}
      </View>

      {item.observation ? (
        <View style={styles.observationBox}>
          <Text style={styles.observationText}>"{item.observation}"</Text>
        </View>
      ) : null}

      {!isTerminal && (
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => onManage(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.manageBtnText}>Gestionar reservación</Text>
          <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

// ─── Modal de gestión ─────────────────────────────────────────────────────────
const ManageModal = ({ visible, reservation, onClose, onUpdateStatus, loading }) => {
  if (!reservation) return null;
  const transitions = STATUS_TRANSITIONS[reservation.status] ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={mdl.overlay}>
        <View style={mdl.sheet}>
          <View style={mdl.header}>
            <View>
              <Text style={mdl.title}>Gestionar reservación</Text>
              <Text style={mdl.sub}>{reservation.peopleName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={mdl.closeBtn}>
              <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={mdl.body}>
            <Text style={mdl.currentLabel}>Estado actual</Text>
            <StatusBadge status={reservation.status} />

            {transitions.length > 0 && (
              <>
                <Text style={mdl.actionsLabel}>Cambiar a</Text>
                <View style={mdl.actionsGrid}>
                  {transitions.map((nextStatus) => {
                    const isDanger = nextStatus === "CANCELADA";
                    return (
                      <TouchableOpacity
                        key={nextStatus}
                        style={[
                          mdl.actionBtn,
                          isDanger ? mdl.actionBtnDanger : mdl.actionBtnPrimary,
                          loading && mdl.actionBtnDisabled,
                        ]}
                        onPress={() => onUpdateStatus(reservation._id, nextStatus)}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color={isDanger ? "#f87171" : "#fff"}
                          />
                        ) : (
                          <Text
                            style={[
                              mdl.actionBtnText,
                              isDanger && mdl.actionBtnTextDanger,
                            ]}
                          >
                            {STATUS_ACTION_LABELS[nextStatus] || nextStatus}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <TouchableOpacity style={mdl.cancelBtn} onPress={onClose}>
              <Text style={mdl.cancelBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const mdl = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  title: { color: "#fff", fontSize: FONT_SIZE.lg, fontWeight: "700" },
  sub: { color: "rgba(255,255,255,0.7)", fontSize: FONT_SIZE.xs, marginTop: 2 },
  closeBtn: { padding: 4 },
  body: { padding: SPACING.lg, gap: SPACING.md },
  currentLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  actionsLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  actionsGrid: { gap: SPACING.sm },
  actionBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnDanger: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: "#fff", fontSize: FONT_SIZE.md, fontWeight: "700" },
  actionBtnTextDanger: { color: "#f87171" },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cancelBtnText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────
const ReservationsListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    reservations,
    loading,
    error,
    fetchReservations,
    updateReservationStatus,
  } = useResAdminReservations();

  const [filter, setFilter] = useState("PENDIENTE");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchReservations();
    });
    return unsubscribe;
  }, [navigation, fetchReservations]);

  const handleManage = useCallback((reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  }, []);

  const handleUpdateStatus = useCallback(
    async (reservationId, newStatus) => {
      setActionLoading(true);
      const result = await updateReservationStatus(reservationId, newStatus);
      setActionLoading(false);

      if (result.success) {
        setModalVisible(false);
        setSelectedReservation(null);
        Alert.alert("Éxito", "Estado de la reservación actualizado");
      } else {
        Alert.alert("Error", result.error || "No se pudo actualizar el estado");
      }
    },
    [updateReservationStatus]
  );

  const filteredReservations =
    filter === "TODOS"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <View style={styles.container}>
      {/* Header con Safe Area */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.screenTitle}>Reservaciones</Text>
        <TouchableOpacity
          onPress={fetchReservations}
          style={[styles.refreshBtn, loading && { opacity: 0.5 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <MaterialIcons name="refresh" size={22} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive,
              ]}
            >
              {STATUS_CONFIG[status]?.label || status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading && filteredReservations.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredReservations.length > 0 ? (
        <FlatList
          data={filteredReservations}
          renderItem={({ item }) => (
            <ReservationCard item={item} onManage={handleManage} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No hay reservaciones</Text>
          <Text style={styles.emptySubtext}>
            {filter === "TODOS"
              ? "Sin reservaciones registradas"
              : `Sin reservaciones en "${STATUS_CONFIG[filter]?.label || filter}"`}
          </Text>
        </View>
      )}

      <ManageModal
        visible={modalVisible}
        reservation={selectedReservation}
        onClose={() => {
          setModalVisible(false);
          setSelectedReservation(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        loading={actionLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  refreshBtn: { padding: SPACING.xs },
  filterBar: {
    flexGrow: 0,
    flexShrink: 0,
    height: 52,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: "center",
    height: 52,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  filterTextActive: { color: "#fff" },
  listContent: { padding: SPACING.lg },
  reservationCard: { marginBottom: SPACING.md, padding: SPACING.md },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  guestName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailsGrid: { gap: SPACING.sm, marginBottom: SPACING.sm },
  detailRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  detailText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1 },
  observationBox: {
    backgroundColor: "rgba(251,191,36,0.05)",
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  observationText: {
    color: "rgba(251,191,36,0.7)",
    fontSize: FONT_SIZE.xs,
    fontStyle: "italic",
  },
  manageBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  manageBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  emptyText: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
  },
});

export default ReservationsListScreen;