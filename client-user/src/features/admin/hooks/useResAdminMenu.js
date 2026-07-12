// client-user/src/features/admin/hooks/useResAdminMenu.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useAuthStore } from "../../../shared/store/authStore";

export const useResAdminMenu = () => {
  const user = useAuthStore((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/menu/restaurant/${restaurantId}`);
      setMenuItems(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar menú");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const deleteMenuItem = useCallback(async (menuItemId) => {
    try {
      setError(null);
      await restaurantClient.delete(`/menu/${menuItemId}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== menuItemId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al eliminar platillo";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const _buildFormData = (menuData) => {
    const fd = new FormData();
    fd.append("name", menuData.name);
    fd.append("price", String(menuData.price));
    fd.append("category", menuData.category);
    fd.append("available", String(menuData.available ?? true));
    if (menuData.restaurantId) fd.append("restaurantId", menuData.restaurantId);
    if (menuData.description) fd.append("description", menuData.description);
    if (menuData.ingredients) {
      const ingredients = Array.isArray(menuData.ingredients)
        ? menuData.ingredients.join(", ")
        : menuData.ingredients;
      fd.append("ingredients", ingredients);
    }
    if (Array.isArray(menuData.availability?.days)) {
      menuData.availability.days.forEach((d) => fd.append("availability[days][]", d));
    }
    // Imagen: se espera un objeto { uri, name, type } compatible con React Native FormData
    if (menuData.photo) {
      fd.append("photo", {
        uri: menuData.photo.uri,
        name: menuData.photo.name || "photo.jpg",
        type: menuData.photo.type || "image/jpeg",
      });
    }
    return fd;
  };

  const createMenuItem = useCallback(
    async (menuData) => {
      try {
        setLoading(true);
        setError(null);
        const payload = _buildFormData({ ...menuData, restaurantId });
        const response = await restaurantClient.post("/menu", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const data = response.data.data || response.data;
        setMenuItems((prev) => [...prev, data]);
        return { success: true, data };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.response?.data?.error || "Error al crear platillo";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [restaurantId]
  );

  const updateMenuItem = useCallback(async (menuItemId, menuData) => {
    try {
      setLoading(true);
      setError(null);
      const payload = _buildFormData(menuData);
      const response = await restaurantClient.put(`/menu/${menuItemId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data.data || response.data;
      setMenuItems((prev) => prev.map((m) => (m._id === menuItemId ? data : m)));
      return { success: true, data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || "Error al actualizar platillo";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    deleteMenuItem,
    createMenuItem,
    updateMenuItem,
  };
};