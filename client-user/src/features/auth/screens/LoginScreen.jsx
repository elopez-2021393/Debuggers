// client-user/src/features/auth/screens/LoginScreen.jsx

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import { useAuth } from "../hooks/useAuth";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { handleLogin, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await handleLogin(data);
    } catch (err) {
      // Error ya manejado en useAuth
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../../../assets/DebuggersEats_logo.png")} style={styles.logo} />
      <Text style={styles.welcomeText}>¡Bienvenido de vuelta!</Text>
      <Text style={styles.subtitleText}>Inicia sesión para continuar</Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="username"
          rules={{ required: "El usuario es requerido" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Usuario"
              placeholder="Ingresa tu usuario"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.username?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: "La contraseña es requerida" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Iniciar sesión"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: SPACING.md,
  },
  linkContainer: {
    alignSelf: "center",
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  registerLink: {
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

export default LoginScreen;