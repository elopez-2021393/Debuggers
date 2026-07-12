const CATEGORY_LABELS = {
  DESAYUNO: 'Desayuno',
  ALMUERZO: 'Almuerzo',
  CENA: 'Cena',
  BEBIDA: 'Bebida',
  POSTRE: 'Postre',
};

const INPUT =
  'w-full px-3 py-2 rounded-lg outline-none text-sm text-white bg-white/[0.06] border border-white/10';

export const MenuFilters = ({ search, onSearch, category, onCategory }) => (
  <search className='rounded-xl p-4 mb-4 bg-[#16161f] border border-white/[0.06]'>
    <fieldset className='grid grid-cols-1 md:grid-cols-3 gap-3'>
      <legend className='sr-only'>Filtrar platos</legend>
      <input
        type='search'
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder='Buscar por nombre o descripción...'
        aria-label='Buscar platos'
        className={`md:col-span-2 ${INPUT}`}
      />
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        aria-label='Filtrar por categoría'
        className={`${INPUT} cursor-pointer`}
        style={{ background: '#1a1a2e' }}
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
    </fieldset>
  </search>
);
