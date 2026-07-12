// client-user/src/features/auth/screens/VerifyEmailScreen.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";

const VerifyEmailScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="mark-email-unread" size={80} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>Verifica tu correo</Text>
      <Text style={styles.subtitle}>
        Hemos enviado un enlace de verificación a tu correo electrónico. 
        Por favor haz clic en el enlace para activar tu cuenta.
      </Text>

      <Text style={styles.note}>
        Nota: El enlace de verificación se abrirá en tu navegador. 
        Una vez verificado, podrás iniciar sesión en la aplicación.
      </Text>

      <Button
        title="Volver al inicio"
        onPress={() => navigation.navigate("Login")}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  note: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  button: {
    width: "100%",
  },
});

export default VerifyEmailScreen;
