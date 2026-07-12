// client-user/src/features/profile/screens/ProfileScreen.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "../../../shared/store/authStore";
import authClient from "../../../shared/api/authClient";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const Avatar = ({ firstName, surname, photo }) => {
  const initials = `${firstName?.[0] || ""}${surname?.[0] || ""}`.toUpperCase();
  if (photo) return <Image source={{ uri: photo }} style={styles.avatarImage} />;
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const QuickAccessItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickItem} activeOpacity={0.7}>
    <View style={styles.quickIconWrap}>
      <MaterialIcons name={icon} size={24} color={COLORS.primary} />
    </View>
    <Text style={styles.quickTitle}>{title}</Text>
    {subtitle ? <Text style={styles.quickSub}>{subtitle}</Text> : null}
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      surname: user?.surname || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName || "",
      surname: user?.surname || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
    });
  }, [user, reset]);

  const handleSave = async (data) => {
    try {
      setLoading(true);
      await authClient.put("/auth/profile", {
        firstName: data.firstName,
        surname: data.surname,
        email: data.email,
        username: data.username,
        phone: data.phone,
      });
      updateUser(data);
      setIsEditing(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo actualizar el perfil";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || "",
      surname: user?.surname || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("¿Cerrar sesión?", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: async () => await logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con avatar */}
      <View style={styles.header}>
        <Avatar firstName={user?.firstName} surname={user?.surname} photo={user?.photo} />
        <Text style={styles.name}>{`${user?.firstName || ""} ${user?.surname || ""}`}</Text>
        <Text style={styles.username}>@{user?.username || ""}</Text>
        {user?.role === "USER_ROLE" && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Usuario</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Información personal */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          {isEditing ? (
            <>
              <Controller
                control={control}
                name="firstName"
                rules={{ required: "El nombre es requerido" }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Nombre"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="surname"
                rules={{ required: "El apellido es requerido" }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Apellido"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.surname?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Correo inválido",
                  },
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Correo electrónico"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="username"
                rules={{
                  required: "El usuario es obligatorio",
                  minLength: { value: 2, message: "Mín. 2 caracteres" },
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Usuario"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    error={errors.username?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Teléfono (opcional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    error={errors.phone?.message}
                  />
                )}
              />
              <View style={styles.editButtons}>
                <Button
                  title="Guardar"
                  onPress={handleSubmit(handleSave)}
                  loading={loading}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                />
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Nombre" value={user?.firstName || ""} />
              <InfoRow label="Apellido" value={user?.surname || ""} />
              <InfoRow label="Correo" value={user?.email || ""} />
              <InfoRow label="Teléfono" value={user?.phone || "No especificado"} />
              <InfoRow label="Usuario" value={user?.username || ""} />
              <Button
                title="Editar perfil"
                variant="secondary"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              />
            </>
          )}
        </Card>

        {/* Accesos rápidos — grid 3 columnas */}
        <Text style={styles.sectionLabel}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          <QuickAccessItem
            icon="rate-review"
            title="Mis Reseñas"
            onPress={() => navigation.navigate("MyReviews")}
          />
          <QuickAccessItem
            icon="event-seat"
            title="Reservaciones"
            onPress={() => navigation.navigate("ReservationsList")}
          />
          <QuickAccessItem
            icon="shopping-cart"
            title="Mis Pedidos"
            onPress={() => navigation.navigate("Pedidos")}
          />
        </View>

        <Button
          title="Cerrar sesión"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
    alignItems: "center",
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: SPACING.md,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  username: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + "22",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  content: {
    padding: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  editButton: { marginTop: SPACING.md },
  editButtons: { flexDirection: "row", marginTop: SPACING.md, gap: SPACING.sm },
  saveButton: { flex: 1 },
  cancelButton: { flex: 1 },
  // Accesos rápidos
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  quickGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  quickSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  logoutButton: {
    marginBottom: SPACING.xl,
  },
});

export default ProfileScreen;