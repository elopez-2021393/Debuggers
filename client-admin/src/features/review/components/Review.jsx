import { useEffect, useState } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { useAuthStore } from '../../auth/store/authStore.js';
import { replyToReview } from '../../../shared/apis/review';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { useUIStore } from '../../auth/store/uiStore.js';

const RATING_COLORS = {
  5: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  4: { bg: 'rgba(132,204,22,0.15)', color: '#a3e635' },
  3: { bg: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
  2: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  1: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

const ReviewCard = ({ review }) => {
  const user = useAuthStore((state) => state.user);
  const { deleteReview } = useReviewStore();
  const { openConfirm } = useUIStore();

  const [replyText, setReplyText] = useState(review.reply || '');
  const [isReplying, setIsReplying] = useState(false);
  const [localReply, setLocalReply] = useState(review.reply || '');

  const canDelete =
    user?.id === review.userId || user?.role === 'ADMIN_ROLE' || user?.role === 'RES_ADMIN_ROLE';
  const isOwnerOrAdmin = user?.role === 'RES_ADMIN_ROLE' || user?.role === 'ADMIN_ROLE';
  const ratingStyle = RATING_COLORS[review.rating] || RATING_COLORS[3];

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await replyToReview(review._id, replyText);
      if (res.status === 200 || res.status === 201) {
        showSuccess('Respuesta enviada correctamente');
        setLocalReply(replyText);
      } else {
        showError(res?.data?.message || 'Error al enviar la respuesta');
      }
    } catch {
      showError('Error de red al enviar la respuesta');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div
      className='rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5'
      style={{
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className='p-4 flex flex-col flex-1 gap-3'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <p className='font-bold text-white text-sm leading-tight'>{review.userName}</p>
            <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : 'Fecha no disponible'}
            </p>
          </div>
          <span
            className='px-2 py-0.5 rounded-full text-xs font-semibold shrink-0'
            style={{ background: ratingStyle.bg, color: ratingStyle.color }}
          >
            {review.rating}/5
          </span>
        </div>

        <p className='text-sm leading-relaxed' style={{ color: 'rgba(255,255,255,0.5)' }}>
          "{review.comment}"
        </p>

        {localReply && (
          <div
            className='px-3 py-2 rounded-xl text-xs italic'
            style={{
              background: 'rgba(242,80,156,0.07)',
              border: '1px solid rgba(242,80,156,0.15)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span className='font-semibold not-italic' style={{ color: '#F2509C' }}>
              Respuesta:{' '}
            </span>
            {localReply}
          </div>
        )}

        {isOwnerOrAdmin && (
          <form
            onSubmit={handleReply}
            className='pt-3'
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <label className='dbe-label mb-2' style={{ color: '#F2509C' }}>
              {localReply ? 'Editar respuesta:' : 'Responder:'}
            </label>
            <div className='flex gap-2 items-end'>
              <textarea
                rows='2'
                className='flex-1 p-2.5 rounded-xl text-white text-xs outline-none resize-none'
                style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)' }}
                placeholder='Escribe una respuesta...'
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={300}
              />
              <button
                type='submit'
                disabled={isReplying || !replyText.trim()}
                className='px-3 py-2 rounded-xl font-bold text-xs transition'
                style={{
                  background:
                    isReplying || !replyText.trim()
                      ? 'rgba(255,255,255,0.07)'
                      : 'var(--dbe-gradient-h)',
                  color: isReplying || !replyText.trim() ? 'rgba(255,255,255,0.3)' : '#fff',
                  border: 'none',
                  cursor: isReplying || !replyText.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {isReplying ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </form>
        )}

        {canDelete && (
          <div
            className='flex justify-end pt-2'
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <button
              onClick={() =>
                openConfirm({
                  title: 'Eliminar reseña',
                  message: '¿Eliminar esta reseña? Esta acción no se puede deshacer.',
                  onConfirm: () => deleteReview(review._id),
                })
              }
              className='text-xs font-semibold transition'
              style={{ color: '#f87171' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#f87171')}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Review = () => {
  const { reviews, loading, error, getReviews } = useReviewStore();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');

  useEffect(() => {
    if (user?.restaurantId) getReviews(user.restaurantId);
  }, [user?.restaurantId]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  if (loading && reviews.length === 0) return <Spinner />;

  const filtered = reviews.filter((r) => {
    const matchesRating = filterRating === 'ALL' || r.rating === Number(filterRating);
    const q = search.trim().toLowerCase();
    return (
      matchesRating &&
      (!q || r.userName?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q))
    );
  });

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Reseñas</h1>
          <p className='text-sm' style={{ color: 'rgba(255,255,255,0.5)' }}>
            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} registrada
            {reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div
        className='rounded-xl p-4 mb-4'
        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Buscar por usuario o comentario...'
            className='dbe-input-dark md:col-span-2 w-full px-3 py-2 text-sm rounded-lg'
          />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg cursor-pointer'
          >
            <option value='ALL' style={{ background: '#1a1a2e' }}>
              Todas las calificaciones
            </option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n} style={{ background: '#1a1a2e' }}>
                {n} estrella{n !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className='rounded-xl p-6 text-center text-sm'
          style={{
            background: '#16161f',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          No hay reseñas para mostrar.
        </div>
      ) : (
        <div className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
          {filtered.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};