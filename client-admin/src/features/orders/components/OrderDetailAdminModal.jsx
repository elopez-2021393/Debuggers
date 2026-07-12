import { OrderStatusBadge } from './OrderStatusBadge.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ORDER_STATUS, VALID_TRANSITIONS } from '../constants/order.constans.js';

const STATUS_ACTION_LABELS = {
    [ORDER_STATUS.ACEPTADO]: 'Aceptar pedido',
    [ORDER_STATUS.EN_PREPARACION]: 'Iniciar preparación',
    [ORDER_STATUS.LISTO]: 'Marcar como listo',
    [ORDER_STATUS.ENTREGADO]: 'Marcar como entregado',
    [ORDER_STATUS.CANCELADO]: 'Cancelar pedido',
};

const actionStyle = (status) => {
    if (status === ORDER_STATUS.CANCELADO) {
        return 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20';
    }
    return 'dbe-btn-primary';
}; //Cambia el color el boton depende del estado

const actionInlineStyle = (status) => {
    if (status === ORDER_STATUS.CANCELADO) return {};
    return {};
};

export const OrderDetailAdminModal = ({
    isOpen,
    order,
    onClose,
    onUpdateStatus,
    loadingAction,
}) => {
    if (!isOpen || !order) return null;
    const transitions = VALID_TRANSITIONS[order.status] ?? [];
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-3 sm:px-4'>
            <div className='w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl overflow-hidden bg-[#111118] border border-white/10 shadow-2xl'>
                <div
                    className='px-5 py-4 shrink-0 flex items-start justify-between'
                    style={{ background: 'var(--dbe-gradient)' }}
                >
                    <div>
                        <h2 className='text-lg font-bold text-white'>Detalle del pedido</h2>
                        <p className='text-xs text-white/80 font-mono'>
                            #{order._id?.slice(-6).toUpperCase()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label='Cerrar'
                        className='text-white/70 hover:text-white cursor-pointer transition text-xl'
                    >
                        X
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto px-5 py-5 space-y-5'>
                    <div className='flex items-center justify-between'>
                        <OrderStatusBadge status={order.status} />
                        <span className='text-xs text-white/40'>
                            {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                        </span>
                    </div>

                    <div>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                            Cliente
                        </p>
                        <div className='rounded-xl bg-white/5 border border-white/10 p-3 space-y-1 text-sm text-white/70'>
                            <p>
                                <span className='text-white/30 text-xs mr-1'>Teléfono:</span>
                                {order.telefono}
                            </p>
                            <p>
                                <span className='text-white/30 text-xs mr-1'>Dirección:</span>
                                {order.direccion?.descripcion}
                            </p>
                            {order.direccion?.referencias && (
                                <p className='text-xs text-white/40'>
                                    {order.direccion.referencias}
                                </p>
                            )}
                            <p>
                                <span className='text-white/30 text-xs mr-1'>Tipo:</span>
                                {order.direccion?.tipo}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                            Platillos
                        </p>
                        <ul className='space-y-2 list-none p-0 m-0'>
                            {order.items?.map((item, idx) => (
                                <li key={idx} className='flex justify-between gap-2 text-sm'>
                                    <div className='min-w-0'>
                                        <span className='text-white/80 font-medium'>
                                            {item.nombre}
                                        </span>
                                        <span className='text-white/40 ml-1'>
                                            x{item.cantidad}
                                        </span>
                                        {item.aditamentos?.length > 0 && (
                                            <p className='text-xs text-white/30 mt-0.5'>
                                                {item.aditamentos.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <span className='text-white/60 shrink-0'>
                                        Q{item.subtotal?.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-sm'>
                        <div className='flex justify-between text-white/50 text-xs'>
                            <span>Subtotal</span>
                            <span>Q{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-white/50 text-xs'>
                            <span>IVA (12%)</span>
                            <span>Q{order.iva?.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-white font-bold pt-1 border-t border-white/10'>
                            <span>Total</span>
                            <span>Q{order.total?.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-white/40 text-xs pt-1'>
                            <span>Método de pago</span>
                            <span>{order.tipoPago}</span>
                        </div>
                    </div>

                    {order.notas && (
                        <div>
                            <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                                Notas del cliente
                            </p>
                            <p className='text-sm text-white/60 bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-3 italic'>
                                "{order.notas}"
                            </p>
                        </div>
                    )}

                    {transitions.length > 0 && (
                        <div>
                            <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                                Cambiar estado
                            </p>
                            <div className='flex flex-col gap-2'>
                                {transitions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => onUpdateStatus(order._id, order.status, status)}
                                        disabled={loadingAction}
                                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${actionStyle(status)}`}
                                        style={actionInlineStyle(status)}
                                    >
                                        {loadingAction
                                            ? <Spinner small />
                                            : STATUS_ACTION_LABELS[status]
                                        }
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};