import { CATEGORY_LABELS, CATEGORY_COLORS, pill } from '../constants/restaurant.js';

export const RestaurantCard = ({
    restaurant,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onVerMenu,
    isAdmin,
}) => {
    const catStyle = CATEGORY_COLORS[restaurant.category] || {
        bg: 'rgba(255,255,255,0.1)',
        color: '#fff',
    };

    return (
        <div
            className='rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 cursor-pointer'
            style={{
                background: '#16161f',
                border: `1px solid ${isExpanded ? 'rgba(242,80,156,0.3)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            onClick={onToggle}
        >
            {/* Imagen */}
            <div
                className='w-full h-44 flex items-center justify-center overflow-hidden'
                style={{ background: 'rgba(255,255,255,0.04)' }}
            >
                {restaurant.photo ? (
                    <img
                        src={restaurant.photo}
                        alt={restaurant.name}
                        className='w-full h-full object-cover'
                    />
                ) : (
                    <span className='text-xs' style={{ color: 'rgba(255,255,255,0.2)' }}>
                        Sin imagen
                    </span>
                )}
            </div>

            <div className='p-4 flex flex-col gap-2'>
                {/* Nombre + categoría */}
                <div className='flex items-start justify-between gap-2'>
                    <h2 className='text-base font-bold text-white leading-tight'>{restaurant.name}</h2>
                    <span
                        className='px-2 py-0.5 rounded-full text-xs font-semibold shrink-0'
                        style={{ background: catStyle.bg, color: catStyle.color }}
                    >
                        {CATEGORY_LABELS[restaurant.category] || restaurant.category}
                    </span>
                </div>

                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {restaurant.address}
                </p>

                <div className='flex gap-2 flex-wrap mt-1'>
                    <span className='px-2 py-0.5 rounded-full text-xs' style={pill}>
                        {restaurant.capacity} personas
                    </span>
                    {restaurant.businessHours?.open && (
                        <span className='px-2 py-0.5 rounded-full text-xs' style={pill}>
                            {restaurant.businessHours.open} - {restaurant.businessHours.close}
                        </span>
                    )}
                </div>

                {/* Info expandida */}
                {isExpanded && (
                    <div
                        className='mt-2 space-y-2 pt-3'
                        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {restaurant.contactInfo?.managerName && (
                            <div className='flex items-center gap-2'>
                                <span className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>👤</span>
                                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    {restaurant.contactInfo.managerName}
                                </p>
                            </div>
                        )}
                        {restaurant.phone && (
                            <div className='flex items-center gap-2'>
                                <span className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>📞</span>
                                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    {restaurant.phone}
                                </p>
                            </div>
                        )}
                        {restaurant.contactInfo?.email && (
                            <div className='flex items-center gap-2'>
                                <span className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>✉️</span>
                                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    {restaurant.contactInfo.email}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className='w-full py-1.5 rounded-lg text-sm font-medium transition bg-white/[0.06] hover:bg-white/10 text-white/70 mt-2'
                    onClick={(e) => {
                        e.stopPropagation();
                        onVerMenu(restaurant._id);
                    }}
                >
                    Ver menú
                </button>

                {isAdmin && (
                    <div
                        className='flex gap-2 pt-3'
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <button
                            className='flex-1 py-1.5 rounded-lg text-sm font-medium transition'
                            style={{
                                background: 'rgba(242,80,156,0.15)',
                                border: '1px solid rgba(242,80,156,0.3)',
                                color: 'var(--dbe-pink)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,80,156,0.25)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(242,80,156,0.15)')}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(restaurant);
                            }}
                        >
                            Editar
                        </button>
                        <button
                            className='flex-1 py-1.5 rounded-lg text-sm font-medium transition'
                            style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(restaurant);
                            }}
                        >
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};