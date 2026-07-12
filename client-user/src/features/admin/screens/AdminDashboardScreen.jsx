// client-user/src/features/admin/screens/AdminDashboardScreen.jsx

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import ProfileMenu from "../components/ProfileMenu";

const ADMIN_MENU_ITEMS = [
  { title: "Restaurantes", subtitle: "Ver todos los restaurantes", icon: "restaurant", route: "RestaurantsList" },
  { title: "Usuarios", subtitle: "Gestionar usuarios del sistema", icon: "people", route: "AdminUsers" },
  { title: "Reportes Plataforma", subtitle: "Estadísticas globales", icon: "analytics", route: "AdminReports" },
];

const AdminDashboardScreen = () => {
  const navigation = useNavigation();

  const handleNavigate = (route) => {
    navigation.navigate(route);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Gestión de plataforma</Text>
      </View>

      <View style={styles.content}>
        <ProfileMenu />

        {ADMIN_MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigate(item.route)}
            style={styles.menuItem}
          >
            <Card style={styles.menuCard}>
              <View style={styles.menuIconContainer}>
                <MaterialIcons name={item.icon} size={32} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  content: {
    padding: SPACING.xl,
  },
  menuItem: {
    marginBottom: SPACING.md,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  menuSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
});

export default AdminDashboardScreen;
