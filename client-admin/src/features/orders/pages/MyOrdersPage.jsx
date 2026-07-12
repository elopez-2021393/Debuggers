import { useEffect, useState } from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { OrderCard } from '../components/OrderCard.jsx';
import { OrderDetailPanel } from './OrderDetailPanel.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { ORDER_STATUS } from '../constants/order.constans.js';
import { showError } from '../../../shared/utils/toast.js';

const STATUS_FILTERS = [
    { value: '', label: 'Todos' },
    { value: ORDER_STATUS.PENDIENTE, label: 'Pendientes' },
    { value: ORDER_STATUS.ACEPTADO, label: 'Aceptados' },
    { value: ORDER_STATUS.EN_PREPARACION, label: 'En preparación' },
    { value: ORDER_STATUS.LISTO, label: 'Listos' },
    { value: ORDER_STATUS.ENTREGADO, label: 'Entregados' },
    { value: ORDER_STATUS.CANCELADO, label: 'Cancelados' },
];

export const MyOrdersPage = () => {
    const { openConfirm } = useUIStore();
    const {
        orders,
        selectedOrder,
        loading,
        error,
        getUserOrders,
        cancelOrder,
        canCancelOrder,
        setSelectedOrder,
    } = useOrders();

    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        getUserOrders(statusFilter || undefined);
    }, [statusFilter]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const handleCancel = (orderId) =>
        openConfirm({
            title: 'Cancelar pedido',
            message: 'Solo puedes cancelar dentro de los primeros 5 minutos. ¿Continuar?',
            onConfirm: () => cancelOrder(orderId),
        });

    return (
        <section className='p-4'>
            <header className='mb-6'>
                <h1 className='text-3xl font-bold text-white'>Mis pedidos</h1>
                <p className='text-sm text-white/50 mt-1'>
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado
                    {orders.length !== 1 ? 's' : ''}
                </p>
            </header>

            <div className='flex gap-2 flex-wrap mb-5'>
                {STATUS_FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                            ${statusFilter === value
                                ? 'text-white'
                                : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                            }`}
                        style={
                            statusFilter === value
                                ? { background: 'var(--dbe-gradient-h)' }
                                : {}
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading && orders.length === 0 ? (
                <div className='flex justify-center py-16'>
                    <Spinner />
                </div>
            ) : orders.length === 0 ? (
                <p className='rounded-xl p-6 text-center text-sm text-white/30 bg-[#16161f] border border-white/[0.06]'>
                    No hay pedidos para mostrar.
                </p>
            ) : (
                <ul className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 list-none p-0 m-0'>
                    {orders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            canCancel={canCancelOrder(order)}
                            onCancel={handleCancel}
                            onViewDetail={setSelectedOrder}
                        />
                    ))}
                </ul>
            )}

            <OrderDetailPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onCancel={handleCancel}
            />
        </section>
    );
};