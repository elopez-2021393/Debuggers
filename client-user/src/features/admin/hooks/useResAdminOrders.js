// client-user/src/features/admin/hooks/useResAdminOrders.js

import { useState, useCallback, useRef } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";

// ─── Constantes alineadas con el backend ─────────────────────────────────────
export const ORDER_STATUS = {
  PENDIENTE: "Pendiente",
  ACEPTADO: "Aceptado",
  EN_PREPARACION: "En_preparación",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDIENTE]: [ORDER_STATUS.ACEPTADO, ORDER_STATUS.CANCELADO],
  [ORDER_STATUS.ACEPTADO]: [ORDER_STATUS.EN_PREPARACION, ORDER_STATUS.CANCELADO],
  [ORDER_STATUS.EN_PREPARACION]: [ORDER_STATUS.LISTO],
  [ORDER_STATUS.LISTO]: [ORDER_STATUS.ENTREGADO],
  [ORDER_STATUS.ENTREGADO]: [],
  [ORDER_STATUS.CANCELADO]: [],
};

export const NEXT_STATUS = {
  [ORDER_STATUS.PENDIENTE]: ORDER_STATUS.ACEPTADO,
  [ORDER_STATUS.ACEPTADO]: ORDER_STATUS.EN_PREPARACION,
  [ORDER_STATUS.EN_PREPARACION]: ORDER_STATUS.LISTO,
  [ORDER_STATUS.LISTO]: ORDER_STATUS.ENTREGADO,
};

const POLL_INTERVAL_MS = 30_000;

// ─── Hook de reservaciones (res-admin) ───────────────────────────────────────
// El backend NO tiene PATCH /reservations/:id/status.
// El único endpoint para confirmar/cancelar es POST /reservations/confirm
// con { token, action: 'CONFIRMAR' | 'CANCELAR' }.
// Las reservaciones obtenidas por getReservationsByRestaurant incluyen
// el campo confirmationToken cuando el status es PENDIENTE.
// Los valores reales de status en el backend son:
//   PENDIENTE → CONFIRMADA (action: CONFIRMAR)
//   PENDIENTE → CANCELADA  (action: CANCELAR)
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

  // Usa POST /reservations/confirm con { token, action: 'CONFIRMAR' | 'CANCELAR' }
  // igual que client-admin (reservationStore.processToken → confirmOrCancel).
  // newStatus debe ser 'CONFIRMADA' o 'CANCELADA' (valores reales del backend).
  const updateReservationStatus = useCallback(async (reservationId, newStatus) => {
    // Mapear el estado deseado a la acción que entiende el backend
    const actionMap = {
      CONFIRMADA: "CONFIRMAR",
      CANCELADA: "CANCELAR",
    };
    const action = actionMap[newStatus];

    if (!action) {
      const msg = `Acción no soportada para el estado: ${newStatus}`;
      setError(msg);
      return { success: false, error: msg };
    }

    // Buscar el token de la reservación en el estado local
    const reservation = reservations.find((r) => r._id === reservationId);
    const token = reservation?.confirmationToken;

    if (!token) {
      const msg =
        "Esta reservación no tiene token disponible. Solo se pueden confirmar o cancelar reservaciones PENDIENTES.";
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      setError(null);
      const res = await restaurantClient.post("/reservations/confirm", {
        token,
        action,
      });
      const data = res.data.data || res.data;
      // Actualizar la reservación en el estado local
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
  }, [reservations]);

  return { reservations, loading, error, fetchReservations, updateReservationStatus };
};

// ─── Hook de pedidos ──────────────────────────────────────────────────────────
export const useResAdminOrders = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchOrders = useCallback(
    async (params = {}) => {
      if (!restaurantId) return;
      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams();
        if (params.status) query.set("status", params.status);
        if (params.todos) query.set("todos", "true");

        const qs = query.toString();
        const url = `/orders/restaurant/${restaurantId}${qs ? `?${qs}` : ""}`;
        const res = await restaurantClient.get(url);
        setOrders(res.data.data || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    },
    [restaurantId]
  );

  const startPolling = useCallback(
    (params = {}) => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => fetchOrders(params), POLL_INTERVAL_MS);
    },
    [fetchOrders]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, currentStatus, newStatus) => {
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return {
        ok: false,
        message: `Transición inválida: ${currentStatus} → ${newStatus}`,
      };
    }
    try {
      setLoadingAction(true);
      setError(null);
      const res = await restaurantClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      const updated = res.data.data || res.data;
      const updatedStatus = updated.status ?? newStatus;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updatedStatus } : o))
      );
      return { ok: true, status: updatedStatus };
    } catch (err) {
      const message = err.response?.data?.message || "Error al actualizar el estado";
      setError(message);
      return { ok: false, message };
    } finally {
      setLoadingAction(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      setLoadingAction(true);
      setError(null);
      const res = await restaurantClient.delete(`/orders/${orderId}`);
      const updated = res.data.data || res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: ORDER_STATUS.CANCELADO, ...updated }
            : o
        )
      );
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.message || "Error al cancelar el pedido";
      setError(message);
      return { ok: false, message };
    } finally {
      setLoadingAction(false);
    }
  }, []);

  const nextStatus = useCallback(
    (currentStatus) => NEXT_STATUS[currentStatus] ?? null,
    []
  );

  return {
    orders,
    loading,
    loadingAction,
    error,
    fetchOrders,
    startPolling,
    stopPolling,
    updateOrderStatus,
    cancelOrder,
    nextStatus,
  };
};