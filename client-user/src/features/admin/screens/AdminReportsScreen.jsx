// client-user/src/features/admin/screens/AdminReportsScreen.jsx

import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAdminReports } from "../hooks/useAdminReports";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import ExportReportButton from "../components/ExportReportButton";

const StatCard = ({ label, value, sub }) => (
  <Card style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {sub && <Text style={styles.statSub}>{sub}</Text>}
  </Card>
);

const TopDishItem = ({ dish, index }) => (
  <View style={styles.topDishItem}>
    <View style={styles.topDishRank}>
      <Text style={styles.topDishRankText}>#{index + 1}</Text>
    </View>
    <View style={styles.topDishInfo}>
      <Text style={styles.topDishName}>{dish.nombre}</Text>
      <Text style={styles.topDishRestaurant}>{dish.restauranteNombre}</Text>
    </View>
    <View style={styles.topDishStats}>
      <Text style={styles.topDishQuantity}>{dish.cantidadVendida} uds</Text>
      <Text style={styles.topDishRevenue}>Q{dish.ingresoGenerado?.toFixed(2)}</Text>
    </View>
  </View>
);

const AdminReportsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { report, loading, error, fetchPlatformReport, clearCache, clearError } = useAdminReports();

  useEffect(() => {
    clearError();
    fetchPlatformReport();
  }, [fetchPlatformReport, clearError]);

  const handleRefresh = useCallback(async () => {
    await clearCache();
  }, [clearCache]);

  const formatDate = (dateString) => {
    if (!dateString) return "Sin datos";
    return new Date(dateString).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Reintentar" onPress={fetchPlatformReport} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header con Safe Area */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Reportes Plataforma</Text>
          <Text style={styles.screenSubtitle}>
            {report?.fechaCalculo
              ? `Calculado el ${formatDate(report.fechaCalculo)}`
              : "Sin datos aún"}
          </Text>
        </View>
        {report && <ExportReportButton report={report} loading={loading} />}
      </View>

      {/* Botón Recalcular */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
          onPress={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <MaterialIcons name="refresh" size={16} color={COLORS.textSecondary} />
          )}
          <Text style={styles.actionBtnText}>{loading ? "Calculando..." : "Recalcular"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!report ? (
          <Card style={styles.emptyCard}>
            <MaterialIcons name="analytics" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No hay datos</Text>
            <Text style={styles.emptySubtitle}>No hay datos de plataforma aún</Text>
          </Card>
        ) : (
          <View style={styles.content}>
            <View style={styles.statsGrid}>
              <StatCard
                label="Ingresos totales"
                value={`Q${report.totalIngresosPlataforma?.toFixed(2)}`}
              />
              <StatCard
                label="Subtotal (sin IVA)"
                value={`Q${report.totalSubtotalPlataforma?.toFixed(2)}`}
              />
              <StatCard
                label="IVA (12%)"
                value={`Q${report.totalIvaPlataforma?.toFixed(2)}`}
              />
              <StatCard
                label="Pedidos entregados"
                value={report.totalPedidosPlataforma}
              />
              <StatCard
                label="Restaurantes activos"
                value={report.totalRestaurantes}
                sub="con al menos 1 pedido entregado"
              />
            </View>

            <Card style={styles.topDishesCard}>
              <Text style={styles.sectionTitle}>Top 10 platos más vendidos — global</Text>
              {report.platosMasVendidosGlobal?.length === 0 ? (
                <Text style={styles.noDataText}>Sin datos</Text>
              ) : (
                <View style={styles.topDishesList}>
                  {report.platosMasVendidosGlobal?.map((dish, index) => (
                    <TopDishItem key={dish._id || index} dish={dish} index={index} />
                  ))}
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginBottom: 2 },
  screenSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  content: { padding: SPACING.xl },
  emptyCard: { padding: SPACING.xl, alignItems: "center", margin: SPACING.xl },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.lg, gap: SPACING.sm },
  statCard: {
    width: "48%",
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: "600", marginBottom: SPACING.xs },
  statValue: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: "700" },
  statSub: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: SPACING.xs },
  topDishesCard: { padding: SPACING.lg, ...SHADOWS.sm },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    marginBottom: SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topDishesList: { gap: SPACING.sm },
  topDishItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topDishRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  topDishRankText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: "700" },
  topDishInfo: { flex: 1 },
  topDishName: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  topDishRestaurant: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
  topDishStats: { alignItems: "flex-end" },
  topDishQuantity: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
  topDishRevenue: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: "700" },
  noDataText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    paddingVertical: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  errorText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textAlign: "center" },
  retryButton: { marginTop: SPACING.md },
});

export default AdminReportsScreen;