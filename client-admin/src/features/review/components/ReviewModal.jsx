import { useState } from 'react';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';
import { useReviewStore } from '../../review/store/reviewStore.js';

export const ReviewModal = ({ isOpen, onClose }) => {
  const { restaurants } = useRestaurantStore();
  const { createReview } = useReviewStore();

  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedRestaurant || !rating || !comment.trim()) return;
    setSubmitting(true);
    try {
      await createReview(selectedRestaurant, { rating, comment });
      setSelectedRestaurant('');
      setRating(null);
      setComment('');
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className='relative w-full max-w-[500px] mx-4 rounded-2xl p-7'
        style={{
          background: '#13131c',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 flex items-center justify-center rounded-lg text-[16px] font-bold transition-all'
          style={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.5)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 className='text-[22px] font-extrabold text-white mb-6'>Dejar Comentario</h2>

        {/* Restaurante */}
        <div className='mb-5'>
          <label
            className='block text-[12px] font-semibold mb-2'
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Restaurante
          </label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className='w-full rounded-xl px-4 py-3 text-[14px] outline-none appearance-none cursor-pointer'
            style={{
              background: '#0e0e17',
              border: `1px solid ${selectedRestaurant ? 'rgba(242,80,156,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: selectedRestaurant ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'border 0.2s',
            }}
          >
            <option value='' disabled>
              Selecciona un restaurante
            </option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id} style={{ background: '#13131c', color: '#fff' }}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Calificación */}
        <div className='mb-5'>
          <label
            className='block text-[12px] font-semibold mb-2.5'
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Calificación
          </label>
          <div className='flex gap-2'>
            {[1, 2, 3, 4, 5].map((num) => {
              const active = rating !== null && num <= rating;
              return (
                <button
                  key={num}
                  type='button'
                  onClick={() => setRating(num)}
                  className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all'
                  style={{
                    background: active ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: active ? '#eab308' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comentario */}
        <div className='mb-6'>
          <label
            className='block text-[12px] font-semibold mb-2'
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Comentario
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Describe tu experiencia...'
            maxLength={500}
            rows={4}
            className='w-full rounded-xl px-4 py-3 text-[13px] outline-none resize-none transition-all'
            style={{
              background: '#0e0e17',
              border: `1px solid ${comment ? 'rgba(242,80,156,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: '#fff',
              lineHeight: 1.6,
            }}
          />
          <div className='text-right text-[11px] mt-1' style={{ color: 'rgba(255,255,255,0.25)' }}>
            {comment.length} / 500
          </div>
        </div>

        {/* Botones */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all'
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedRestaurant || !rating || !comment.trim()}
            className='px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all'
            style={{
              background:
                submitting || !selectedRestaurant || !rating || !comment.trim()
                  ? 'rgba(255,255,255,0.07)'
                  : 'var(--dbe-gradient-h)',
              color:
                submitting || !selectedRestaurant || !rating || !comment.trim()
                  ? 'rgba(255,255,255,0.25)'
                  : '#fff',
              border: 'none',
              cursor:
                submitting || !selectedRestaurant || !rating || !comment.trim()
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      </div>
    </div>
  );
};
