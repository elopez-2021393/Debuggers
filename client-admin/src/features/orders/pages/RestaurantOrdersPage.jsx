import { useEffect, useState } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { AdminOrderCard } from '../components/AdminOrderCard.jsx';
import { OrderDetailAdminModal } from '../components/OrderDetailAdminModal.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { ORDER_STATUS } from '../constants/order.constans.js';
import { showError } from '../../../shared/utils/toast.js';

const STATUS_FILTERS = [
    { label: 'Activos', params: {} },
    { label: 'Pendientes', params: { status: ORDER_STATUS.PENDIENTE } },
    { label: 'Aceptados', params: { status: ORDER_STATUS.ACEPTADO } },
    { label: 'En preparación', params: { status: ORDER_STATUS.EN_PREPARACION } },
    { label: 'Listos', params: { status: ORDER_STATUS.LISTO } },
    { label: 'Historial', params: { todos: true } },
];

export const RestaurantOrdersPage = () => {
    const { openConfirm } = useUIStore();
    const {
        orders,
        selectedOrder,
        loading,
        loadingAction,
        error,
        fetchOrders,
        startPolling,
        stopPolling,
        updateOrderStatus,
        cancelOrder,
        nextStatus,
        setSelectedOrder,
    } = useAdminOrders();

    const [activeFilter, setActiveFilter] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const params = STATUS_FILTERS[activeFilter].params;
        fetchOrders(params);
        stopPolling();
        startPolling(params);
        return () => stopPolling();
    }, [activeFilter]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const handleAdvanceStatus = (order) => {
        const next = nextStatus(order.status);
        if (!next) return;
        openConfirm({
            title: STATUS_FILTERS.find((_, i) => i === activeFilter)?.label ?? 'Confirmar',
            message: `¿Cambiar el pedido #${order._id.slice(-6).toUpperCase()} a "${next}"?`,
            onConfirm: () => updateOrderStatus(order._id, order.status, next),
        });
    }; //Actualizar el estado

    const handleCancel = (order) => {
        openConfirm({
            title: 'Cancelar pedido',
            message: `¿Cancelar el pedido #${order._id.slice(-6).toUpperCase()}? Esta acción no se puede deshacer.`,
            onConfirm: () => cancelOrder(order._id),
        });
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const handleUpdateStatusFromModal = async (orderId, currentStatus, newStatus) => {
        if (newStatus === ORDER_STATUS.CANCELADO) {
            openConfirm({
                title: 'Cancelar pedido',
                message: '¿Estás seguro de cancelar este pedido?',
                onConfirm: async () => {
                    await cancelOrder(orderId);
                    setModalOpen(false);
                },
            });
            return;
        }
        const result = await updateOrderStatus(orderId, currentStatus, newStatus);
        if (result.ok) setModalOpen(false);
    }; //Cambiar el estado desde la tarjeta

    const pendingCount = orders.filter((o) => o.status === ORDER_STATUS.PENDIENTE).length;

    return (
        <section className='p-4'>
            <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6'>
                <hgroup>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-3xl font-bold text-white'>Pedidos</h1>
                        {pendingCount > 0 && (
                            <span
                                className='px-2 py-0.5 rounded-full text-xs font-bold text-white animate-pulse'
                                style={{ background: 'var(--dbe-gradient-h)' }}
                            >
                                {pendingCount} nuevo{pendingCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <p className='text-sm text-white/50 mt-1'>
                        {orders.length} pedido{orders.length !== 1 ? 's' : ''} · actualiza cada minuto
                    </p>
                </hgroup>

                <button
                    onClick={() => fetchOrders(STATUS_FILTERS[activeFilter].params)}
                    disabled={loading}
                    className='px-4 py-2 rounded-lg text-sm font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition disabled:opacity-50 self-start md:self-auto'
                >
                    {loading ? '...' : '↻ Actualizar'}
                </button>
            </header>

            <div className='flex gap-2 flex-wrap mb-5'>
                {STATUS_FILTERS.map(({ label }, idx) => (
                    <button
                        key={label}
                        onClick={() => setActiveFilter(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                            ${activeFilter === idx
                                ? 'text-white'
                                : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 cursor-pointer'
                            }`}
                        style={
                            activeFilter === idx
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
                        <AdminOrderCard
                            key={order._id}
                            order={order}
                            onViewDetail={handleViewDetail}
                            onAdvanceStatus={handleAdvanceStatus}
                            onCancel={handleCancel}
                            loadingAction={loadingAction}
                        />
                    ))}
                </ul>
            )}

            <OrderDetailAdminModal
                isOpen={modalOpen}
                order={selectedOrder}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedOrder(null);
                }}
                onUpdateStatus={handleUpdateStatusFromModal}
                loadingAction={loadingAction}
            />
        </section>
    );
};