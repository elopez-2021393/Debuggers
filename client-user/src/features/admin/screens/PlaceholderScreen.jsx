// client-user/src/features/admin/screens/PlaceholderScreen.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";

const PlaceholderScreen = ({ title, icon = "construction" }) => (
  <View style={styles.container}>
    <MaterialIcons name={icon} size={64} color={COLORS.primary} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>Esta sección está en desarrollo</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
});

export default PlaceholderScreen;
