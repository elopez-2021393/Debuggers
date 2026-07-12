import { create } from 'zustand';
import {
  getReviews as getReviewsRequest,
  createReview as createReviewRequest,
  deleteReview as deleteReviewRequest,
  getMyReviews as getMyReviewsRequest,
} from '../../../shared/apis/review';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const useReviewStore = create((set, get) => ({
  reviews: [],
  myReviews: [],
  loading: false,
  error: null,

  getReviews: async (restaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getReviewsRequest(restaurantId);
      set({ reviews: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al listar reseñas', loading: false });
    }
  },

  getMyReviews: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getMyReviewsRequest();
      set({ myReviews: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al obtener tus reseñas', loading: false });
    }
  },

  createReview: async (restaurantId, reviewData) => {
    try {
      set({ loading: true, error: null });
      const response = await createReviewRequest(restaurantId, reviewData);
      set({
        myReviews: [response.data.data, ...get().myReviews],
        loading: false,
      });
      showSuccess('Reseña publicada');
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Error al publicar la reseña' });
      showError(err.response?.data?.message || 'Error al publicar la reseña');
      throw err;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      set({ loading: true, error: null });
      await deleteReviewRequest(reviewId);
      set({
        reviews: get().reviews.filter((r) => r._id !== reviewId),
        myReviews: get().myReviews.filter((r) => r._id !== reviewId),
        loading: false,
      });
      showSuccess('Reseña eliminada');
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Error al eliminar la reseña' });
      showError(err.response?.data?.message || 'No tienes permisos para eliminar');
    }
  },
}));
