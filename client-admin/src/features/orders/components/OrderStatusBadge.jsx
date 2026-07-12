import { ORDER_STATUS_CONFIG } from '../constants/order.constans.js';

export const OrderStatusBadge = ({ status, showDot = true, className = '' }) => {
    const config = ORDER_STATUS_CONFIG[status];
    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${config.color} ${config.bg} ${config.border} ${className}`}
        >
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
            )}
            {config.label}
        </span>
    );
};