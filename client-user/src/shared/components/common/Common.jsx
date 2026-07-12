// client-user/src/shared/components/common/Common.jsx

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, SHADOWS } from "../../constants/theme";

export const LoadingSpinner = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

export const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <MaterialIcons name={icon || "inbox"} size={64} color={COLORS.textMuted} />
    <Text style={styles.emptyTitle}>{title || "No hay datos"}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
});
