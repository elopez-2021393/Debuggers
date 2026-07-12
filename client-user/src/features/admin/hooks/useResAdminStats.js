// client-user/src/features/admin/hooks/useResAdminStats.js

import { useState, useCallback, useEffect, useRef } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";
import { useReportsStore } from "../store/reportsStore";
import { useReviews } from "../../reviews/hooks/useReviews";

export const useResAdminStats = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;
  const restaurantName = user?.restaurantName;

  // initialLoading: solo true en la primera carga, no en refetch
  const [initialLoading, setInitialLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const { reporte, getReporteRestaurante } = useReportsStore();
  const { fetchRestaurantReviews } = useReviews();

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await restaurantClient.get(`/restaurants/${restaurantId}`);
      setRestaurant(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar restaurante");
    }
  }, [restaurantId]);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await restaurantClient.get(`/orders/restaurant/${restaurantId}`);
      setOrders(res.data.data || res.data);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    }
  }, [restaurantId]);

  const fetchReservations = useCallback(async () => {
    if (!restaurantName) return;
    try {
      const res = await restaurantClient.get(`/reservations/restaurant/${restaurantName}`);
      setReservations(res.data.data || res.data);
    } catch (err) {
      console.error("Error al cargar reservaciones:", err);
    }
  }, [restaurantName]);

  const fetchTables = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await restaurantClient.get(`/tables/restaurant/${restaurantId}`);
      setTables(res.data.data || res.data);
    } catch (err) {
      console.error("Error al cargar mesas:", err);
    }
  }, [restaurantId]);

  const fetchReviewsData = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchRestaurantReviews(restaurantId);
      setReviews(data || []);
    } catch (err) {
      console.error("Error al cargar reviews:", err);
    }
  }, [restaurantId, fetchRestaurantReviews]);

  const fetchAll = useCallback(async (isInitial = false) => {
    if (!restaurantId) return;
    if (isInitial) setInitialLoading(true);
  
    await Promise.all([
      fetchRestaurant(),
      fetchOrders(),
      fetchReservations(),
      fetchTables(),
      getReporteRestaurante(restaurantId),
      fetchReviewsData(),
    ]);
    if (isInitial) setInitialLoading(false);
  }, [restaurantId, fetchRestaurant, fetchOrders, fetchReservations, fetchTables, getReporteRestaurante, fetchReviewsData]);

  useEffect(() => {
    if (!restaurantId || hasFetched.current) return;
    hasFetched.current = true;
    fetchAll(true);
  }, [restaurantId, fetchAll]);

  return {
    loading: initialLoading,
    restaurant,
    orders,
    reservations,
    tables,
    reviews,
    reporte,
    error,
    refetch: () => fetchAll(false),
  };
};