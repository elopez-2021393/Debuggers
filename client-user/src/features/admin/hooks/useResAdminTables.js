import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";

export const useResAdminTables = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/tables/restaurant/${restaurantId}`);
      setTables(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar mesas");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const deleteTable = useCallback(async (tableId) => {
    try {
      setError(null);
      await restaurantClient.delete(`/tables/${tableId}`);
      setTables((prev) => prev.filter((t) => t._id !== tableId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al eliminar mesa";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const createTable = useCallback(async (tableData) => {
    try {
      setError(null);
      const payload = {
        restaurantId,
        tableNumber: tableData.tableNumber,
        capacity: parseInt(tableData.capacity),
        location: tableData.location || undefined,
      };
      const response = await restaurantClient.post("/tables", payload);
      const data = response.data.data || response.data;
      setTables((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al crear mesa";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [restaurantId]);

  const updateTable = useCallback(async (tableId, tableData) => {
    try {
      setError(null);
      const payload = {
        tableNumber: tableData.tableNumber,
        capacity: parseInt(tableData.capacity),
        location: tableData.location || undefined,
      };
      const response = await restaurantClient.patch(`/tables/${tableId}`, payload);
      const data = response.data.data || response.data;
      setTables((prev) => prev.map((t) => (t._id === tableId ? data : t)));
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al actualizar mesa";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const toggleTableStatus = useCallback(async (tableId) => {
    try {
      setError(null);
      const response = await restaurantClient.patch(`/tables/${tableId}/status`);
      const data = response.data.data || response.data;
      setTables((prev) => prev.map((t) => (t._id === tableId ? data : t)));
      return { success: true, isActive: data.isActive };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al cambiar estado";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    tables,
    loading,
    error,
    fetchTables,
    deleteTable,
    createTable,
    updateTable,
    toggleTableStatus,
  };
};
