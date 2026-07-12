import { useState, useEffect } from "react";
import { useCart } from '../hooks/useCart.js';
import { CartItem } from './CartItem.jsx';
import { CheckoutModal } from './CheckoutModal.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { useUIStore } from '../../auth/store/uiStore.js';

export const CartDrawer = () => {
    const { cart, isOpen, loading, clearCart, closeCart, hasItems, getCart } = useCart();
    const { openConfirm } = useUIStore();
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && closeCart();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, closeCart]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]); //desactiva el scroll cuando este abierto el drawer

    useEffect(() => {
        if (isOpen) getCart();
    }, [isOpen]);

    const handleClearCart = () =>
        openConfirm({
            title: 'Vaciar carrito',
            message: '¿Eliminar todos los platillos del carrito?',
            onConfirm: clearCart,
        });
    if (!isOpen) return null;

    return (
        <>
            <div
                className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
                onClick={closeCart}
                aria-hidden='true'
            />

            <aside
                role='dialog'
                aria-modal='true'
                aria-label='Carrito de compras'
                className='fixed right-0 top-0 z-50 h-full w-full max-w-sm flex flex-col bg-[#111118] border-l border-white/10 shadow-2xl 
                animate-[slideInRight_0.25s_ease-out]'
            >
                <div
                    className='flex items-center justify-between px-5 py-4 shrink-0'
                    style={{ background: 'var(--dbe-gradient)' }}
                >
                    <div>
                        <h2 className='text-lg font-bold text-white'>Tu carrito</h2>
                        {cart?.items?.length > 0 && (
                            <p className='text-xs text-white/80'>
                                {cart.items.reduce((s, i) => s + i.cantidad, 0)} platillo
                                {cart.items.reduce((s, i) => s + i.cantidad, 0) !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        aria-label='Cerrar carrito'
                        className='text-white/70 hover:text-white transition text-xl leading-none'
                    >
                        X
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto px-5 py-3'>
                    {loading && !cart ? (
                        <div className='flex justify-center pt-10'>
                            <Spinner />
                        </div>
                    ) : !cart || cart.items?.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full gap-3 py-16'>
                            <span className='text-4xl opacity-30'>Carrito</span>
                            <p className='text-sm text-white/30 text-center'>
                                Tu carrito está vacío.
                                <br />
                                Agrega platillos del menú.
                            </p>
                        </div>
                    ) : (
                        <>
                            <ul className='list-none p-0 m-0'>
                                {cart.items.map((item) => (
                                    <CartItem key={item.menuItemId} item={item} />
                                ))}
                            </ul>

                            <button
                                onClick={handleClearCart}
                                className='mt-3 text-xs text-white/30 hover:text-red-400 transition'
                            >
                                Vaciar carrito
                            </button>
                        </>
                    )}
                </div>

                {hasItems && (
                    <div className='px-5 py-4 border-t border-white/10 bg-[#0e0e15] shrink-0 space-y-3'>
                        <div className='space-y-1.5 text-sm'>
                            <div className='flex justify-between text-white/50'>
                                <span>Subtotal</span>
                                <span>Q{cart.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between text-white/50'>
                                <span>IVA (12%)</span>
                                <span>Q{cart.iva?.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between text-white font-bold text-base pt-1 border-t border-white/10'>
                                <span>Total</span>
                                <span>Q{cart.total?.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCheckout(true)}
                            className='dbe-btn-primary w-full py-2.5 rounded-lg text-sm font-semibold'
                        >
                            Confirmar pedido
                        </button>
                    </div>
                )}
            </aside>

            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSuccess={() => {
                    setShowCheckout(false);
                    closeCart();
                }}
            />
        </>
    );
};