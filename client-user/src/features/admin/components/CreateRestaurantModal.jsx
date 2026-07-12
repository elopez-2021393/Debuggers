// client-user/src/features/admin/components/CreateRestaurantModal.jsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert, Platform, Dimensions, KeyboardAvoidingView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const CATEGORIES = ["COMIDA_RAPIDA", "ITALIANA", "CHINA", "MEXICANA", "CAFETERIA"];
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.95;

// Convierte un string "HH:MM" a un objeto Date (con fecha de hoy, solo importa la hora)
const parseTimeString = (timeStr, fallbackHour, fallbackMinute) => {
  const d = new Date();
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(fallbackHour, fallbackMinute, 0, 0);
  }
  return d;
};

// Convierte un objeto Date a string "HH:MM"
const formatTimeString = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Convierte "HH:MM" a minutos desde medianoche, para poder comparar horarios entre sí
const timeStringToMinutes = (timeStr) => {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const CreateRestaurantModal = ({ visible, restaurant = null, onClose, onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      capacity: "",
      managerName: "",
      contactEmail: "",
      businessHoursOpen: "08:00",
      businessHoursClose: "22:00",
    },
  });

  const [category, setCategory] = useState("COMIDA_RAPIDA");
  const [preview, setPreview] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [openTime, setOpenTime] = useState(() => parseTimeString(null, 8, 0));
  const [closeTime, setCloseTime] = useState(() => parseTimeString(null, 22, 0));
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (restaurant) {
      const openStr = restaurant.businessHours?.open || "08:00";
      const closeStr = restaurant.businessHours?.close || "22:00";
      reset({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        capacity: restaurant.capacity?.toString() || "",
        managerName: restaurant.contactInfo?.managerName || "",
        contactEmail: restaurant.contactInfo?.email || "",
        businessHoursOpen: openStr,
        businessHoursClose: closeStr,
      });
      setCategory(restaurant.category || "COMIDA_RAPIDA");
      setOpenTime(parseTimeString(openStr, 8, 0));
      setCloseTime(parseTimeString(closeStr, 22, 0));
      setPreview(restaurant.photo || null);
      setPhoto(null);
    } else {
      reset({
        name: "",
        address: "",
        phone: "",
        capacity: "",
        managerName: "",
        contactEmail: "",
        businessHoursOpen: "08:00",
        businessHoursClose: "22:00",
      });
      setCategory("COMIDA_RAPIDA");
      setOpenTime(parseTimeString(null, 8, 0));
      setCloseTime(parseTimeString(null, 22, 0));
      setPreview(null);
      setPhoto(null);
    }
  }, [visible, restaurant, reset]);

  const handleOpenTimeChange = (event, time) => {
    if (Platform.OS === "android") setShowOpenPicker(false);
    if (event.type === "dismissed") return;
    if (time) {
      setOpenTime(time);
      setValue("businessHoursOpen", formatTimeString(time));
    }
  };

  const handleCloseTimeChange = (event, time) => {
    if (Platform.OS === "android") setShowClosePicker(false);
    if (event.type === "dismissed") return;
    if (time) {
      setCloseTime(time);
      setValue("businessHoursClose", formatTimeString(time));
    }
  };

  const onFormSubmit = (values) => {
    // El horario abre/cierra no pasa por un <Input>, así que se valida aparte,
    // igual que en CreateReviewModal se valida la calificación con Alert.
    const openMinutes = timeStringToMinutes(values.businessHoursOpen);
    const closeMinutes = timeStringToMinutes(values.businessHoursClose);
    if (openMinutes !== null && closeMinutes !== null && closeMinutes <= openMinutes) {
      Alert.alert("Horario inválido", "El horario de cierre debe ser posterior al horario de apertura");
      return;
    }

    if (restaurant) {
      // Edición: el endpoint PATCH /restaurants/:id espera JSON (no multipart),
      // y la foto se sube aparte con POST /restaurants/:id/photo.
      const payload = {
        name: values.name.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        category,
        capacity: Number(values.capacity),
        businessHours: {
          open: values.businessHoursOpen,
          close: values.businessHoursClose,
        },
        contactInfo: {
          managerName: values.managerName.trim(),
          email: values.contactEmail.trim(),
        },
      };

      onSubmit(payload, restaurant._id, photo);
    } else {
      // Creación: el endpoint POST /restaurants sí acepta multipart/form-data
      const payload = new FormData();
      payload.append("name", values.name.trim());
      payload.append("address", values.address.trim());
      payload.append("phone", values.phone.trim());
      payload.append("category", category);
      payload.append("capacity", values.capacity);
      payload.append("businessHoursOpen", values.businessHoursOpen);
      payload.append("businessHoursClose", values.businessHoursClose);
      payload.append("managerName", values.managerName.trim());
      payload.append("contactEmail", values.contactEmail.trim());
      if (photo) {
        payload.append("photo", photo);
      }

      onSubmit(payload, null, null);
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la galería para seleccionar la foto");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      const localUri = result.assets?.[0]?.uri || result.uri;
      const filename = localUri.split('/').pop();
      const match = filename?.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
      // Algunas URIs de Android (content://...) no traen extensión en el nombre;
      // el backend solo acepta image/jpeg, image/png, image/jpg, image/webp,
      // así que un mimetype genérico como 'image' hace que lo rechace.
      const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

      setPhoto({
        uri: localUri,
        name: filename,
        type,
      });
      setPreview(localUri);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Card style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{restaurant ? "Editar Restaurante" : "Crear Restaurante"}</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity
                style={styles.photoUploadButton}
                onPress={handlePickPhoto}
                disabled={loading}
              >
                {preview ? (
                  <Image source={{ uri: preview }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialIcons name="add-a-photo" size={24} color={COLORS.textSecondary} />
                    <Text style={styles.photoPlaceholderText}>Subir foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Input
              label="Nombre del restaurante"
              control={control}
              name="name"
              rules={{
                required: "El nombre del restaurante es obligatorio",
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              }}
              error={errors.name?.message}
              placeholder="Ej: Mi Restaurante"
              editable={!loading}
            />

            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Input
                  label="Dirección"
                  control={control}
                  name="address"
                  rules={{
                    required: "La dirección es obligatoria",
                    maxLength: { value: 150, message: "Máximo 150 caracteres" },
                  }}
                  error={errors.address?.message}
                  placeholder="Ej: Calle Principal 123"
                  editable={!loading}
                />
              </View>
              <View style={styles.formHalf}>
                <Input
                  label="Teléfono"
                  control={control}
                  name="phone"
                  rules={{
                    required: "El teléfono es obligatorio",
                    pattern: { value: /^\d{8}$/, message: "Debe ser de 8 dígitos" },
                  }}
                  error={errors.phone?.message}
                  placeholder="Ej: 2468-1234"
                  editable={!loading}
                  keyboardType="phone-pad"
                  maxLength={8}
                />
              </View>
            </View>

            {/* Categoría: en su propia fila, a todo el ancho, sin ScrollView anidado */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryWrap}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Capacidad"
              control={control}
              name="capacity"
              rules={{
                required: "La capacidad es obligatoria",
                pattern: { value: /^\d+$/, message: "Debe ser un número entero" },
                min: { value: 20, message: "Mínimo 20 personas" },
                max: { value: 500, message: "Máximo 500 personas" },
              }}
              error={errors.capacity?.message}
              placeholder="Ej: 50"
              editable={!loading}
              keyboardType="numeric"
            />

            {/* Horarios como date/time picker, mismo patrón que CreateReservationScreen */}
            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Horario apertura</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => !loading && setShowOpenPicker(true)}
                  disabled={loading}
                >
                  <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>{formatTimeString(openTime)}</Text>
                </TouchableOpacity>
                {showOpenPicker && (
                  <DateTimePicker
                    value={openTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleOpenTimeChange}
                    is24Hour={true}
                    textColor={COLORS.text}
                  />
                )}
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Horario cierre</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => !loading && setShowClosePicker(true)}
                  disabled={loading}
                >
                  <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>{formatTimeString(closeTime)}</Text>
                </TouchableOpacity>
                {showClosePicker && (
                  <DateTimePicker
                    value={closeTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleCloseTimeChange}
                    is24Hour={true}
                    textColor={COLORS.text}
                  />
                )}
              </View>
            </View>

            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Input
                  label="Encargado"
                  control={control}
                  name="managerName"
                  rules={{
                    maxLength: { value: 100, message: "Máximo 100 caracteres" },
                  }}
                  error={errors.managerName?.message}
                  placeholder="Ej: Carlos Méndez"
                  editable={!loading}
                />
              </View>
              <View style={styles.formHalf}>
                <Input
                  label="Correo contacto"
                  control={control}
                  name="contactEmail"
                  rules={{
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido" },
                  }}
                  error={errors.contactEmail?.message}
                  placeholder="Ej: contacto@restaurante.com"
                  editable={!loading}
                  keyboardType="email-address"
                />
              </View>
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
              title="Crear"
              onPress={handleSubmit(onFormSubmit)}
              loading={loading}
              disabled={loading}
              style={{ flex: 1, marginLeft: SPACING.md }}
            />
          </View>
        </Card>
      </KeyboardAvoidingView>
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
    height: MODAL_HEIGHT,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  content: {
    flex: 1,
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
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  photoUploadContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  photoUploadButton: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
  formGroupRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formHalf: {
    flex: 1,
  },
  categoryButtonTextSelected: {
    color: COLORS.text,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  pickerButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateRestaurantModal;