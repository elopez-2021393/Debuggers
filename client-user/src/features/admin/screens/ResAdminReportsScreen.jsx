// client-user/src/features/admin/screens/ResAdminReportsScreen.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { useResAdminReports } from "../hooks/useResAdminReports";
import { useAuthStore } from "../../../shared/store/authStore";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// ─── Utilidades ────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-GT", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
};

// ─── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "ingresos", label: "Ingresos por día" },
  { key: "platos", label: "Platos más vendidos" },
  { key: "horas", label: "Horas pico" },
];

// ─── Componentes reutilizables ─────────────────────────────────────────────────

const StatCard = ({ label, value, sub }) => (
  <View style={styles.statCard}>
    <Text style={styles.statCardLabel}>{label}</Text>
    <Text style={styles.statCardValue}>{value}</Text>
    {sub ? <Text style={styles.statCardSub}>{sub}</Text> : null}
  </View>
);

const BarChartRow = ({ label, value, maxValue, formattedValue }) => {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%` }]} />
      </View>
      <Text style={styles.barValue}>{formattedValue}</Text>
    </View>
  );
};

const SectionCard = ({ children }) => (
  <View style={styles.sectionCard}>{children}</View>
);

const SectionLabel = ({ children }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
);

const EmptyData = () => (
  <Text style={styles.emptyText}>Sin datos.</Text>
);

// ─── Exportar PDF (HTML → expo-print) ─────────────────────────────────────────

const buildHtml = (reporte) => {
  const kpis = [
    { label: "Ingresos totales", value: `Q${reporte.totalIngresos?.toFixed(2)}` },
    { label: "Subtotal (sin IVA)", value: `Q${reporte.totalSubtotal?.toFixed(2)}` },
    { label: "IVA (12%)", value: `Q${reporte.totalIva?.toFixed(2)}` },
    { label: "Pedidos entregados", value: reporte.totalPedidos },
    { label: "Ticket promedio", value: `Q${reporte.promedioTicket?.toFixed(2)}` },
  ];

  const kpisHtml = kpis
    .map(
      (k) => `
      <div style="background:#16161f;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;flex:1;min-width:120px;">
        <div style="color:rgba(255,255,255,0.4);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${k.label}</div>
        <div style="color:#f2f2f2;font-size:22px;font-weight:700;">${k.value}</div>
      </div>`
    )
    .join("");

  const tableRow = (cells) =>
    `<tr>${cells.map((c) => `<td style="padding:8px 4px;border-bottom:1px solid rgba(255,255,255,0.05);color:${c.bold ? "#f2f2f2" : "rgba(255,255,255,0.65)"};text-align:${c.right ? "right" : "left"};">${c.text}</td>`).join("")}</tr>`;

  const ingresosRows = (reporte.ingresosPorDia || [])
    .map((r) =>
      tableRow([
        { text: r.fecha },
        { text: `Q${r.ingresos.toFixed(2)}`, right: true, bold: true },
        { text: r.cantidadPedidos, right: true },
      ])
    )
    .join("");

  const platosRows = (reporte.platosMasVendidos || [])
    .map((r, i) =>
      tableRow([
        { text: i + 1 },
        { text: r.nombre },
        { text: r.cantidadVendida, right: true },
        { text: `Q${r.ingresoGenerado.toFixed(2)}`, right: true, bold: true },
      ])
    )
    .join("");

  const horasRows = (reporte.horasPico || [])
    .map((r) =>
      tableRow([
        { text: r.horaFormateada },
        { text: r.cantidadPedidos, right: true, bold: true },
      ])
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:sans-serif;background:#111118;color:#f2f2f2;margin:0;padding:32px;}
    h1{font-size:24px;font-weight:700;margin:0 0 4px;}
    .pink{color:#f2509c;}
    .meta{color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:28px;}
    .kpis{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;}
    table{width:100%;border-collapse:collapse;margin-bottom:28px;}
    th{text-align:left;padding:8px 4px;color:rgba(255,255,255,0.35);font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);}
    th.r{text-align:right;}
    .section-title{color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;margin-top:24px;}
    .footer{margin-top:40px;border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:rgba(255,255,255,0.25);font-size:10px;display:flex;justify-content:space-between;}
  </style>
</head>
<body>
  <div style="margin-bottom:6px;font-size:13px;font-weight:600;color:#f2f2f2;">Debuggers<span class="pink">Eats</span></div>
  <h1>Reporte de <span class="pink">${reporte.restauranteNombre ?? "Restaurante"}</span></h1>
  <div class="meta">Calculado el ${formatDate(reporte.fechaCalculo)} · ${formatTime(reporte.fechaCalculo)}</div>

  <div class="kpis">${kpisHtml}</div>

  <div class="section-title">Ingresos por día</div>
  <table>
    <thead><tr><th>Fecha</th><th class="r">Ingresos</th><th class="r">Pedidos</th></tr></thead>
    <tbody>${ingresosRows}</tbody>
  </table>

  <div class="section-title">Top 10 platos más vendidos</div>
  <table>
    <thead><tr><th>#</th><th>Plato</th><th class="r">Vendidos</th><th class="r">Ingresos</th></tr></thead>
    <tbody>${platosRows}</tbody>
  </table>

  <div class="section-title">Horas pico — hora local Guatemala</div>
  <table>
    <thead><tr><th>Hora</th><th class="r">Pedidos</th></tr></thead>
    <tbody>${horasRows}</tbody>
  </table>

  <div class="footer">
    <span>DebuggersEats — Sistema de reportes</span>
    <span>Generado: ${formatDate(new Date().toISOString())}</span>
  </div>
</body>
</html>`;
};

// ─── Pantalla principal ────────────────────────────────────────────────────────

const ResAdminReportsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const { reporte, loading, error, fetchReporte, limpiarCache } = useResAdminReports();
  const [activeTab, setActiveTab] = useState("ingresos");
  const [refreshing, setRefreshing] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Carga inicial una sola vez
  const didFetch = useRef(false);
  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      fetchReporte();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReporte();
    setTimeout(() => setRefreshing(false), 1200);
  }, [fetchReporte]);

  const handleForzarRecalculo = useCallback(() => {
    Alert.alert(
      "Forzar recálculo",
      "Se recalculará el reporte desde cero consultando la base de datos. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          onPress: async () => {
            const result = await limpiarCache();
            if (!result.ok) {
              Alert.alert("Error", result.message || "No se pudo limpiar el caché.");
            }
          },
        },
      ]
    );
  }, [limpiarCache]);

  const handleExportarPDF = useCallback(async () => {
    if (!reporte) return;
    setExportando(true);
    try {
      const html = buildHtml(reporte);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Exportar reporte PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el PDF.");
    } finally {
      setExportando(false);
    }
  }, [reporte]);

  // ── Datos del tab activo ──────────────────────────────────────────────────────

  const ingresosData = reporte?.ingresosPorDia ?? [];
  const platosData = reporte?.platosMasVendidos ?? [];
  const horasData = reporte?.horasPico ?? [];

  const maxIngresos = Math.max(...ingresosData.map((d) => d.ingresos), 1);
  const maxPlatos = Math.max(...platosData.map((d) => d.cantidadVendida), 1);
  const maxHoras = Math.max(...horasData.map((d) => d.cantidadPedidos), 1);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.screenHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Reporte del restaurante</Text>
          {reporte?.fechaCalculo ? (
            <Text style={styles.metaText}>
              Calculado el {formatDate(reporte.fechaCalculo)} · {formatTime(reporte.fechaCalculo)}
            </Text>
          ) : (
            <Text style={styles.metaText}>Sin datos aún</Text>
          )}
          {reporte?.fuente ? (
            <View style={styles.fuenteBadge}>
              <Text style={styles.fuenteBadgeText}>
                {reporte.fuente === "cache" ? "⚡ Desde caché" : "🔄 Desde base de datos"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
          onPress={handleForzarRecalculo}
          disabled={loading}
        >
          <MaterialIcons name="refresh" size={16} color={COLORS.textSecondary} />
          <Text style={styles.actionBtnText}>{loading ? "..." : "Forzar recálculo"}</Text>
        </TouchableOpacity>
        {reporte ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary, exportando && styles.actionBtnDisabled]}
            onPress={handleExportarPDF}
            disabled={exportando}
          >
            <MaterialIcons name="picture-as-pdf" size={16} color="#fff" />
            <Text style={styles.actionBtnTextPrimary}>
              {exportando ? "Exportando..." : "Exportar PDF"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.content}>
        {/* Loading spinner */}
        {loading && !reporte ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !reporte ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="bar-chart" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyContainerText}>No hay datos de reportes aún.</Text>
          </View>
        ) : (
          <>
            {/* KPI Cards */}
            <View style={styles.statsGrid}>
              <StatCard label="Ingresos totales" value={`Q${reporte.totalIngresos?.toFixed(2)}`} />
              <StatCard label="Subtotal (sin IVA)" value={`Q${reporte.totalSubtotal?.toFixed(2)}`} />
              <StatCard label="IVA (12%)" value={`Q${reporte.totalIva?.toFixed(2)}`} />
              <StatCard label="Pedidos entregados" value={reporte.totalPedidos} />
              <StatCard label="Ticket promedio" value={`Q${reporte.promedioTicket?.toFixed(2)}`} />
              <StatCard
                label="Platos en menú"
                value={reporte.platosMasVendidos?.length ?? 0}
                sub="con ventas registradas"
              />
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
              {TABS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveTab(key)}
                  style={[styles.tab, activeTab === key && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tab Content */}
            <SectionCard>
              {activeTab === "ingresos" && (
                <>
                  <SectionLabel>Ingresos por día</SectionLabel>
                  {ingresosData.length === 0 ? (
                    <EmptyData />
                  ) : (
                    <>
                      {ingresosData.map((item, idx) => (
                        <BarChartRow
                          key={idx}
                          label={item.fecha}
                          value={item.ingresos}
                          maxValue={maxIngresos}
                          formattedValue={`Q${item.ingresos.toFixed(2)}`}
                        />
                      ))}
                      <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Fecha</Text>
                          <Text style={[styles.tableHeaderCell, styles.right, { flex: 1.5 }]}>Ingresos</Text>
                          <Text style={[styles.tableHeaderCell, styles.right, { flex: 1 }]}>Pedidos</Text>
                        </View>
                        {ingresosData.map((row, idx) => (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{row.fecha}</Text>
                            <Text style={[styles.tableCell, styles.right, styles.tableCellBold, { flex: 1.5 }]}>
                              Q{row.ingresos.toFixed(2)}
                            </Text>
                            <Text style={[styles.tableCell, styles.right, { flex: 1 }]}>
                              {row.cantidadPedidos}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}

              {activeTab === "platos" && (
                <>
                  <SectionLabel>Top 10 platos más vendidos</SectionLabel>
                  {platosData.length === 0 ? (
                    <EmptyData />
                  ) : (
                    <>
                      {platosData.map((item, idx) => (
                        <BarChartRow
                          key={idx}
                          label={item.nombre}
                          value={item.cantidadVendida}
                          maxValue={maxPlatos}
                          formattedValue={`${item.cantidadVendida} uds`}
                        />
                      ))}
                      <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, { flex: 0.4 }]}>#</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Plato</Text>
                          <Text style={[styles.tableHeaderCell, styles.right, { flex: 1 }]}>Vendidos</Text>
                          <Text style={[styles.tableHeaderCell, styles.right, { flex: 1.2 }]}>Ingresos</Text>
                        </View>
                        {platosData.map((row, idx) => (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.tableIndexCell, { flex: 0.4 }]}>
                              {idx + 1}
                            </Text>
                            <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>
                              {row.nombre}
                            </Text>
                            <Text style={[styles.tableCell, styles.right, { flex: 1 }]}>
                              {row.cantidadVendida}
                            </Text>
                            <Text style={[styles.tableCell, styles.right, styles.tableCellBold, { flex: 1.2 }]}>
                              Q{row.ingresoGenerado.toFixed(2)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}

              {activeTab === "horas" && (
                <>
                  <SectionLabel>Horas pico (hora local Guatemala)</SectionLabel>
                  {horasData.length === 0 ? (
                    <EmptyData />
                  ) : (
                    <>
                      {horasData.map((item, idx) => (
                        <BarChartRow
                          key={idx}
                          label={item.horaFormateada}
                          value={item.cantidadPedidos}
                          maxValue={maxHoras}
                          formattedValue={`${item.cantidadPedidos} pedidos`}
                        />
                      ))}
                      <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Hora</Text>
                          <Text style={[styles.tableHeaderCell, styles.right, { flex: 1 }]}>Pedidos</Text>
                        </View>
                        {horasData.map((row, idx) => (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.tableCellMuted, { flex: 1 }]}>
                              {row.horaFormateada}
                            </Text>
                            <Text style={[styles.tableCell, styles.right, styles.tableCellBold, { flex: 1 }]}>
                              {row.cantidadPedidos}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
            </SectionCard>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  screenHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    marginBottom: 3,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  fuenteBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(242,80,156,0.12)",
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  fuenteBadgeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  actionBtnPrimary: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  actionBtnTextPrimary: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  centered: {
    paddingVertical: SPACING.xxl,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyContainerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
  },

  // KPI grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 4,
    ...SHADOWS.sm,
  },
  statCardLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statCardValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
  },
  statCardSub: {
    color: "rgba(255,255,255,0.25)",
    fontSize: FONT_SIZE.xs,
  },

  // Tabs
  tabsScroll: {
    marginBottom: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },

  // Section card
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptyText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: FONT_SIZE.sm,
  },

  // Bar chart
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    minHeight: 28,
  },
  barLabel: {
    width: 90,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: "right",
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  barValue: {
    width: 72,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    flexShrink: 0,
  },

  // Table
  tableContainer: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: SPACING.sm,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: SPACING.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  tableCell: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONT_SIZE.xs,
  },
  tableCellBold: {
    color: COLORS.text,
    fontWeight: "600",
  },
  tableCellMuted: {
    color: "rgba(255,255,255,0.5)",
  },
  tableIndexCell: {
    color: "rgba(255,255,255,0.2)",
  },
  right: {
    textAlign: "right",
  },
});

export default ResAdminReportsScreen;