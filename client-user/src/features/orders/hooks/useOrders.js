// client-user/src/features/orders/hooks/useOrders.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  const fetchMyOrders = useCallback(async (userId, status) => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? { status } : {};
      const response = await restaurantClient.get(`/orders/user/${userId}`, { params });
      const data = response.data.data || response.data;
      
      const normalizedOrders = data.map((order) => ({
        _id: order._id,
        restaurantId: order.restaurantId,
        userId: order.userId,
        items: order.items,
        direccion: order.direccion,
        telefono: order.telefono,
        tipoPago: order.tipoPago,
        estimadoEntrega: order.estimadoEntrega,
        subtotal: order.subtotal,
        iva: order.iva,
        total: order.total,
        status: order.status,
        notas: order.notas,
        createdAt: order.createdAt,
      }));

      setOrders(normalizedOrders);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/orders/${orderId}`);
      const data = response.data.data || response.data;
      setOrderDetail(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar detalle del pedido");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/orders/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cancelar pedido");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmOrder = useCallback(async (body) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post("/orders", body);
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al confirmar pedido");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    orderDetail,
    loading,
    error,
    fetchMyOrders,
    fetchOrderDetail,
    cancelOrder,
    confirmOrder,
  };
};
