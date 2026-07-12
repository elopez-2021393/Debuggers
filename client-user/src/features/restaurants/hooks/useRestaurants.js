// client-user/src/features/restaurants/hooks/useRestaurants.js

import { useState, useCallback, useEffect } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useRestaurants = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get("/restaurants");
      const data = response.data.data || response.data;
      
      const restaurantsWithStatus = data.map((restaurant) => {
        const now = new Date();
        const currentHour = now.getHours();
        const openHour = parseInt(restaurant.businessHours?.open?.split(":")[0] || "0");
        const closeHour = parseInt(restaurant.businessHours?.close?.split(":")[0] || "24");
        const isOpen = currentHour >= openHour && currentHour < closeHour;
        
        return {
          _id: restaurant._id,
          name: restaurant.name,
          photo: restaurant.photo,
          address: restaurant.address,
          category: restaurant.category,
          businessHours: restaurant.businessHours,
          phone: restaurant.phone,
          capacity: restaurant.capacity,
          contactInfo: restaurant.contactInfo,
          isOpen,
        };
      });

      setRestaurants(restaurantsWithStatus);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar restaurantes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { restaurants, loading, error, refetch: fetchRestaurants };
};
