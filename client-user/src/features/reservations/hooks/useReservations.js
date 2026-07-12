// client-user/src/features/reservations/hooks/useReservations.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";

export const useReservations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);

  const fetchMyReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get("/reservations");
      const data = response.data.data || response.data;

      const normalizedReservations = data
        .map((reservation) => ({
          _id: reservation._id,
          userId: reservation.userId,
          restaurantName: reservation.restaurantName,
          tableId: reservation.tableId,
          reservationDate: reservation.reservationDate,
          reservationHour: reservation.reservationHour,
          peopleName: reservation.peopleName,
          peopleNumber: reservation.peopleNumber,
          observation: reservation.observation,
          status: reservation.status,
          confirmationToken: reservation.confirmationToken,
          createdAt: reservation.createdAt,
        }))
        .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));

      setReservations(normalizedReservations);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar reservaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByRestaurant = useCallback(async (restaurantName, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(
        `/reservations/restaurant/${encodeURIComponent(restaurantName)}`,
        { params }
      );
      const data = response.data.data || response.data;

      const normalizedReservations = data
        .map((reservation) => ({
          _id: reservation._id,
          userId: reservation.userId,
          restaurantName: reservation.restaurantName,
          tableId: reservation.tableId,
          reservationDate: reservation.reservationDate,
          reservationHour: reservation.reservationHour,
          peopleName: reservation.peopleName,
          peopleNumber: reservation.peopleNumber,
          observation: reservation.observation,
          status: reservation.status,
          confirmationToken: reservation.confirmationToken,
          createdAt: reservation.createdAt,
        }))
        .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));

      setReservations(normalizedReservations);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar reservaciones del restaurante");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post("/reservations", data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al crear reservación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/reservations/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cancelar reservación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmOrCancelReservation = useCallback(async (token, action) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post("/reservations/confirm", { token, action });
      const updated = response.data.data;
      setReservations((prev) =>
        prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al procesar la acción");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailability = useCallback(async (restaurantName, date, hour) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(
        `/reservations/disponibilidad/${encodeURIComponent(restaurantName)}`,
        { params: { date, hour } }
      );
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al verificar disponibilidad");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTablesByRestaurant = useCallback(async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/tables/restaurant/${restaurantId}`);
      const data = response.data.data || response.data;
      return data.filter((table) => table.isActive === true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar mesas");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchMyReservations,
    fetchByRestaurant,
    createReservation,
    cancelReservation,
    confirmOrCancelReservation,
    fetchAvailability,
    fetchTablesByRestaurant,
  };
};

// ─── Hook exclusivo para res-admin ────────────────────────────────────────────
// Separado para mantener su propio estado de lista y exponer la interfaz
// que espera ReservationsListScreen (fetchReservations + updateReservationStatus).
export const useResAdminReservations = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantName = user?.restaurantName;

  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    if (!restaurantName) return;
    try {
      setLoading(true);
      setError(null);
      const res = await restaurantClient.get(
        `/reservations/restaurant/${encodeURIComponent(restaurantName)}`
      );
      setReservations(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar reservaciones");
    } finally {
      setLoading(false);
    }
  }, [restaurantName]);

  // El backend NO tiene PATCH /reservations/:id/status.
  // El único mecanismo es POST /reservations/confirm con { token, action }.
  // newStatus debe ser 'CONFIRMADA' o 'CANCELADA'.
  const updateReservationStatus = useCallback(
    async (reservationId, newStatus) => {
      const actionMap = { CONFIRMADA: "CONFIRMAR", CANCELADA: "CANCELAR" };
      const action = actionMap[newStatus];

      if (!action) {
        const msg = `Acción no soportada para el estado: ${newStatus}`;
        setError(msg);
        return { success: false, error: msg };
      }

      const reservation = reservations.find((r) => r._id === reservationId);
      const token = reservation?.confirmationToken;

      if (!token) {
        const msg = "Esta reservación no tiene token disponible. Solo se pueden gestionar reservaciones PENDIENTES.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        setError(null);
        const res = await restaurantClient.post("/reservations/confirm", { token, action });
        const data = res.data.data || res.data;
        setReservations((prev) =>
          prev.map((r) => (r._id === reservationId ? { ...r, ...data } : r))
        );
        return { success: true, data };
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al actualizar reservación";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [reservations]
  );

  return { reservations, loading, error, fetchReservations, updateReservationStatus };
};