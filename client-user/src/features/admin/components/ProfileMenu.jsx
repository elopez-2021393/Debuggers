// client-user/src/features/admin/components/ProfileMenu.jsx

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";

const ProfileMenu = () => {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN_ROLE: "Admin",
      RES_ADMIN_ROLE: "Admin Restaurante",
      USER_ROLE: "Usuario",
    };
    return labels[role] || role;
  };

  if (!user) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="account-circle" size={36} color={COLORS.primary} />
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>{user.username || "Usuario"}</Text>
          <Text style={styles.role} numberOfLines={1}>{getRoleLabel(user.role)}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <Card style={styles.menuCard}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHeader}>
                <MaterialIcons name="account-circle" size={48} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
                <View style={styles.menuUserInfo}>
                  <Text style={styles.menuUsername} numberOfLines={1}>{user.username}</Text>
                  <Text style={styles.menuEmail} numberOfLines={1}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.roleBadgeContainer}>
                <View style={styles.roleBadge}>
                  <MaterialIcons name="shield" size={14} color={COLORS.primary} />
                  <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                <MaterialIcons name="logout" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Botón trigger — sin fondo, sin padding, inline dentro del header
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  userInfo: { maxWidth: 120 },
  username: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  role: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 1 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  menuCard: {
    width: "90%", maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  menuHeader: {
    flexDirection: "row", alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuUserInfo: { flex: 1 },
  menuUsername: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "600", marginBottom: SPACING.xs },
  menuEmail: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  roleBadgeContainer: { padding: SPACING.lg, alignItems: "flex-start" },
  roleBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  roleBadgeText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },
  logoutButton: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    marginTop: SPACING.lg, gap: SPACING.md,
  },
  logoutText: { color: COLORS.error, fontSize: FONT_SIZE.md, fontWeight: "600" },
});

export default ProfileMenu;