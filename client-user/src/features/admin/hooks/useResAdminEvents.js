import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";

export const useResAdminEvents = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/events/restaurant/${restaurantId}`);
      setEvents(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      setError(null);
      await restaurantClient.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al eliminar evento";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    try {
      setError(null);
      const response = await restaurantClient.post("/events", eventData);
      const data = response.data.data || response.data;
      setEvents((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al crear evento";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      setError(null);
      const response = await restaurantClient.patch(`/events/${eventId}`, eventData);
      const data = response.data.data || response.data;
      setEvents((prev) => prev.map((e) => (e._id === eventId ? data : e)));
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al actualizar evento";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    deleteEvent,
    createEvent,
    updateEvent,
  };
};

export const useResAdminReviews = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/reviews/restaurant/${restaurantId}`);
      setReviews(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar reseñas");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const replyToReview = useCallback(async (reviewId, reply) => {
    try {
      setError(null);
      const response = await restaurantClient.patch(`/reviews/${reviewId}/reply`, { reply });
      const updated = response.data.data || response.data;
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, reply: updated.reply ?? reply } : r))
      );
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al responder reseña";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    replyToReview,
  };
};
