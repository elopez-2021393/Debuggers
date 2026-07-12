// client-user/src/shared/components/common/Input.jsx

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from "../../constants/theme";

const Input = ({ label, error, secureTextEntry, style, control, name, rules, ...textInputProps }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Si se pasa `control` y `name`, usar Controller de react-hook-form
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
              style={[
                styles.input,
                isFocused && styles.inputFocused,
                error && styles.inputError,
                style,
              ]}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={secureTextEntry}
              onFocus={() => setIsFocused(true)}
              onBlur={() => { setIsFocused(false); onBlur(); }}
              onChangeText={onChange}
              value={value}
              {...textInputProps}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}
      />
    );
  }

  // Modo sin react-hook-form (uso simple sin control)
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});

export default Input;