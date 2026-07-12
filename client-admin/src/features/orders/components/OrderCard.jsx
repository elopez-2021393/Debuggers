import { OrderStatusBadge } from './OrderStatusBadge.jsx';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ORDER_STATUS } from '../constants/order.constans.js';

export const OrderCard = ({ order, onViewDetail, canCancel, onCancel }) => {
    return (
        <li className='rounded-xl bg-[#16161f] border border-white/[0.06] p-4 space-y-3 hover:border-white/10 transition'>
            <div className='flex items-start justify-between gap-2'>
                <div>
                    <p className='text-xs text-white/30 font-mono'>
                        #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className='text-xs text-white/40 mt-0.5'>
                        {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <ul className='space-y-0.5 list-none p-0 m-0'>
                {order.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className='text-sm text-white/70'>
                        {item.nombre}
                        <span className='text-white/30 ml-1'>×{item.cantidad}</span>
                    </li>
                ))}
                {order.items.length > 3 && (
                    <li className='text-xs text-white/30'>
                        +{order.items.length - 3} más
                    </li>
                )}
            </ul>

            <div className='flex items-center justify-between pt-2 border-t border-white/[0.06]'>
                <span className='text-sm font-bold text-white'>
                    Q{order.total?.toFixed(2)}
                </span>
                <div className='flex items-center gap-2'>
                    {canCancel && order.status === ORDER_STATUS.PENDIENTE && (
                        <button
                            onClick={() => onCancel(order._id)}
                            className='text-xs text-red-400/70 hover:text-red-400 transition px-2 py-1 rounded border border-red-400/20 hover:border-red-400/40'
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={() => onViewDetail(order)}
                        className='text-xs text-white/50 hover:text-white transition px-2 py-1 rounded border border-white/10 hover:border-white/20'
                    >
                        Ver detalle
                    </button>
                </div>
            </div>
        </li>
    );
};