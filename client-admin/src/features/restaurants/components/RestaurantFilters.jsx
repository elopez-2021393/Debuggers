import { CATEGORY_LABELS } from '../constants/restaurant.js';

export const RestaurantFilters = ({ search, onSearch, filterCategory, onFilterCategory }) => (
    <div
        className='rounded-xl p-4 mb-4'
        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
    >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder='Buscar por nombre o dirección...'
                className='md:col-span-2 w-full px-3 py-2 rounded-lg outline-none text-sm'
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                }}
            />
            <select
                value={filterCategory}
                onChange={(e) => onFilterCategory(e.target.value)}
                className='w-full px-3 py-2 rounded-lg outline-none text-sm'
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                }}
            >
                <option value='ALL' style={{ background: '#1a1a2e' }}>
                    Todas las categorías
                </option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value} style={{ background: '#1a1a2e' }}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    </div>
);