import { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { FuenteBadge } from '../components/FuenteBadge.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { BarChart } from '../components/BarChart.jsx';
import { ReportTable } from '../components/ReportTable.jsx';
import { ExportPdfButton } from '../components/ExportPdfButton.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { exportReporteRestaurantePdf } from '../utils/reportPdf.js';

const TABS = [
    { key: 'ingresos', label: 'Ingresos por día' },
    { key: 'platos', label: 'Platos más vendidos' },
    { key: 'horas', label: 'Horas pico' },
];

const COLS_INGRESOS = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'ingresos', label: 'Ingresos', align: 'right', className: 'text-white font-semibold', render: (r) => `Q${r.ingresos.toFixed(2)}` },
    { key: 'cantidadPedidos', label: 'Pedidos', align: 'right' },
];

const COLS_PLATOS = [
    { key: 'idx', label: '#', render: (_, i) => <span className='text-white/20'>{i + 1}</span> },
    { key: 'nombre', label: 'Plato', className: 'text-white/80 font-medium' },
    { key: 'cantidadVendida', label: 'Vendidos', align: 'right' },
    { key: 'ingresoGenerado', label: 'Ingresos', align: 'right', className: 'text-white font-semibold', render: (r) => `Q${r.ingresoGenerado.toFixed(2)}` },
];

const COLS_HORAS = [
    { key: 'horaFormateada', label: 'Hora', className: 'text-white/70' },
    { key: 'cantidadPedidos', label: 'Pedidos', align: 'right', className: 'text-white font-semibold' },
];

export const ReporteRestaurantePage = () => {
    const { reporte, loading, error, fetchReporte, limpiarCache } = useReports();
    const { openConfirm } = useUIStore();
    const [tab, setTab] = useState('ingresos');
    const [exportando, setExportando] = useState(false);

    useEffect(() => { fetchReporte(); }, [fetchReporte]);
    useEffect(() => { if (error) showError(error); }, [error]);

    const handleLimpiarCache = () =>
        openConfirm({
            title: 'Limpiar caché',
            message: 'Se recalculará el reporte desde cero consultando MongoDB. ¿Continuar?',
            onConfirm: limpiarCache,
        });

    const handleExportarPDF = async () => {
        if (!reporte) return;
        setExportando(true);
        try {
            exportReporteRestaurantePdf(reporte);
            showSuccess('PDF exportado exitosamente');
        } catch {
            showError('Error al exportar el PDF');
        } finally {
            setExportando(false);
        }
    };

    if (loading && !reporte) return <Spinner />;

    return (
        <section className='p-4 space-y-5'>
            <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <hgroup>
                    <h1 className='text-3xl font-bold text-white'>Reporte del restaurante</h1>
                    <div className='flex items-center gap-3 mt-1'>
                        <p className='text-sm text-white/50'>
                            {reporte?.fechaCalculo
                                ? `Calculado el ${formatDate(reporte.fechaCalculo)} · ${formatTime(reporte.fechaCalculo)}`
                                : 'Sin datos aún'}
                        </p>
                        {reporte && <FuenteBadge fuente={reporte.fuente} />}
                    </div>
                </hgroup>
                <div className='flex gap-2 self-start md:self-auto'>
                    <button
                        onClick={handleLimpiarCache}
                        disabled={loading}
                        className='px-4 py-2 rounded-lg text-sm font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50'
                    >
                        {loading ? '...' : 'Forzar recálculo'}
                    </button>
                    {reporte && <ExportPdfButton onClick={handleExportarPDF} loading={exportando} />}
                </div>
            </header>

            {!reporte ? (
                <p className='rounded-xl p-6 text-center text-sm text-white/30 bg-[#16161f] border border-white/[0.06]'>
                    No hay datos de reportes aún.
                </p>
            ) : (
                <div className='space-y-5'>
                    <div className='grid grid-cols-2 xl:grid-cols-3 gap-3'>
                        <StatCard label='Ingresos totales' value={`Q${reporte.totalIngresos?.toFixed(2)}`} />
                        <StatCard label='Subtotal (sin IVA)' value={`Q${reporte.totalSubtotal?.toFixed(2)}`} />
                        <StatCard label='IVA (12%)' value={`Q${reporte.totalIva?.toFixed(2)}`} />
                        <StatCard label='Pedidos entregados' value={reporte.totalPedidos} />
                        <StatCard label='Ticket promedio' value={`Q${reporte.promedioTicket?.toFixed(2)}`} />
                        <div className='col-span-2 xl:col-span-1'>
                            <StatCard label='Platos en menú' value={reporte.platosMasVendidos?.length ?? 0} sub='con ventas registradas' />
                        </div>
                    </div>

                    <div className='flex gap-2 flex-wrap'>
                        {TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === key
                                    ? 'dbe-btn-primary'
                                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className='rounded-xl bg-[#16161f] border border-white/[0.06] p-5 space-y-4'>
                        {tab === 'ingresos' && (
                            <>
                                <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>Ingresos por día</p>
                                {reporte.ingresosPorDia?.length === 0 ? (
                                    <p className='text-sm text-white/30'>Sin datos.</p>
                                ) : (
                                    <>
                                        <BarChart data={reporte.ingresosPorDia} labelKey='fecha' valueKey='ingresos' formatValue={(v) => `Q${v.toFixed(2)}`} />
                                        <ReportTable columns={COLS_INGRESOS} rows={reporte.ingresosPorDia} />
                                    </>
                                )}
                            </>
                        )}
                        {tab === 'platos' && (
                            <>
                                <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>Top 10 platos más vendidos</p>
                                {reporte.platosMasVendidos?.length === 0 ? (
                                    <p className='text-sm text-white/30'>Sin datos.</p>
                                ) : (
                                    <>
                                        <BarChart data={reporte.platosMasVendidos} labelKey='nombre' valueKey='cantidadVendida' formatValue={(v) => `${v} uds`} />
                                        <ReportTable columns={COLS_PLATOS} rows={reporte.platosMasVendidos} />
                                    </>
                                )}
                            </>
                        )}
                        {tab === 'horas' && (
                            <>
                                <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>Horas pico (hora local Guatemala)</p>
                                {reporte.horasPico?.length === 0 ? (
                                    <p className='text-sm text-white/30'>Sin datos.</p>
                                ) : (
                                    <>
                                        <BarChart data={reporte.horasPico} labelKey='horaFormateada' valueKey='cantidadPedidos' formatValue={(v) => `${v} pedidos`} />
                                        <ReportTable columns={COLS_HORAS} rows={reporte.horasPico} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};