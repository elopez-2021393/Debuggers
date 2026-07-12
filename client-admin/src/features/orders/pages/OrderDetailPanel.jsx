import { useEffect, useState, useCallback } from 'react';
import { OrderStatusBadge } from '../components/OrderStatusBadge.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from '../constants/order.constans.js';

export const OrderDetailPanel = ({ order, onClose, onCancel }) => {
    const { canCancelOrder } = useOrders();
    const [timeLeft, setTimeLeft] = useState(0); // segundos restantes

    const calcSecondsLeft = useCallback((createdAt) => {
        const elapsed = Date.now() - new Date(createdAt).getTime();
        const remaining = 5 * 60 * 1000 - elapsed;
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    }, []);//Cuenta para la cancelación

    useEffect(() => {
        if (!order || order.status !== ORDER_STATUS.PENDIENTE) {
            setTimeLeft(0);
            return;
        }
        setTimeLeft(calcSecondsLeft(order.createdAt));
        const interval = setInterval(() => {
            const left = calcSecondsLeft(order.createdAt);
            setTimeLeft(left);
            if (left <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [order, calcSecondsLeft]);

    useEffect(() => {
        if (!order) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [order, onClose]);

    if (!order) return null;

    const canCancel = canCancelOrder(order) && timeLeft > 0;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <>
            <div
                className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
                onClick={onClose}
                aria-hidden='true'
            />

            <aside
                role='dialog'
                aria-modal='true'
                aria-label='Detalle del pedido'
                className='fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col bg-[#111118] border-l border-white/10 shadow-2xl
                animate-[slideInRight_0.25s_ease-out]'
            >
                <div className='px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-500 shrink-0 flex items-start justify-between'>
                    <div>
                        <h2 className='text-lg font-bold text-white'>Detalle del pedido</h2>
                        <p className='text-xs text-white/80 font-mono'>
                            #{order._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label='Cerrar detalle'
                        className='text-white/70 hover:text-white transition text-xl'
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
                    {canCancel && (
                        <div className='rounded-xl bg-yellow-400/10 border border-yellow-400/20 p-3'>
                            <p className='text-xs text-yellow-400 font-semibold'>
                                Puedes cancelar este pedido
                            </p>
                            <p className='text-xs text-yellow-400/70 mt-0.5'>
                                Tiempo restante: {mins}:{secs.toString().padStart(2, '0')} min
                            </p>
                        </div>
                    )}

                    <div>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                            Platillos
                        </p>
                        <ul className='space-y-2 list-none p-0 m-0'>
                            {order.items.map((item, idx) => (
                                <li
                                    key={idx}
                                    className='flex justify-between gap-2 text-sm text-white/80'
                                >
                                    <div className='min-w-0'>
                                        <span className='font-medium'>{item.nombre}</span>
                                        <span className='text-white/40 ml-1'>x{item.cantidad}</span>
                                        {item.aditamentos?.length > 0 && (
                                            <p className='text-xs text-white/30 mt-0.5'>
                                                {item.aditamentos.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <span className='shrink-0 text-white/60'>
                                        Q{item.subtotal.toFixed(2)}
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
                    </div>

                    <div>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                            Dirección de entrega
                        </p>
                        <div className='rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white/70 space-y-1'>
                            <p>
                                <span className='text-white/30 text-xs mr-1'>Tipo:</span>
                                {order.direccion?.tipo}
                            </p>
                            <p>{order.direccion?.descripcion}</p>
                            {order.direccion?.referencias && (
                                <p className='text-white/40 text-xs'>{order.direccion.referencias}</p>
                            )}
                        </div>
                    </div>

                    <div className='flex gap-3'>
                        <div className='flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm'>
                            <p className='text-xs text-white/30 mb-1'>Método de pago</p>
                            <p className='text-white/80 font-semibold'>{order.tipoPago}</p>
                        </div>
                        <div className='flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm'>
                            <p className='text-xs text-white/30 mb-1'>Teléfono</p>
                            <p className='text-white/80 font-semibold'>{order.telefono}</p>
                        </div>
                    </div>

                    {order.notas && (
                        <div>
                            <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                                Notas
                            </p>
                            <p className='text-sm text-white/60 bg-white/5 border border-white/10
                            rounded-xl p-3 italic'>
                                "{order.notas}"
                            </p>
                        </div>
                    )}

                    {order.historialStatus?.length > 0 && (
                        <div>
                            <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                                Historial
                            </p>
                            <ol className='space-y-2 list-none p-0 m-0'>
                                {order.historialStatus.map((h, idx) => {
                                    const cfg = ORDER_STATUS_CONFIG[h.status];
                                    return (
                                        <li key={idx} className='flex items-center gap-2 text-xs text-white/50'>
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg?.dot ?? 'bg-white/20'}`} />
                                            <span className={cfg?.color ?? 'text-white/50'}>{h.status}</span>
                                            <span className='text-white/20 ml-auto'>
                                                {formatDate(h.cambiadoEn)} {formatTime(h.cambiadoEn)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    )}

                    {order.estimadoEntrega && order.status !== ORDER_STATUS.ENTREGADO && order.status !== ORDER_STATUS.CANCELADO && (
                        <p className='text-xs text-white/30 text-center'>
                            Tiempo estimado de entrega: {order.estimadoEntrega}
                        </p>
                    )}
                </div>

                {canCancel && (
                    <div className='px-5 py-4 border-t border-white/10 shrink-0'>
                        <button
                            onClick={() => onCancel(order._id)}
                            className='w-full py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition'
                        >
                            Cancelar pedido
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};