// client-user/src/features/auth/screens/RegisterScreen.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import { useAuth } from "../hooks/useAuth";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { handleRegister, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      const result = await handleRegister(payload);
      if (result.success) {
        Alert.alert(
          "Registro exitoso",
          "Hemos enviado un correo de verificación a tu dirección de email. Por favor verifícalo antes de iniciar sesión.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (err) {
      // Error ya manejado en useAuth
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>

        <View style={styles.form}>
          <Input
            label="Nombre"
            control={control}
            name="firstName"
            rules={{
              required: "El nombre es requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 35, message: "Máximo 35 caracteres" },
              pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras" },
            }}
            error={errors.firstName?.message}
            placeholder="Ingresa tu nombre"
            autoCapitalize="words"
          />

          <Input
            label="Apellido"
            control={control}
            name="surname"
            rules={{
              required: "El apellido es requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 35, message: "Máximo 35 caracteres" },
              pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras" },
            }}
            error={errors.surname?.message}
            placeholder="Ingresa tu apellido"
            autoCapitalize="words"
          />

          <Input
            label="Usuario"
            control={control}
            name="username"
            rules={{
              required: "El usuario es requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 40, message: "Máximo 40 caracteres" },
              pattern: { value: /^\S+$/, message: "El usuario no puede contener espacios" },
            }}
            error={errors.username?.message}
            placeholder="Elige un nombre de usuario"
            autoCapitalize="none"
          />

          <Input
            label="Correo electrónico"
            control={control}
            name="email"
            rules={{
              required: "El correo es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo inválido",
              },
            }}
            error={errors.email?.message}
            placeholder="ejemplo@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Teléfono (opcional)"
            control={control}
            name="phone"
            rules={{
              pattern: {
                value: /^[0-9]{8}$/,
                message: "El teléfono debe tener 8 dígitos",
              },
            }}
            error={errors.phone?.message}
            placeholder="Ej: 12345678"
            keyboardType="phone-pad"
            maxLength={8}
          />

          <View style={styles.passwordRow}>
            <Input
              label="Contraseña"
              control={control}
              name="password"
              rules={{
                required: "La contraseña es requerida",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                  message: "Debe incluir al menos una letra y un número",
                },
              }}
              error={errors.password?.message}
              placeholder="Crea una contraseña"
              secureTextEntry={!passwordVisible}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.togglePasswordButton}
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
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              style={styles.togglePasswordButton}
            >
              <MaterialIcons
                name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Registrarse"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    flexGrow: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xl,
  },
  form: {
    width: "100%",
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
  button: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    textAlign: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default RegisterScreen;