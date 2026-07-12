// client-user/src/features/admin/screens/AdminUsersScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminRestaurants } from "../hooks/useAdminRestaurants";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import CreateUserModal from "../components/CreateUserModal";

const ROLE_STYLES = {
  ADMIN_ROLE: { bg: "rgba(242,80,156,0.15)", color: "#F2509C", label: "Admin" },
  RES_ADMIN_ROLE: { bg: "rgba(147,98,217,0.15)", color: "#9362d9", label: "Admin Restaurante" },
  USER_ROLE: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", label: "Usuario" },
};

const UserCard = ({ user, onToggleStatus, onDelete }) => {
  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.USER_ROLE;
  const formattedDate = new Date(user.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleToggle = () => {
    Alert.alert(
      user.isActive ? "Desactivar usuario" : "Activar usuario",
      `¿${user.isActive ? "Desactivar" : "Activar"} a "${user.username}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: user.isActive ? "Desactivar" : "Activar",
          style: user.isActive ? "destructive" : "default",
          onPress: () => onToggleStatus(user._id),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar usuario",
      `¿Eliminar a "${user.username}" permanentemente? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(user._id) },
      ]
    );
  };

  return (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.fullName}>
            {[user.firstName, user.surname].filter(Boolean).join(" ") || "—"}
          </Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
          <Text style={[styles.roleText, { color: roleStyle.color }]}>{roleStyle.label}</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <View
          style={[styles.statusIndicator, { backgroundColor: user.isActive ? "#4ade80" : "#f87171" }]}
        />
        <Text style={styles.statusText}>{user.isActive ? "Activo" : "Inactivo"}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.toggleButton]} onPress={handleToggle}>
          <MaterialIcons
            name={user.isActive ? "block" : "check-circle"}
            size={18}
            color={user.isActive ? "#fbbf24" : "#4ade80"}
          />
          <Text style={[styles.actionButtonText, { color: user.isActive ? "#fbbf24" : "#4ade80" }]}>
            {user.isActive ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <MaterialIcons name="delete" size={18} color={COLORS.error} />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const AdminUsersScreen = () => {
  const insets = useSafeAreaInsets();
  const { users, loading, error, fetchAllUsers, toggleUserStatus, deleteUser, createUser } =
    useAdminUsers();
  const {
    restaurants,
    loading: restaurantsLoading,
    fetchAllRestaurants,
  } = useAdminRestaurants();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAllUsers();
    fetchAllRestaurants(); // FIX: cargamos restaurantes para poder asignarlos a un res-admin
  }, [fetchAllUsers, fetchAllRestaurants]);

  // FIX: solo restaurantes que aún no tienen administrador asignado
  const availableRestaurants = restaurants.filter((r) => !r.assignedAdmin);

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const fullName = `${u.firstName || ""} ${u.surname || ""}`.trim().toLowerCase();
    const username = (u.username || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch = !q || fullName.includes(q) || username.includes(q) || email.includes(q);
    const matchesRole = roleFilter === "ALL" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (formData) => {
    setCreating(true);
    const result = await createUser(formData);
    setCreating(false);
    if (result.success) {
      Alert.alert("Éxito", "Usuario creado exitosamente");
      setModalVisible(false);
      if (formData.role === "RES_ADMIN_ROLE") {
        fetchAllRestaurants(); // FIX: refrescamos para que el restaurante ya no aparezca disponible
      }
    } else {
      Alert.alert("Error", result.error || "No se pudo crear el usuario");
    }
  };

  return (
    <View style={styles.container}>
      {/* FIX #5: paddingTop con insets */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <View>
          <Text style={styles.screenTitle}>Usuarios</Text>
          <Text style={styles.screenSubtitle}>Administra usuarios y roles</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nombre, usuario o correo..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilterScroll}>
          {["ALL", "ADMIN_ROLE", "RES_ADMIN_ROLE", "USER_ROLE"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleChip, roleFilter === role && styles.roleChipSelected]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[styles.roleChipText, roleFilter === role && styles.roleChipTextSelected]}>
                {role === "ALL" ? "Todos" : role.replace("_ROLE", "")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onToggleStatus={async (id) => {
              const result = await toggleUserStatus(id);
              if (result.success) {
                Alert.alert("Éxito", "Estado del usuario actualizado");
              } else {
                Alert.alert("Error", "No se pudo cambiar el estado");
              }
            }}
            onDelete={async (id) => {
              const result = await deleteUser(id);
              if (result.success) {
                Alert.alert("Éxito", "Usuario eliminado");
              } else {
                Alert.alert("Error", "No se pudo eliminar el usuario");
              }
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchAllUsers}
        ListEmptyComponent={
          <EmptyState icon="people" title="No hay usuarios" subtitle="No se encontraron usuarios" />
        }
      />

      <CreateUserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateUser}
        loading={creating}
        restaurants={availableRestaurants}
        restaurantsLoading={restaurantsLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // FIX #5: paddingTop se aplica inline con insets — aquí solo paddingBottom y paddingHorizontal
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: "700", marginBottom: SPACING.xs },
  screenSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filters: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: { marginBottom: SPACING.md },
  roleFilterScroll: { marginBottom: SPACING.sm },
  roleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  roleChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  roleChipTextSelected: { color: COLORS.text },
  listContent: { padding: SPACING.md },
  userCard: { marginBottom: SPACING.md },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  userInfo: { flex: 1 },
  username: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginBottom: SPACING.xs },
  fullName: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  roleBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  roleText: { fontSize: FONT_SIZE.xs, fontWeight: "600" },
  userDetails: { marginBottom: SPACING.md },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.xs },
  detailText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginLeft: SPACING.xs },
  statusBadge: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  statusText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  actions: { flexDirection: "row", gap: SPACING.sm },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  toggleButton: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" },
  deleteButton: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" },
  actionButtonText: { fontSize: FONT_SIZE.xs, fontWeight: "600", marginLeft: SPACING.xs },
  deleteButtonText: { fontSize: FONT_SIZE.xs, fontWeight: "600", marginLeft: SPACING.xs, color: COLORS.error },
});

export default AdminUsersScreen;