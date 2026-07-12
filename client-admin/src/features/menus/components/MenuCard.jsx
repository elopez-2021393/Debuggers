const CATEGORY_LABELS = {
  DESAYUNO: 'Desayuno',
  ALMUERZO: 'Almuerzo',
  CENA: 'Cena',
  BEBIDA: 'Bebida',
  POSTRE: 'Postre',
};

const CATEGORY_COLORS = {
  DESAYUNO: 'bg-orange-500/15 text-orange-400',
  ALMUERZO: 'bg-red-500/15    text-red-400',
  CENA: 'bg-yellow-500/15 text-yellow-400',
  BEBIDA: 'bg-green-500/15  text-green-400',
  POSTRE: 'bg-purple-500/15 text-purple-400',
};

const DAY_SHORT = {
  LUNES: 'Lun',
  MARTES: 'Mar',
  MIERCOLES: 'Mié',
  JUEVES: 'Jue',
  VIERNES: 'Vie',
  SABADO: 'Sáb',
  DOMINGO: 'Dom',
};

export const MenuCard = ({ menu, isAdmin, onEdit, onDelete, onAddToCart }) => (
  <article
    className='rounded-2xl overflow-hidden flex flex-col bg-[#16161f] border border-white/[0.07] hover:-translate-y-0.5 transition-all duration-300'
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3' }}
  >
    <figure className='w-full h-40 flex items-center justify-center overflow-hidden bg-white/[0.04] m-0'>
      {menu.photo ? (
        <img src={menu.photo} alt={menu.name} className='w-full h-full object-cover' />
      ) : (
        <figcaption className='text-xs text-white/20'>Sin imagen</figcaption>
      )}
    </figure>
    <div className='p-4 flex flex-col flex-1 gap-2'>
      <header className='flex items-start justify-between gap-2'>
        <h2 className='text-sm font-bold text-white leading-tight'>{menu.name}</h2>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${CATEGORY_COLORS[menu.category] || 'bg-white/10 text-white'}`}
        >
          {CATEGORY_LABELS[menu.category] || menu.category}
        </span>
      </header>

      {menu.description && <p className='text-xs text-white/40 line-clamp-2'>{menu.description}</p>}
      <p className='text-base font-bold text-white/90 mt-auto'>Q{menu.price?.toFixed(2)}</p>

      {menu.ingredients?.length > 0 && (
        <ul className='flex flex-wrap gap-1' aria-label='Ingredientes'>
          {menu.ingredients.slice(0, 4).map((ing) => (
            <li
              key={ing}
              className='px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-white/50'
            >
              {ing}
            </li>
          ))}
          {menu.ingredients.length > 4 && (
            <li className='px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-white/50'>
              +{menu.ingredients.length - 4}
            </li>
          )}
        </ul>
      )}

      {menu.availability?.days?.length > 0 && (
        <div className='mt-1'>
          <p className='text-xs text-white/30 mb-1 uppercase tracking-wider'>Disponible</p>
          <ul className='flex gap-1 flex-wrap'>
            {menu.availability.days.map((day) => (
              <li
                key={day}
                className='px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20'
              >
                {DAY_SHORT[day] || day}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!menu.available && <p className='text-xs text-red-400/70'>No disponible</p>}
      {menu.restaurantId?.name && (
        <p className='text-xs text-white/30'>Restaurante: {menu.restaurantId.name}</p>
      )}

      {onAddToCart && (
        <button
          onClick={() => onAddToCart(menu)}
          className='w-full mt-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all'
          style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
        >
          + Agregar al carrito
        </button>
      )}
      
      {isAdmin && (
        <footer className='flex gap-2 mt-2 pt-3 border-t border-white/[0.05]'>
          <button
            className='flex-1 py-1.5 rounded-lg text-sm font-medium transition bg-pink-500/15 hover:bg-pink-500/25 border border-pin-500/30 text-pink-400'
            onClick={() => onEdit(menu)}
          >
            Editar
          </button>
          <button
            className='flex-1 py-1.5 rounded-lg text-sm font-medium transition bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400'
            onClick={() => onDelete(menu)}
          >
            Eliminar
          </button>
        </footer>
      )}
    </div>
  </article>
);
