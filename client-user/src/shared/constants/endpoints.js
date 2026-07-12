// client-user/src/shared/constants/endpoints.js

export const ENDPOINTS = {
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:3013/debuggersEatsAdmin/v1",
  RESTAURANT: process.env.EXPO_PUBLIC_RESTAURANT_URL || "http://localhost:3014/add-restaurant/v1",
  REPORTS: process.env.EXPO_PUBLIC_REPORTS_URL || "http://localhost:5000",
};