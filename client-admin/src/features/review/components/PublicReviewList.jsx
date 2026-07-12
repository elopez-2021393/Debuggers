import { useEffect, useState } from 'react';
import { getReviews } from '../../../shared/apis/review.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { formatDate } from '../../../shared/utils/formatters.js';

const RATING_COLORS = {
    5: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    4: { bg: 'rgba(132,204,22,0.15)', color: '#a3e635' },
    3: { bg: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
    2: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
    1: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

export const PublicReviewList = ({ restaurantId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        getReviews(restaurantId)
            .then((res) => setReviews(res.data?.data ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [restaurantId]);

    const avgRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className='mt-10'>
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h2 className='text-xl font-bold text-white'>Reseñas</h2>
                    <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Lo que dicen otros usuarios
                    </p>
                </div>
                {avgRating && (
                    <div className='text-right'>
                        <p className='text-3xl font-bold' style={{ color: '#fbbf24' }}>★ {avgRating}</p>
                        <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {loading ? (
                <Spinner />
            ) : reviews.length === 0 ? (
                <div
                    className='rounded-xl p-8 text-center text-sm'
                    style={{
                        background: '#16161f',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.3)',
                    }}
                >
                    Este restaurante aún no tiene reseñas.
                </div>
            ) : (
                <div className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {reviews.map((review) => {
                        const ratingStyle = RATING_COLORS[review.rating] ?? RATING_COLORS[3];
                        return (
                            <div
                                key={review._id}
                                className='rounded-2xl p-4 flex flex-col gap-3'
                                style={{
                                    background: '#16161f',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                }}
                            >
                                <div className='flex items-start justify-between gap-2'>
                                    <div>
                                        <p className='font-semibold text-white text-sm'>{review.userName}</p>
                                        <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            {formatDate(review.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className='px-2 py-0.5 rounded-full text-xs font-semibold shrink-0'
                                        style={{ background: ratingStyle.bg, color: ratingStyle.color }}
                                    >
                                        ★ {review.rating}
                                    </span>
                                </div>

                                <p className='text-sm leading-relaxed' style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    "{review.comment}"
                                </p>

                                {review.reply && (
                                    <div
                                        className='px-3 py-2 rounded-xl text-xs italic'
                                        style={{
                                            background: 'rgba(242,80,156,0.07)',
                                            border: '1px solid rgba(242,80,156,0.15)',
                                            color: 'rgba(255,255,255,0.5)',
                                        }}
                                    >
                                        <span className='font-semibold not-italic' style={{ color: '#F2509C' }}>
                                            Respuesta del restaurante:{' '}
                                        </span>
                                        {review.reply}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};