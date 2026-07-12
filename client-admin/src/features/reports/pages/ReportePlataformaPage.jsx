import { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports.js';
import { FuenteBadge } from '../components/FuenteBadge.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { BarChart } from '../components/BarChart.jsx';
import { ReportTable } from '../components/ReportTable.jsx';
import { ExportPdfButton } from '../components/ExportPdfButton.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { exportReportePlataformaPdf } from '../utils/reportPdf.js';

const COLS_PLATOS = [
    { key: 'idx', label: '#', render: (_, i) => <span className='text-white/20'>{i + 1}</span> },
    { key: 'nombre', label: 'Plato', className: 'text-white/80 font-medium' },
    { key: 'restauranteNombre', label: 'Restaurante', className: 'text-white/50' },
    { key: 'cantidadVendida', label: 'Vendidos', align: 'right' },
    { key: 'ingresoGenerado', label: 'Ingresos', align: 'right', className: 'text-white font-semibold', render: (r) => `Q${r.ingresoGenerado.toFixed(2)}` },
];

export const ReportePlataformaPage = () => {
    const { reportePlataforma, loadingPlataforma, error, fetchReportePlataforma, limpiarCachePlataforma } = useReports();
    const [exportando, setExportando] = useState(false);

    useEffect(() => { fetchReportePlataforma(); }, [fetchReportePlataforma]);
    useEffect(() => { if (error) showError(error); }, [error]);

    const handleExportarPDF = async () => {
        if (!reportePlataforma) return;
        setExportando(true);
        try {
            exportReportePlataformaPdf(reportePlataforma);
            showSuccess('PDF exportado exitosamente');
        } catch {
            showError('Error al exportar el PDF');
        } finally {
            setExportando(false);
        }
    };

    if (loadingPlataforma && !reportePlataforma) return <Spinner />;

    return (
        <section className='p-4 space-y-5'>
            <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <hgroup>
                    <h1 className='text-3xl font-bold text-white'>Reporte de plataforma</h1>
                    <div className='flex items-center gap-3 mt-1'>
                        <p className='text-sm text-white/50'>
                            {reportePlataforma?.fechaCalculo
                                ? `Calculado el ${formatDate(reportePlataforma.fechaCalculo)} · ${formatTime(reportePlataforma.fechaCalculo)}`
                                : 'Sin datos aún'}
                        </p>
                        {reportePlataforma && <FuenteBadge fuente={reportePlataforma.fuente} />}
                    </div>
                </hgroup>
                <div className='flex gap-2 self-start md:self-auto'>
                    <button
                        onClick={limpiarCachePlataforma}
                        disabled={loadingPlataforma}
                        className='px-4 py-2 rounded-lg text-sm font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50'
                    >
                        {loadingPlataforma ? '...' : '↻ Actualizar'}
                    </button>
                    {reportePlataforma && <ExportPdfButton onClick={handleExportarPDF} loading={exportando} />}
                </div>
            </header>

            {!reportePlataforma ? (
                <p className='rounded-xl p-6 text-center text-sm text-white/30 bg-[#16161f] border border-white/[0.06]'>
                    No hay datos de plataforma aún.
                </p>
            ) : (
                <div className='space-y-5'>
                    <div className='grid grid-cols-2 xl:grid-cols-3 gap-3'>
                        <StatCard label='Ingresos totales' value={`Q${reportePlataforma.totalIngresosPlataforma?.toFixed(2)}`} />
                        <StatCard label='Subtotal (sin IVA)' value={`Q${reportePlataforma.totalSubtotalPlataforma?.toFixed(2)}`} />
                        <StatCard label='IVA (12%)' value={`Q${reportePlataforma.totalIvaPlataforma?.toFixed(2)}`} />
                        <StatCard label='Pedidos entregados' value={reportePlataforma.totalPedidosPlataforma} />
                        <StatCard label='Restaurantes activos' value={reportePlataforma.totalRestaurantes} sub='con al menos 1 pedido entregado' />
                    </div>

                    <div className='rounded-xl bg-[#16161f] border border-white/[0.06] p-5 space-y-4'>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>
                            Top 10 platos más vendidos — global
                        </p>
                        {reportePlataforma.platosMasVendidosGlobal?.length === 0 ? (
                            <p className='text-sm text-white/30'>Sin datos.</p>
                        ) : (
                            <>
                                <BarChart
                                    data={reportePlataforma.platosMasVendidosGlobal}
                                    labelKey='nombre'
                                    valueKey='cantidadVendida'
                                    formatValue={(v) => `${v} uds`}
                                />
                                <ReportTable columns={COLS_PLATOS} rows={reportePlataforma.platosMasVendidosGlobal} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};