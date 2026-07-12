// client-user/src/features/auth/hooks/useAuth.js

import { useState, useCallback } from "react";
import { useAuthStore } from "../../../shared/store/authStore";
import authClient from "../../../shared/api/authClient";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((state) => state.login);

  const handleLogin = useCallback(async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post("/auth/login", {
        username,
        password,
      });

      const data = response.data.data || response.data;
      const { user, token, refreshToken } = data;

      // Si es res-admin, buscar su restaurante para guardar restaurantId
      if (user?.role === "RES_ADMIN_ROLE") {
        try {
          // Buscar todos los restaurantes y encontrar el asignado a este admin
          const restResponse = await restaurantClient.get("/restaurants", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const restaurants = restResponse.data.data || restResponse.data;
          const myRestaurant = restaurants.find(
            (r) => r.assignedAdmin === user._id || r.assignedAdmin?._id === user._id || r.assignedAdmin?.toString() === user._id?.toString()
          );

          if (myRestaurant) {
            user.restaurantId = myRestaurant._id;
            user.restaurantName = myRestaurant.name;
          }
        } catch (restErr) {
          // No bloquear el login si falla la búsqueda del restaurante
          console.warn("No se pudo obtener el restaurante del admin:", restErr.message);
        }
      }

      await login(token, user, refreshToken);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async ({ firstName, surname, username, email, password, phone }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post("/auth/register", {
        firstName,
        surname,
        username,
        email,
        password,
        phone,
      });

      const data = response.data.data || response.data;
      return {
        success: true,
        emailVerificationRequired: data.emailVerificationRequired || true,
      };
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Error al registrar usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.post("/auth/forgot-password", { email });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Error al enviar correo de recuperación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    handleLogin,
    handleRegister,
    handleForgotPassword,
    loading,
    error,
  };
};