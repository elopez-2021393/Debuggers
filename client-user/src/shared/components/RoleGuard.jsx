// client-user/src/shared/components/RoleGuard.jsx

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/authStore";
import { COLORS, SPACING, FONT_SIZE } from "../constants/theme";

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!_hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const hasAccess = isAuthenticated && allowedRoles.includes(user?.role);

  if (!hasAccess) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Acceso no autorizado</Text>
        <Text style={styles.unauthorizedSubtext}>
          No tienes permisos para acceder a esta sección
        </Text>
      </View>
    );
  }

  return children;
};

const styles = {
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  unauthorizedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  unauthorizedText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  unauthorizedSubtext: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
};
