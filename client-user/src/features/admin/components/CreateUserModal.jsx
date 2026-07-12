// client-user/src/features/admin/components/CreateUserModal.jsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const ROLES = [
  { value: "RES_ADMIN_ROLE", label: "Admin Restaurante" },
  { value: "USER_ROLE", label: "Usuario" },
];

const defaultValues = {
  firstName: "",
  surname: "",
  email: "",
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: undefined,
  restaurantId: undefined,
};

const CreateUserModal = ({ visible, onClose, onSubmit, loading, restaurants = [], restaurantsLoading = false }) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues, mode: "onChange" });

  const selectedRole = watch("role");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // FIX: limpiamos el restaurante seleccionado si el rol deja de ser RES_ADMIN_ROLE
  useEffect(() => {
    if (selectedRole !== "RES_ADMIN_ROLE") {
      setValue("restaurantId", undefined);
    }
  }, [selectedRole, setValue]);

  // FIX: reseteamos el formulario solo cuando el modal se cierra (no al fallar el submit),
  // así el usuario no pierde lo que escribió si hubo un error del servidor
  useEffect(() => {
    if (!visible) {
      reset(defaultValues);
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
    }
  }, [visible, reset]);

  const submit = (values) => {
    const payload = {
      firstName: values.firstName.trim(),
      surname: values.surname.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
      phone: values.phone?.trim() || undefined,
      password: values.password,
      role: values.role,
      ...(values.role === "RES_ADMIN_ROLE" && { restaurantId: values.restaurantId }),
    };
    onSubmit(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Nuevo Usuario</Text>
              <Text style={styles.subtitle}>Completa la información para registrar un nuevo usuario</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <Input
              label="Nombre"
              control={control}
              name="firstName"
              rules={{
                required: "El nombre es obligatorio",
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                maxLength: { value: 50, message: "Máximo 50 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras" },
              }}
              error={errors.firstName?.message}
              placeholder="Ej: Juan"
              autoCapitalize="words"
              editable={!loading}
            />

            <Input
              label="Apellido"
              control={control}
              name="surname"
              rules={{
                required: "El apellido es obligatorio",
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                maxLength: { value: 50, message: "Máximo 50 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras" },
              }}
              error={errors.surname?.message}
              placeholder="Ej: Pérez"
              autoCapitalize="words"
              editable={!loading}
            />

            <Input
              label="Correo electrónico"
              control={control}
              name="email"
              rules={{
                required: "El correo es obligatorio",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Formato inválido" },
              }}
              error={errors.email?.message}
              placeholder="Ej: juan@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Input
              label="Nombre de usuario"
              control={control}
              name="username"
              rules={{
                required: "El username es obligatorio",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                maxLength: { value: 20, message: "Máximo 20 caracteres" },
                pattern: { value: /^\S+$/, message: "El username no puede contener espacios" },
              }}
              error={errors.username?.message}
              placeholder="Ej: juanperez"
              autoCapitalize="none"
              editable={!loading}
            />

            <Input
              label="Teléfono"
              control={control}
              name="phone"
              rules={{
                pattern: { value: /^[0-9]{8}$/, message: "El teléfono debe tener 8 dígitos" },
              }}
              error={errors.phone?.message}
              placeholder="Ej: 12345678"
              keyboardType="phone-pad"
              maxLength={8}
              editable={!loading}
            />

            {/* Rol */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol</Text>
              <Controller
                control={control}
                name="role"
                rules={{ required: "El rol es obligatorio" }}
                render={({ field: { onChange, value } }) => (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesScroll}>
                    {ROLES.map((role) => (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleButton,
                          value === role.value && styles.roleButtonSelected,
                          errors.role && !value && styles.roleButtonErrorBorder,
                        ]}
                        onPress={() => onChange(role.value)}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            value === role.value && styles.roleButtonTextSelected,
                          ]}
                        >
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              />
              {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
            </View>

            {/* Restaurante asignado, solo para RES_ADMIN_ROLE */}
            {selectedRole === "RES_ADMIN_ROLE" && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: "#a78bfa" }]}>Restaurante asignado</Text>

                {restaurantsLoading ? (
                  <View style={styles.restaurantLoadingBox}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.restaurantLoadingText}>Cargando restaurantes...</Text>
                  </View>
                ) : (
                  <Controller
                    control={control}
                    name="restaurantId"
                    rules={{ required: "Debes asignar un restaurante al RES_ADMIN_ROLE" }}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.restaurantBox}>
                        {restaurants.length === 0 ? (
                          <View style={styles.restaurantEmptyBox}>
                            <MaterialIcons name="storefront" size={22} color={COLORS.textSecondary} />
                            <Text style={styles.restaurantEmptyText}>
                              No hay restaurantes disponibles sin administrador asignado
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.restaurantList}>
                            {restaurants.map((restaurant) => (
                              <TouchableOpacity
                                key={restaurant._id}
                                style={[
                                  styles.restaurantItem,
                                  value === restaurant._id && styles.restaurantItemSelected,
                                ]}
                                onPress={() => onChange(restaurant._id)}
                                disabled={loading}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.restaurantName,
                                      value === restaurant._id && styles.restaurantNameSelected,
                                    ]}
                                  >
                                    {restaurant.name}
                                  </Text>
                                  {!!restaurant.address && (
                                    <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
                                  )}
                                </View>
                                {value === restaurant._id && (
                                  <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  />
                )}
                {errors.restaurantId && <Text style={styles.errorText}>{errors.restaurantId.message}</Text>}
              </View>
            )}

            <View style={styles.passwordRow}>
              <Input
                label="Contraseña"
                control={control}
                name="password"
                rules={{
                  required: "La contraseña es obligatoria",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                    message: "Debe incluir al menos una letra y un número",
                  },
                }}
                error={errors.password?.message}
                placeholder="Ej: Segura123"
                secureTextEntry={!passwordVisible}
                editable={!loading}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.togglePasswordButton}
                disabled={loading}
              >
                <MaterialIcons
                  name={passwordVisible ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordRow}>
              <Input
                label="Confirmar contraseña"
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Confirma la contraseña",
                  validate: (v) => v === getValues("password") || "Las contraseñas no coinciden",
                }}
                error={errors.confirmPassword?.message}
                placeholder="Repite la contraseña"
                secureTextEntry={!confirmPasswordVisible}
                editable={!loading}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                style={styles.togglePasswordButton}
                disabled={loading}
              >
                <MaterialIcons
                  name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={onClose}
              variant="secondary"
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              title={loading ? "Creando..." : "Crear"}
              onPress={handleSubmit(submit)}
              loading={loading}
              disabled={loading}
              style={{ flex: 1, marginLeft: SPACING.md }}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    maxWidth: 260,
  },
  content: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  togglePasswordButton: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg + 4,
    justifyContent: "center",
    alignItems: "center",
  },
  rolesScroll: {
    marginRight: -SPACING.lg,
    paddingRight: SPACING.lg,
  },
  roleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonErrorBorder: {
    borderColor: COLORS.error,
  },
  roleButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  roleButtonTextSelected: {
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  restaurantBox: {
    borderRadius: BORDER_RADIUS.lg,
  },
  restaurantList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  restaurantItemSelected: {
    backgroundColor: "rgba(242,80,156,0.1)",
  },
  restaurantName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  restaurantNameSelected: {
    color: COLORS.primary,
  },
  restaurantAddress: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  restaurantLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  restaurantLoadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.sm,
  },
  restaurantEmptyBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  restaurantEmptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateUserModal;