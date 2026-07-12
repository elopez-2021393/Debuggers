//Muestra ultimos movimientos de las reservaciones
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../shared/utils/formatters.js';

const STATUS_CONFIG = {
    PENDIENTE: { label: 'Pendiente', color: '#fbbf24' },
    CONFIRMADA: { label: 'Confirmada', color: '#4ade80' },
    CANCELADA: { label: 'Cancelada', color: '#f87171' },
    FINALIZADA: { label: 'Finalizada', color: 'rgba(255,255,255,0.3)' },
};

export const RecentReservations = ({ reservations = [] }) => {
    const navigate = useNavigate();
    const recent = reservations.slice(0, 5);

    return (
        <div className='bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06] w-full xl:w-72 shrink-0'>
            <div className='flex items-center justify-between px-5 py-4 border-b border-white/[0.05]'>
                <h2 className='text-white font-semibold text-sm'>Reservaciones recientes</h2>
                <button
                    onClick={() => navigate('/dashboard/reservations')}
                    className='text-xs font-medium hover:opacity-70 transition cursor-pointer'
                    style={{ color: '#F2509C' }}
                >
                    Ver todas
                </button>
            </div>

            <div className='divide-y divide-white/[0.03]'>
                {recent.length === 0 ? (
                    <p className='text-center py-8 text-sm' style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Sin reservaciones
                    </p>
                ) : (
                    recent.map((r) => {
                        const status = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDIENTE;
                        return (
                            <div key={r._id} className='flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-medium text-white truncate'>
                                        {r.peopleName ?? r.user?.name ?? 'Cliente'}
                                    </p>
                                    <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                        {formatDate(r.reservationDate)}
                                    </p>
                                </div>
                                <span className='text-xs font-semibold shrink-0 ml-3' style={{ color: status.color }}>
                                    {status.label}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};