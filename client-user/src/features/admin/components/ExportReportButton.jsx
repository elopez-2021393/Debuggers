// client-user/src/features/admin/components/ExportReportButton.jsx

import React, { useState, useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
};

const buildPlataformaHtml = (reporte) => {
  const kpis = [
    { label: "Ingresos totales", value: `Q${reporte.totalIngresosPlataforma?.toFixed(2)}` },
    { label: "Subtotal (sin IVA)", value: `Q${reporte.totalSubtotalPlataforma?.toFixed(2)}` },
    { label: "IVA (12%)", value: `Q${reporte.totalIvaPlataforma?.toFixed(2)}` },
    { label: "Pedidos entregados", value: reporte.totalPedidosPlataforma },
    { label: "Restaurantes activos", value: reporte.totalRestaurantes },
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
    `<tr>${cells
      .map(
        (c) =>
          `<td style="padding:8px 4px;border-bottom:1px solid rgba(255,255,255,0.05);color:${c.bold ? "#f2f2f2" : "rgba(255,255,255,0.65)"};text-align:${c.right ? "right" : "left"};">${c.text}</td>`
      )
      .join("")}</tr>`;

  const platosRows = (reporte.platosMasVendidosGlobal || [])
    .map((r, i) =>
      tableRow([
        { text: i + 1 },
        { text: r.nombre },
        { text: r.restauranteNombre ?? "—" },
        { text: r.cantidadVendida, right: true },
        { text: `Q${r.ingresoGenerado?.toFixed(2)}`, right: true, bold: true },
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
  <h1>Reporte de <span class="pink">Plataforma</span></h1>
  <div class="meta">Calculado el ${formatDate(reporte.fechaCalculo)} · ${formatTime(reporte.fechaCalculo)}</div>

  <div class="kpis">${kpisHtml}</div>

  <div class="section-title">Top 10 platos más vendidos — global</div>
  <table>
    <thead><tr><th>#</th><th>Plato</th><th>Restaurante</th><th class="r">Vendidos</th><th class="r">Ingresos</th></tr></thead>
    <tbody>${platosRows}</tbody>
  </table>

  <div class="footer">
    <span>DebuggersEats — Sistema de reportes</span>
    <span>Generado: ${formatDate(new Date().toISOString())}</span>
  </div>
</body>
</html>`;
};

const ExportReportButton = ({ report, loading }) => {
  const [exportando, setExportando] = useState(false);

  const handleExport = useCallback(async () => {
    if (!report) return;
    setExportando(true);
    try {
      const html = buildPlataformaHtml(report);
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
  }, [report]);

  const isLoading = loading || exportando;

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handleExport}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.text} />
      ) : (
        <MaterialIcons name="picture-as-pdf" size={18} color={COLORS.text} />
      )}
      <Text style={styles.buttonText}>{isLoading ? "Exportando..." : "Exportar PDF"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
});

export default ExportReportButton;