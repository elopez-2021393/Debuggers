// client-user/src/features/reservations/screens/ReservationsListScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
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
import { useReservations } from "../hooks/useReservations.js";

// Valores de status alineados con el backend:
// PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA
const CANCELABLE_STATUSES = ["PENDIENTE", "CONFIRMADA"];

const STATUS_FILTERS = ["TODOS", "PENDIENTE", "CONFIRMADA", "FINALIZADA", "CANCELADA"];

const STATUS_CONFIG = {
  PENDIENTE: { label: "Pendiente", color: "#fbbf24", icon: "hourglass-empty" },
  CONFIRMADA: { label: "Confirmada", color: "#4ade80", icon: "check-circle-outline" },
  FINALIZADA: { label: "Finalizada", color: "#60a5fa", icon: "done-all" },
  CANCELADA: { label: "Cancelada", color: "#f87171", icon: "cancel" },
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
const ReservationCard = ({ item, onCancel, cancelingId }) => {
  const isCancelable = CANCELABLE_STATUSES.includes(item.status);
  const isCanceling = cancelingId === item._id;

  return (
    <Card style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          {item.restaurantName ? (
            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          ) : null}
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

      {isCancelable && (
        <TouchableOpacity
          style={[styles.cancelBtn, isCanceling && styles.cancelBtnDisabled]}
          onPress={() => onCancel(item)}
          disabled={isCanceling}
          activeOpacity={0.8}
        >
          {isCanceling ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <>
              <Text style={styles.cancelBtnText}>Cancelar reservación</Text>
              <MaterialIcons name="close" size={16} color="#f87171" />
            </>
          )}
        </TouchableOpacity>
      )}
    </Card>
  );
};

// ─── Pantalla principal ───────────────────────────────────────────────────────
const ReservationsListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    reservations,
    loading,
    error,
    fetchMyReservations,
    cancelReservation,
  } = useReservations();

  const [filter, setFilter] = useState("TODOS");
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchMyReservations();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMyReservations();
    });
    return unsubscribe;
  }, [navigation, fetchMyReservations]);

  const handleCancel = useCallback(
    (reservation) => {
      Alert.alert(
        "Cancelar reservación",
        `¿Seguro que deseas cancelar la reservación de "${reservation.peopleName}"${reservation.restaurantName ? ` en ${reservation.restaurantName}` : ""
        }?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, cancelar",
            style: "destructive",
            onPress: async () => {
              try {
                setCancelingId(reservation._id);
                await cancelReservation(reservation._id);
                await fetchMyReservations();
              } catch (err) {
                Alert.alert(
                  "Error",
                  err.response?.data?.message ||
                  err.response?.data?.error ||
                  "No se pudo cancelar la reservación"
                );
              } finally {
                setCancelingId(null);
              }
            },
          },
        ]
      );
    },
    [cancelReservation, fetchMyReservations]
  );

  const filteredReservations =
    filter === "TODOS"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <View style={styles.container}>
      {/* Header con Safe Area */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.screenTitle}>Mis Reservaciones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateReservation")}
            style={styles.headerBtn}
          >
            <MaterialIcons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fetchMyReservations}
            style={[styles.headerBtn, loading && { opacity: 0.5 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialIcons name="refresh" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
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
              {status === "TODOS" ? "Todos" : STATUS_CONFIG[status]?.label || status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={18} color="#f87171" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Lista */}
      {loading && filteredReservations.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredReservations.length > 0 ? (
        <FlatList
          data={filteredReservations}
          renderItem={({ item }) => (
            <ReservationCard
              item={item}
              onCancel={handleCancel}
              cancelingId={cancelingId}
            />
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
              ? "Aún no tienes reservaciones registradas"
              : `Sin reservaciones en "${STATUS_CONFIG[filter]?.label || filter}"`}
          </Text>
          {filter === "TODOS" && (
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate("CreateReservation")}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.emptyActionText}>Nueva reservación</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  headerBtn: { padding: SPACING.xs },
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  errorText: { color: "#f87171", fontSize: FONT_SIZE.sm, flex: 1 },
  listContent: { padding: SPACING.lg },
  reservationCard: { marginBottom: SPACING.md, padding: SPACING.md },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  restaurantName: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
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
  cancelBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: {
    color: "#f87171",
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
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.sm,
  },
  emptyActionText: { color: "#fff", fontSize: FONT_SIZE.sm, fontWeight: "700" },
});

export default ReservationsListScreen;