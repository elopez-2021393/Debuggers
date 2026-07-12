// client-user/src/features/admin/screens/ResAdminDashboardScreen.jsx

import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import { useResAdminStats } from "../hooks/useResAdminStats";
import ProfileMenu from "../components/ProfileMenu";

// ─── Configuración ─────────────────────────────────────────────────────────────

const GESTION_ITEMS = [
  { title: "Menú", subtitle: "Gestionar platillos", icon: "restaurant-menu", route: "ResAdminMenu" },
  { title: "Mesas", subtitle: "Gestionar capacidad", icon: "table-restaurant", route: "ResAdminTables" },
  { title: "Eventos", subtitle: "Eventos del restaurante", icon: "celebration", route: "EventsList" },
  { title: "Reportes", subtitle: "Estadísticas detalladas", icon: "analytics", route: "ResAdminReports" },
];

const STATUS_COLOR = {
  Pendiente: "#fbbf24",
  Aceptado: "#60a5fa",
  "En_preparación": "#c084fc",
  Listo: COLORS.primary,
  Entregado: "#4ade80",
  Cancelado: "#f87171",
  CONFIRMADA: "#4ade80",
  CANCELADA: "#f87171",
  FINALIZADA: "rgba(255,255,255,0.3)",
};

// ─── Sub-componentes ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </View>
);

const SectionHeader = ({ title, linkLabel, onPress }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onPress ? (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.sectionLink}>{linkLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const RecentOrderRow = ({ order }) => {
  const color = STATUS_COLOR[order.status] ?? COLORS.textMuted;
  const statusLabel = order.status ?? "—";
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowMain}>
        <Text style={styles.listRowTitle}>#{order._id?.slice(-6).toUpperCase()}</Text>
        <Text style={styles.listRowMeta}>{statusLabel}</Text>
      </View>
      <Text style={styles.listRowAmount}>Q{order.total?.toFixed(2)}</Text>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
    </View>
  );
};

const RecentReservationRow = ({ reservation }) => {
  const color = STATUS_COLOR[reservation.status] ?? COLORS.textMuted;
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowMain}>
        <Text style={styles.listRowTitle}>{reservation.peopleName ?? "—"}</Text>
        <Text style={styles.listRowMeta}>{reservation.peopleNumber} personas</Text>
      </View>
      <Text style={[styles.listRowAmount, { color }]}>{reservation.status}</Text>
    </View>
  );
};

// ─── Pantalla principal ────────────────────────────────────────────────────────

const ResAdminDashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { loading, restaurant, orders, reservations, tables, reviews, reporte, refetch } = useResAdminStats();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const avgRating = useMemo(() =>
    reviews.length
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null,
    [reviews]
  );

  // Durante el refresh NO se usa loading → los valores anteriores permanecen
  const activeOrders = orders.filter((o) => o.status !== "Entregado" && o.status !== "Cancelado").length;
  const pendingOrders = orders.filter((o) => o.status === "Pendiente").length;
  const pendingReservations = reservations.filter((r) => r.status === "PENDIENTE").length;
  const activeTables = tables.filter((t) => t.isActive).length;

  const stats = [
    {
      label: "Pedidos activos",
      value: loading ? "—" : activeOrders,
      sub: `${pendingOrders} pendiente${pendingOrders !== 1 ? "s" : ""}`,
    },
    {
      label: "Reservaciones",
      value: loading ? "—" : reservations.length,
      sub: `${pendingReservations} pendiente${pendingReservations !== 1 ? "s" : ""}`,
    },
    {
      label: "Mesas activas",
      value: loading ? "—" : `${activeTables}/${tables.length}`,
      sub: "disponibles",
    },
    {
      label: "Ingresos totales",
      value: loading ? "—" : `Q${reporte?.totalIngresos?.toFixed(2) ?? "0.00"}`,
      sub: `${reporte?.totalPedidos ?? 0} entregados`,
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const recentReservations = reservations.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* ── Header con safe area y ProfileMenu alineado ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.headerTitle}>Mi Restaurante</Text>
          <Text style={styles.headerSubtitle}>Panel de administración</Text>
        </View>
        <ProfileMenu />
      </View>

      <View style={styles.content}>

        {/* ── Banner ── */}
        <View style={styles.banner}>
          {restaurant?.photo ? (
            <Image source={{ uri: restaurant.photo }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.bannerImagePlaceholder]}>
              <Text style={styles.bannerImageText}>
                {restaurant?.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerMeta}>Panel de administración</Text>
            <View style={styles.bannerTitleRow}>
              <Text style={styles.bannerName} numberOfLines={1}>
                {restaurant?.name ?? "Mi restaurante"}
              </Text>
              {avgRating ? (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {avgRating}</Text>
                  <Text style={styles.ratingCount}>({reviews.length})</Text>
                </View>
              ) : null}
            </View>
            {restaurant?.category ? (
              <Text style={styles.bannerCategory}>
                {restaurant.category.replace("_", " ")}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Stats 2×2 ── */}
        <View style={styles.statsGrid}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </View>

        {/* ── Pedidos recientes ── */}
        <SectionHeader
          title="Pedidos recientes"
          linkLabel="Ver todos"
          onPress={() => navigation.navigate("OrdersList")}
        />
        <View style={styles.listCard}>
          {recentOrders.length === 0
            ? <Text style={styles.emptyText}>Sin pedidos registrados</Text>
            : recentOrders.map((o) => <RecentOrderRow key={o._id} order={o} />)}
        </View>

        {/* ── Reservaciones recientes ── */}
        <SectionHeader
          title="Reservaciones recientes"
          linkLabel="Ver todas"
          onPress={() => navigation.navigate("ReservationsList")}
        />
        <View style={styles.listCard}>
          {recentReservations.length === 0
            ? <Text style={styles.emptyText}>Sin reservaciones registradas</Text>
            : recentReservations.map((r) => <RecentReservationRow key={r._id} reservation={r} />)}
        </View>

        {/* ── Gestión 2×2 ── */}
        <SectionHeader title="Gestión" />
        <View style={styles.gestionGrid}>
          {GESTION_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.gestionCard}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.gestionIcon}>
                <MaterialIcons name={item.icon} size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.gestionTitle}>{item.title}</Text>
              <Text style={styles.gestionSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </ScrollView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 1 },

  content: { padding: SPACING.lg, gap: SPACING.md },

  // Banner
  banner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1a0a10",
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, gap: SPACING.md, ...SHADOWS.sm,
  },
  bannerImage: {
    width: 56, height: 56, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  bannerImagePlaceholder: {
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  bannerImageText: { color: "#fff", fontSize: FONT_SIZE.xl, fontWeight: "700" },
  bannerInfo: { flex: 1 },
  bannerMeta: {
    color: "rgba(255,255,255,0.5)", fontSize: FONT_SIZE.xs,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3,
  },
  bannerTitleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, flexWrap: "wrap" },
  bannerName: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", flexShrink: 1 },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(251,191,36,0.15)", borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  ratingText: { color: "#fbbf24", fontSize: FONT_SIZE.xs, fontWeight: "700" },
  ratingCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  bannerCategory: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },

  // Stats 2×2
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  statCard: {
    width: "47.5%", flexGrow: 1,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, gap: 3, ...SHADOWS.sm,
  },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: "700" },
  statSub: { color: "rgba(255,255,255,0.25)", fontSize: FONT_SIZE.xs },

  // Section headers
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: SPACING.xs,
  },
  sectionTitle: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  sectionLink: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "600" },

  // Listas
  listCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: "hidden",
  },
  listRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.03)",
    gap: SPACING.sm,
  },
  listRowMain: { flex: 1, minWidth: 0 },
  listRowTitle: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  listRowMeta: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 1 },
  listRowAmount: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "700", flexShrink: 0 },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  emptyText: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.sm,
    textAlign: "center", paddingVertical: SPACING.lg,
  },

  // Gestión 2×2
  gestionGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  gestionCard: {
    width: "47.5%", flexGrow: 1,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, gap: SPACING.xs, ...SHADOWS.sm,
  },
  gestionIcon: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}18`,
    justifyContent: "center", alignItems: "center", marginBottom: SPACING.xs,
  },
  gestionTitle: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "700" },
  gestionSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
});

export default ResAdminDashboardScreen;