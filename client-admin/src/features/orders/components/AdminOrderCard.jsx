import { OrderStatusBadge } from './OrderStatusBadge.jsx';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ORDER_STATUS } from '../constants/order.constans.js';

const NEXT_LABEL = {
    [ORDER_STATUS.PENDIENTE]: 'Aceptar pedido',
    [ORDER_STATUS.ACEPTADO]: 'Iniciar preparación',
    [ORDER_STATUS.EN_PREPARACION]: 'Marcar listo',
    [ORDER_STATUS.LISTO]: 'Marcar entregado',
};

export const AdminOrderCard = ({
    order,
    onViewDetail,
    onAdvanceStatus,
    onCancel,
    loadingAction,
}) => {
    const nextLabel = NEXT_LABEL[order.status];
    const canCancel = [ORDER_STATUS.PENDIENTE, ORDER_STATUS.ACEPTADO].includes(order.status);
    const isTerminal = [ORDER_STATUS.ENTREGADO, ORDER_STATUS.CANCELADO].includes(order.status);

    return (
        <li className='rounded-xl bg-[#16161f] border border-white/[0.06] p-4 space-y-3 hover:border-white/10 transition flex flex-col'>
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

            <ul className='space-y-0.5 list-none p-0 m-0 flex-1'>
                {order.items?.slice(0, 3).map((item, idx) => (
                    <li key={idx} className='text-sm text-white/70'>
                        {item.nombre}
                        <span className='text-white/30 ml-1'>×{item.cantidad}</span>
                    </li>
                ))}
                {order.items?.length > 3 && (
                    <li className='text-xs text-white/30'>
                        +{order.items.length - 3} más
                    </li>
                )}
            </ul>

            {order.notas && (
                <p className='text-xs text-yellow-400/70 bg-yellow-400/5 border border-yellow-400/10 rounded-lg px-2.5 py-1.5 italic truncate'>
                    {order.notas}
                </p>
            )}

            <div className='flex items-center justify-between text-sm'>
                <span className='font-bold text-white'>Q{order.total?.toFixed(2)}</span>
                <span className='text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full'>
                    {order.tipoPago}
                </span>
            </div>

            {!isTerminal && (
                <div className='flex flex-col gap-2 pt-2 border-t border-white/[0.05]'>
                    {nextLabel && (
                        <button
                            onClick={() => onAdvanceStatus(order)}
                            disabled={loadingAction}
                            className='dbe-btn-primary w-full py-2 rounded-lg text-sm font-semibold active:scale-[0.98]'
                        >
                            {nextLabel}
                        </button>
                    )}

                    <div className='flex gap-2'>
                        <button
                            onClick={() => onViewDetail(order)}
                            className='w-full py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 transition'
                        >
                            Ver detalle
                        </button>
                        {canCancel && (
                            <button
                                onClick={() => onCancel(order)}
                                disabled={loadingAction}
                                className='flex-1 p-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer border border-red-500/20 transition disabled:opacity-50'
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isTerminal && (
                <button
                    onClick={() => onViewDetail(order)}
                    className='w-full py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 transition'
                >
                    Ver detalle
                </button>
            )}
        </li>
    );
};