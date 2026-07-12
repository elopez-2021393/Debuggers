// client-user/src/features/events/hooks/useEvents.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPublicEvents = useCallback(async (restaurants) => {
    if (!restaurants?.length) return;
    try {
      setLoading(true);
      setError(null);

      const eventPromises = restaurants.map((restaurant) =>
        restaurantClient.get(`/events/restaurant/${restaurant._id}`)
      );

      const results = await Promise.allSettled(eventPromises);

      const allEvents = results
        .flatMap((result, index) => {
          if (result.status !== "fulfilled") return [];
          const data = result.value.data.data || result.value.data;
          const restaurant = restaurants[index];
          return (data || []).map((event) => ({
            ...event,
            restaurantName: restaurant.name,
            restaurantId: restaurant._id,
          }));
        })
        .filter(
          (event) => event.status === "active"
        );

      setEvents(allEvents);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinEvent = useCallback(async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post(`/events/${eventId}/join`);
      const data = response.data.data;

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event._id === eventId) {
            return {
              ...event,
              current_capacity: (event.current_capacity || 0) + 1,
            };
          }
          return event;
        })
      );
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Error al inscribirse al evento";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveEvent = useCallback(async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/events/${eventId}/join`);

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event._id === eventId) {
            return {
              ...event,
              current_capacity: Math.max((event.current_capacity || 1) - 1, 0),
            };
          }
          return event;
        })
      );
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Error al cancelar inscripción";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyEvent = useCallback(async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post(`/events/${eventId}/apply`);
      const data = response.data.data;

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event._id === eventId) {
            return {
              ...event,
              usos_actuales: (event.usos_actuales || 0) + 1,
            };
          }
          return event;
        })
      );
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Error al aplicar evento";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchAllPublicEvents,
    joinEvent,
    leaveEvent,
    applyEvent,
  };
};