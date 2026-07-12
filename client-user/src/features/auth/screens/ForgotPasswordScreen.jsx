// client-user/src/features/auth/screens/ForgotPasswordScreen.jsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import { useAuth } from "../hooks/useAuth";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { handleForgotPassword, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await handleForgotPassword(data.email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu correo para restablecer tu contraseña",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (err) {
      // Error ya manejado en useAuth
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="lock-reset" size={64} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla
      </Text>

      <View style={styles.form}>
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

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Enviar correo"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
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
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: SPACING.md,
  },
  backContainer: {
    alignSelf: "center",
    marginTop: SPACING.lg,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    textAlign: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default ForgotPasswordScreen;
