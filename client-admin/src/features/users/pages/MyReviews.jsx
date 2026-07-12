import { useEffect, useState } from 'react';
import { useReviewStore } from '../../review/store/reviewStore';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore';
import { showError } from '../../../shared/utils/toast';

const RATING_COLORS = {
  5: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  4: { bg: 'rgba(132,204,22,0.15)', color: '#a3e635' },
  3: { bg: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
  2: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  1: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

const MyReviewCard = ({ review, restaurantName }) => {
  const ratingStyle = RATING_COLORS[review.rating] || RATING_COLORS[3];
  const hasReply = !!review.reply;

  return (
    <div
      className='rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5'
      style={{
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className='p-4 flex flex-col gap-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <p className='font-bold text-sm text-white truncate' style={{ maxWidth: '100%' }}>
              {restaurantName || 'Restaurante'}
            </p>
            <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString('es-GT', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                : 'Fecha no disponible'}
            </p>
          </div>
          <div className='flex flex-col items-end gap-1 shrink-0'>
            <span
              className='px-2 py-0.5 rounded-full text-xs font-semibold'
              style={{ background: ratingStyle.bg, color: ratingStyle.color }}
            >
              {review.rating}/5
            </span>
          </div>
        </div>

        <p className='text-sm leading-relaxed' style={{ color: 'rgba(255,255,255,0.55)' }}>
          "{review.comment}"
        </p>

        {hasReply ? (
          <div
            className='px-3 py-2.5 rounded-xl text-xs'
            style={{
              background: 'rgba(242,80,156,0.07)',
              border: '1px solid rgba(242,80,156,0.2)',
            }}
          >
            <div className='flex items-center gap-1.5 mb-1'>
              <span
                className='w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0'
                style={{ background: 'var(--dbe-gradient)', color: '#fff' }}
              >
                R
              </span>
              <span className='font-semibold text-[11px]' style={{ color: '#F2509C' }}>
                Respuesta del restaurante
              </span>
            </div>
            <p className='italic leading-relaxed m-0' style={{ color: 'rgba(255,255,255,0.5)' }}>
              {review.reply}
            </p>
          </div>
        ) : (
          <div
            className='px-3 py-2 rounded-xl text-xs flex items-center gap-2'
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Aún sin respuesta del restaurante
          </div>
        )}
      </div>
    </div>
  );
};

export const MyReviews = () => {
  const { myReviews, loading, error, getMyReviews } = useReviewStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [filterReply, setFilterReply] = useState('ALL');
  const [filterRestaurant, setFilterRestaurant] = useState('ALL');

  useEffect(() => {
    getMyReviews();
    getRestaurants();
  }, []);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const restaurantMap = Object.fromEntries(restaurants.map((r) => [r._id, r.name]));

  const restaurantsInReviews = [
    ...new Map(
      myReviews
        .filter((r) => restaurantMap[r.restaurantId])
        .map((r) => [r.restaurantId, restaurantMap[r.restaurantId]])
    ).entries(),
  ];

  const filtered = myReviews.filter((r) => {
    const matchReply = filterReply === 'ALL' || (filterReply === 'REPLIED' ? !!r.reply : !r.reply);
    const matchRestaurant = filterRestaurant === 'ALL' || r.restaurantId === filterRestaurant;
    return matchReply && matchRestaurant;
  });

  const repliedCount = myReviews.filter((r) => !!r.reply).length;
  const pendingCount = myReviews.filter((r) => !r.reply).length;

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-white'>Mis Reseñas</h1>
        <p className='text-sm mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
          Historial de comentarios propios
        </p>
      </div>

      <div className='grid grid-cols-3 gap-3 mb-5'>
        {[
          { label: 'Total', value: myReviews.length, color: 'rgba(255,255,255,0.6)' },
          { label: 'Respondidas', value: repliedCount, color: '#4ade80' },
          { label: 'Sin respuesta', value: pendingCount, color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className='rounded-xl px-4 py-3 text-center'
            style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className='text-xl font-extrabold' style={{ color }}>
              {value}
            </div>
            <div className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.35)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap gap-2 mb-5'>
        {[
          { key: 'ALL', label: 'Todas' },
          { key: 'REPLIED', label: 'Respondidas' },
          { key: 'PENDING', label: 'Sin respuesta' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterReply(key)}
            className='px-3.5 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all'
            style={{
              background: filterReply === key ? 'var(--dbe-gradient-h)' : 'rgba(255,255,255,0.06)',
              color: filterReply === key ? '#fff' : 'rgba(255,255,255,0.45)',
              outline: filterReply === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {label}
          </button>
        ))}

        {restaurantsInReviews.length > 0 && (
          <select
            value={filterRestaurant}
            onChange={(e) => setFilterRestaurant(e.target.value)}
            className='px-3.5 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all outline-none'
            style={{
              background:
                filterRestaurant !== 'ALL' ? 'var(--dbe-gradient-h)' : 'rgba(255,255,255,0.06)',
              color: filterRestaurant !== 'ALL' ? '#fff' : 'rgba(255,255,255,0.45)',
              outline: filterRestaurant !== 'ALL' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <option value='ALL' style={{ background: '#1a1a2e', color: '#fff' }}>
              Todos los restaurantes
            </option>
            {restaurantsInReviews.map(([id, name]) => (
              <option key={id} value={id} style={{ background: '#1a1a2e', color: '#fff' }}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && myReviews.length === 0 ? (
        <div
          className='rounded-xl p-8 text-center text-sm'
          style={{
            background: '#16161f',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Cargando reseñas...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className='rounded-xl p-10 text-center'
          style={{ background: '#16161f', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <p className='text-sm font-semibold text-white mb-1'>
            {myReviews.length === 0
              ? 'Aún no has dejado reseñas'
              : 'Sin resultados para este filtro'}
          </p>
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
            {myReviews.length === 0
              ? 'Visita un restaurante y comparte tu experiencia'
              : 'Prueba cambiando el filtro'}
          </p>
        </div>
      ) : (
        <div className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {filtered.map((review) => (
            <MyReviewCard
              key={review._id}
              review={review}
              restaurantName={restaurantMap[review.restaurantId]}
            />
          ))}
        </div>
      )}
    </div>
  );
};