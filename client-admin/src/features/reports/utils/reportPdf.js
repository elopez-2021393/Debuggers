//Archivo pdf de los reportes
import jsPDF from 'jspdf';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';

const PW = 595;
const PH = 842;
const M = 40;

//Colores
const rgb = {
    bg: [17, 17, 24],
    white: [255, 255, 255],
    muted: [100, 100, 110],
    faint: [50, 50, 60],
    pink: [242, 80, 156],
};

//helpers
const setupPage = (pdf) => {
    pdf.setFillColor(...rgb.bg);
    pdf.rect(0, 0, PW, PH, 'F');
};

const guard = (pdf, y) => {
    if (y > PH - 60) { pdf.addPage(); setupPage(pdf); return M; }
    return y;
};

const line = (pdf, y) => {
    pdf.setDrawColor(...rgb.faint);
    pdf.setLineWidth(0.3);
    pdf.line(M, y, PW - M, y);
    return y + 16;
};

//bloques
const drawHeader = (pdf, titulo, fecha) => {
    setupPage(pdf);
    let y = M + 16;

    //brand
    pdf.setFontSize(11).setTextColor(...rgb.white);
    pdf.text('Debuggers', M, y);
    pdf.setTextColor(...rgb.pink);
    pdf.text('Eats', M + pdf.getTextWidth('Debuggers'), y);

    y += 22;

    //título
    pdf.setFontSize(20).setTextColor(...rgb.white);
    pdf.text('Reporte de ', M, y);
    pdf.setTextColor(...rgb.pink);
    pdf.text(titulo, M + pdf.getTextWidth('Reporte de '), y);

    y += 14;

    //fecha
    pdf.setFontSize(9).setTextColor(...rgb.muted);
    pdf.text(`Calculado el ${formatDate(fecha)} · ${formatTime(fecha)}`, M, y);

    y += 20;
    return line(pdf, y);
};

const drawKpis = (pdf, kpis, y) => {
    const colW = (PW - M * 2) / kpis.length;
    kpis.forEach(({ label, value }, i) => {
        const cx = M + i * colW + colW / 2;
        pdf.setFontSize(8).setTextColor(...rgb.white);
        pdf.text(label.toUpperCase(), cx, y, { align: 'center' });
        pdf.setFontSize(18).setTextColor(...rgb.white);
        pdf.text(String(value), cx, y + 18, { align: 'center' });
    });
    return y + 36;
};

const drawTable = (pdf, title, cols, rows, y) => {
    y = guard(pdf, y + 10);

    pdf.setFontSize(8).setTextColor(...rgb.muted);
    pdf.text(title.toUpperCase(), M, y);
    y += 12;

    //encabezado
    cols.forEach(({ label, x, r }) => {
        const px = r ? PW - M - x : M + x;
        pdf.setFontSize(8).setTextColor(160, 160, 170);
        pdf.text(label.toUpperCase(), px, y, { align: r ? 'right' : 'left' });
    });
    y = line(pdf, y + 6);

    //filas
    rows.forEach((cells) => {
        y = guard(pdf, y);
        cells.forEach(({ text, x, r, bold }) => {
            const px = r ? PW - M - x : M + x;
            pdf.setFontSize(9.5).setTextColor(...(bold ? rgb.white : [190, 190, 200]));
            pdf.text(String(text ?? ''), px, y, { align: r ? 'right' : 'left' });
        });
        y += 16;
    });

    return y + 10;
};

//pie de página
const drawFooter = (pdf) => {
    const total = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(...rgb.faint).setLineWidth(0.3);
        pdf.line(M, PH - 28, PW - M, PH - 28);
        pdf.setFontSize(8).setTextColor(...rgb.faint);
        pdf.text('DebuggersEats — Sistema de reportes', M, PH - 16);
        pdf.text(`Página ${i} de ${total}`, PW - M, PH - 16, { align: 'right' });
    }
};

//export de reporte por restaurante
export const exportReporteRestaurantePdf = (reporte) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    let y = drawHeader(pdf, reporte.restauranteNombre ?? 'Restaurante', reporte.fechaCalculo);

    y = drawKpis(pdf, [
        { label: 'Ingresos totales', value: `Q${reporte.totalIngresos?.toFixed(2)}` },
        { label: 'Subtotal (sin IVA)', value: `Q${reporte.totalSubtotal?.toFixed(2)}` },
        { label: 'IVA (12%)', value: `Q${reporte.totalIva?.toFixed(2)}` },
        { label: 'Pedidos entregados', value: reporte.totalPedidos },
        { label: 'Ticket promedio', value: `Q${reporte.promedioTicket?.toFixed(2)}` },
    ], y);

    y = line(pdf, y + 10);
    y = drawTable(pdf, 'Ingresos por día',
        [{ label: 'Fecha', x: 0 }, { label: 'Ingresos', x: 60, r: true }, { label: 'Pedidos', x: 0, r: true }],
        reporte.ingresosPorDia?.map((r) => [
            { text: r.fecha, x: 0 },
            { text: `Q${r.ingresos.toFixed(2)}`, x: 60, r: true, bold: true },
            { text: r.cantidadPedidos, x: 0, r: true },
        ]) ?? [], y);

    y = line(pdf, y);
    y = drawTable(pdf, 'Top 10 platos más vendidos',
        [{ label: '#', x: 0 }, { label: 'Plato', x: 18 }, { label: 'Vendidos', x: 90, r: true }, { label: 'Ingresos', x: 0, r: true }],
        reporte.platosMasVendidos?.map((r, i) => [
            { text: i + 1, x: 0 },
            { text: r.nombre, x: 18 },
            { text: r.cantidadVendida, x: 90, r: true },
            { text: `Q${r.ingresoGenerado.toFixed(2)}`, x: 0, r: true, bold: true },
        ]) ?? [], y);

    y = line(pdf, y);
    drawTable(pdf, 'Horas pico — hora local Guatemala',
        [{ label: 'Hora', x: 0 }, { label: 'Pedidos', x: 0, r: true }],
        reporte.horasPico?.map((r) => [
            { text: r.horaFormateada, x: 0 },
            { text: r.cantidadPedidos, x: 0, r: true, bold: true },
        ]) ?? [], y);

    drawFooter(pdf);
    pdf.save(`reporte-restaurante-${formatDate(new Date().toISOString())}.pdf`);
};

//export de reporte de plataforma
export const exportReportePlataformaPdf = (reporte) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    let y = drawHeader(pdf, 'Plataforma', reporte.fechaCalculo);

    y = drawKpis(pdf, [
        { label: 'Ingresos totales', value: `Q${reporte.totalIngresosPlataforma?.toFixed(2)}` },
        { label: 'Subtotal (sin IVA)', value: `Q${reporte.totalSubtotalPlataforma?.toFixed(2)}` },
        { label: 'IVA (12%)', value: `Q${reporte.totalIvaPlataforma?.toFixed(2)}` },
        { label: 'Pedidos entregados', value: reporte.totalPedidosPlataforma },
        { label: 'Restaurantes activos', value: reporte.totalRestaurantes },
    ], y);

    y = line(pdf, y + 10);
    drawTable(pdf, 'Top 10 platos más vendidos — global',
        [{ label: '#', x: 0 }, { label: 'Plato', x: 18 }, { label: 'Restaurante', x: 180 }, { label: 'Vendidos', x: 70, r: true }, { label: 'Ingresos', x: 0, r: true }],
        reporte.platosMasVendidosGlobal?.map((r, i) => [
            { text: i + 1, x: 0 },
            { text: r.nombre, x: 18 },
            { text: r.restauranteNombre ?? '-', x: 180 },
            { text: r.cantidadVendida, x: 70, r: true },
            { text: `Q${r.ingresoGenerado.toFixed(2)}`, x: 0, r: true, bold: true },
        ]) ?? [], y);

    drawFooter(pdf);
    pdf.save(`reporte-plataforma-${formatDate(new Date().toISOString())}.pdf`);
};