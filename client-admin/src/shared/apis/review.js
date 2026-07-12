import { axiosRestaurant } from './api';

export const getReviews = async (restaurantId) => {
  return await axiosRestaurant.get(`/reviews/restaurant/${restaurantId}`);
};

export const createReview = async (restaurantId, data) => {
  return await axiosRestaurant.post(`/reviews/restaurant/${restaurantId}`, data);
};

export const deleteReview = async (reviewId) => {
  return await axiosRestaurant.delete(`/reviews/${reviewId}`);
};

export const replyToReview = async (reviewId, reply) => {
  return await axiosRestaurant.post(`/reviews/${reviewId}/reply`, { reply });
};

export const getMyReviews = async () => {
  return await axiosRestaurant.get('/reviews/me');
};
