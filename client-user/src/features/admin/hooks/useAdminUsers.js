// client-user/src/features/admin/hooks/useAdminUsers.js

import { useState, useCallback } from "react";
import authClient from "../../../shared/api/authClient";

export const useAdminUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authClient.get("/auth/users");
      const data = response.data.data || response.data;
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authClient.patch(`/auth/users/${userId}/status`);
      const data = response.data.data || response.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: data.isActive } : u))
      );
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cambiar estado");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await authClient.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al eliminar usuario");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authClient.post("/auth", userData);
      const data = response.data.data || response.data;
      setUsers((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al crear usuario");
      return { success: false, error: err.response?.data?.message || err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    toggleUserStatus,
    deleteUser,
    createUser,
  };
};
