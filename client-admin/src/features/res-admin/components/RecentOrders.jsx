//Muestra movimientos recientes de pedidos
import { useNavigate } from 'react-router-dom';
import { OrderStatusBadge } from '../../orders/components/OrderStatusBadge.jsx';
import { formatDate } from '../../../shared/utils/formatters.js';

export const RecentMovements = ({ orders = [] }) => {
    const navigate = useNavigate();
    const recent = orders.slice(0, 5);

    return (
        <div className='bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-white/[0.05]'>
                <div>
                    <h2 className='text-white font-semibold text-base'>Pedidos recientes</h2>
                    <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Últimos pedidos del restaurante
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/orders')}
                    className='text-xs font-medium hover:opacity-70 transition cursor-pointer'
                    style={{ color: '#F2509C' }}
                >
                    Ver todos
                </button>
            </div>

            <div className='divide-y divide-white/[0.03]'>
                {recent.length === 0 ? (
                    <p className='text-center py-8 text-sm' style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Sin pedidos registrados
                    </p>
                ) : (
                    recent.map((order) => (
                        <div key={order._id} className='flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors'>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-white truncate'>
                                    {order.user?.name ?? 'Cliente'}
                                </p>
                                <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    #{order._id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <span className='text-sm font-semibold text-white shrink-0'>
                                Q{order.total?.toFixed(2)}
                            </span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};