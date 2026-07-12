import { useState, useEffect } from 'react';
import { ReviewModal } from '../../review/components/ReviewModal.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';

const CATEGORY_LABELS = {
  COMIDA_RAPIDA: 'Comida Rápida',
  ITALIANA: 'Italiana',
  CHINA: 'China',
  MEXICANA: 'Mexicana',
  CAFETERIA: 'Cafetería',
};

const isRestaurantOpen = (r) => {
  if (!r.businessHours?.open || !r.businessHours?.close) return null;
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= toMin(r.businessHours.open) && cur <= toMin(r.businessHours.close);
};

export const UserPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);


  const QUICK_ACCESS = [
    { title: 'Nueva Reservación', sub: 'Reserva tu mesa ahora', onClick: () => navigate('/home/reservaciones') },
    { title: 'Ordenar al Instante', sub: 'Ver menús disponibles', onClick: () => navigate('/home/restaurantes') },
    { title: 'Eventos Gastronómicos', sub: 'Noches especiales', onClick: () => navigate('/home/eventos') },
    { title: 'Dejar Comentario', sub: 'Califica tu experiencia', onClick: () => setReviewOpen(true) },
  ];

  const filtered = restaurants.filter((r) => {
    const matchCat = activeFilter === 'ALL' || r.category === activeFilter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    getRestaurants();
  }, []);

  return (
    <>
      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
      <p className='text-[13px] mb-1.5' style={{ color: 'rgba(255,255,255,0.45)' }}>
        Hola, {user?.firstName} {user?.surname}
      </p>
      <h1 className='text-[28px] font-extrabold mb-5'>
        Que vas a <span style={{ color: 'var(--dbe-pink)' }}>ordenar hoy?</span>
      </h1>

      <div
        className='flex items-center gap-2.5 max-w-[480px] mb-7 px-4 py-2.5 rounded-xl'
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Busca restaurante...'
          className='bg-transparent border-none outline-none text-white text-[13px] flex-1'
        />
      </div>

      <div className='flex gap-3 mb-7'>
        {[
          { num: restaurants.length, label: 'Restaurantes' },
          { num: 0, label: 'Eventos activos' },
          { num: 0, label: 'Mis reservaciones' },
        ].map(({ num, label }) => (
          <div
            key={label}
            className='flex-1 rounded-xl px-[18px] py-3.5'
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className='text-[22px] font-extrabold'>{num}</div>
            <div className='text-[11px] mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      <p className='text-[12px] font-bold uppercase tracking-[0.07em] mb-3' style={{ color: 'rgba(255,255,255,0.5)' }}>
        Acceso rapido
      </p>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8'>
        {QUICK_ACCESS.map(({ title, sub, onClick }) => (
          <HoverCard key={title} onClick={onClick}>
            <div className='text-[13px] font-semibold mb-0.5'>{title}</div>
            <div className='text-[11px]' style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
          </HoverCard>
        ))}
      </div>

      <div className='flex justify-between items-center mb-3.5'>
        <p className='text-[12px] font-bold uppercase tracking-[0.07em]' style={{ color: 'rgba(255,255,255,0.5)' }}>
          Restaurantes disponibles
        </p>
        <span
          className='text-[13px] font-medium cursor-pointer'
          style={{ color: 'var(--dbe-pink)' }}
          onClick={() => navigate('/home/restaurantes')}
        >
          Ver todos
        </span>
      </div>

      <div className='flex flex-wrap gap-2 mb-4'>
        {['ALL', ...Object.keys(CATEGORY_LABELS)].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className='px-3.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer border-none transition-all'
            style={{
              background: activeFilter === cat ? 'var(--dbe-gradient-h)' : 'transparent',
              color: activeFilter === cat ? '#fff' : 'rgba(255,255,255,0.5)',
              outline: activeFilter === cat ? 'none' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {cat === 'ALL' ? 'Todos' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className='flex flex-col gap-2 pb-12'>
        {filtered.length === 0 ? (
          <div
            className='text-center py-12 text-[14px] rounded-xl'
            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}
          >
            No se encontraron restaurantes
          </div>
        ) : (
          filtered.map((r) => {
            const open = isRestaurantOpen(r);
            return (
              <HoverCard
                key={r._id}
                onClick={() => navigate(`/home/restaurantes/${r._id}/menu`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <div
                  className='w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center'
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  {r.photo ? (
                    <img src={r.photo} alt={r.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-2.5 h-2.5 rounded-full' style={{ background: 'rgba(255,255,255,0.2)' }} />
                  )}
                </div>
                <div className='flex-1'>
                  <div className='text-[14px] font-bold mb-0.5'>{r.name}</div>
                  <div className='text-[12px]' style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {CATEGORY_LABELS[r.category] || r.category}
                  </div>
                </div>
                {open !== null && (
                  <span
                    className='text-[11px] font-bold px-2.5 py-0.5 rounded-full'
                    style={{
                      background: open ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                      color: open ? '#4ade80' : '#f87171',
                    }}
                  >
                    {open ? 'Abierto' : 'Cerrado'}
                  </span>
                )}
              </HoverCard>
            );
          })
        )}
      </div>
    </>
  );
};

const HoverCard = ({ children, style = {}, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(242,80,156,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        ...style,
      }}
    >
      {children}
    </div>
  );
};