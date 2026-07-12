import { useCart } from "../hooks/useCart.js"

export const CartItem = ({ item, userId }) => {
    const { updateCartItem, removeCartItem } = useCart();
    const handleDecrement = () => {
        if (item.cantidad === 1) {
            removeCartItem(item.menuItemId);
        } else {
            updateCartItem(item.menuItemId, item.cantidad - 1);
        }
    };

    const handleIncrement = () => {
        updateCartItem(item.menuItemId, item.cantidad + 1);
    };

    const handleRemove = () => removeCartItem(item.menuItemId);

    return (
        <li className="flex gap-3 py-3 border-b border-white/[0.06] last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                    {item.nombre}
                </p>
                {item.aditamentos?.length > 0 && (
                    <p className="text-xs text-white/40 mt-0.5 truncate">
                        {item.aditamentos.join(', ')}
                    </p>
                )}
                <p className="text-xs text-white/50 mt-1">
                    Q{item.precio.toFixed(2)} c/u
                </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDecrement}
                        aria-label="Reducir Cantidad"
                        className="w-6 h-6 rounded-md bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-sm transition"
                    >
                        -
                    </button>
                    <span className="text-sm text-white w-4 text-center">
                        {item.cantidad}
                    </span>
                    <button
                        onClick={handleIncrement}
                        aria-label="Aumentar Cantidad"
                        className='w-6 h-6 rounded-md bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-sm transition'
                    >
                        +
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                        Q{item.subtotal.toFixed(2)}
                    </span>
                    <button
                        onClick={handleRemove}
                        aria-label="Eliminar platillo"
                        className="text-white/20 hover:text-red-400 transition text-xs"
                    >
                        X
                    </button>
                </div>
            </div>
        </li>
    );
};