// client-user/src/features/reviews/hooks/useReviews.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useReviews = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get("/reviews/me");
      const data = response.data.data || response.data;
      setReviews(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar reseñas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (restaurantId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post(`/reviews/restaurant/${restaurantId}`, reviewData);
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al crear reseña");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/reviews/${reviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al eliminar reseña");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurantReviews = useCallback(async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/reviews/restaurant/${restaurantId}`);
      const data = response.data.data || response.data;
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar reseñas del restaurante");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchMyReviews,
    createReview,
    deleteReview,
    fetchRestaurantReviews,
  };
};
