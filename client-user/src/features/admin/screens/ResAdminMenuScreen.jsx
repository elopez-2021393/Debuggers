// client-user/src/features/admin/screens/ResAdminMenuScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Modal, TextInput, Alert, Switch, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  COLORS, SPACING, FONT_SIZE, BORDER_RADIUS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import { useResAdminMenu } from "../hooks/useResAdminMenu";

const CATEGORIES = [
  { value: "DESAYUNO", label: "Desayuno" },
  { value: "ALMUERZO", label: "Almuerzo" },
  { value: "CENA", label: "Cena" },
  { value: "BEBIDA", label: "Bebida" },
  { value: "POSTRE", label: "Postre" },
];

const DAYS = [
  { value: "LUNES", label: "L" },
  { value: "MARTES", label: "M" },
  { value: "MIERCOLES", label: "W" },
  { value: "JUEVES", label: "J" },
  { value: "VIERNES", label: "V" },
  { value: "SABADO", label: "S" },
  { value: "DOMINGO", label: "D" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  ingredients: "",
  available: true,
  availabilityDays: [],
  photo: null, // { uri, name, type }
};

const EMPTY_ERRORS = {
  name: "",
  description: "",
  price: "",
  category: "",
  ingredients: "",
  availabilityDays: "",
};

// Reglas alineadas con las de client-admin (MenuModal.jsx) para mantener
// el mismo criterio de validación entre plataformas.
const validateForm = (formData) => {
  const errors = { ...EMPTY_ERRORS };

  const name = formData.name.trim();
  if (!name) errors.name = "El nombre es obligatorio";
  else if (name.length < 2) errors.name = "Mínimo 2 caracteres";
  else if (name.length > 100) errors.name = "Máximo 100 caracteres";

  const description = formData.description.trim();
  if (!description) errors.description = "La descripción es obligatoria";
  else if (description.length < 10) errors.description = "Mínimo 10 caracteres";
  else if (description.length > 255) errors.description = "Máximo 255 caracteres";

  const price = parseFloat(formData.price);
  if (!formData.price) errors.price = "El precio es obligatorio";
  else if (Number.isNaN(price) || price <= 0) errors.price = "El precio debe ser mayor a 0";
  else if (price > 5000) errors.price = "Precio demasiado alto";

  if (!formData.category) errors.category = "La categoría es obligatoria";

  const ingredients = formData.ingredients.trim();
  if (!ingredients) errors.ingredients = "Ingresa al menos un ingrediente";
  else if (ingredients.length > 200) errors.ingredients = "Máximo 200 caracteres";

  if (formData.availabilityDays.length === 0) {
    errors.availabilityDays = "Selecciona al menos un día disponible";
  }

  return errors;
};

const hasErrors = (errors) => Object.values(errors).some((msg) => msg);

const ResAdminMenuScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    menuItems, loading, error,
    fetchMenuItems, deleteMenuItem, createMenuItem, updateMenuItem,
  } = useResAdminMenu();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState(EMPTY_ERRORS);

  useEffect(() => {
    fetchMenuItems();
    const unsubscribe = navigation.addListener("focus", () => fetchMenuItems());
    return unsubscribe;
  }, [navigation, fetchMenuItems]);

  // Actualiza un campo del form y limpia su error en cuanto el usuario escribe
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }));
    if (formErrors.availabilityDays) {
      setFormErrors((prev) => ({ ...prev, availabilityDays: "" }));
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar una imagen.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop();
      const ext = fileName.split(".").pop().toLowerCase();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      setFormData((prev) => ({
        ...prev,
        photo: { uri: asset.uri, name: fileName, type: mimeType },
      }));
    }
  };

  const handleOpenModal = (item = null) => {
    setFormErrors(EMPTY_ERRORS);
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        category: item.category || "",
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients.join(", ")
          : item.ingredients || "",
        available: item.available ?? true,
        availabilityDays: item.availability?.days || [],
        photo: null, // null = no cambia la foto existente
      });
    } else {
      setEditingItem(null);
      setFormData(EMPTY_FORM);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors(EMPTY_ERRORS);
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (hasErrors(errors)) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(EMPTY_ERRORS);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      ingredients: formData.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
      available: formData.available,
      availability: { days: formData.availabilityDays },
      photo: formData.photo || undefined, // solo se envía si hay imagen nueva
    };

    if (editingItem) {
      const result = await updateMenuItem(editingItem._id, payload);
      if (result.success) {
        Alert.alert("Éxito", "Platillo actualizado correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al actualizar platillo");
      }
    } else {
      const result = await createMenuItem(payload);
      if (result.success) {
        Alert.alert("Éxito", "Platillo creado correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al crear platillo");
      }
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar", style: "destructive",
          onPress: async () => {
            const result = await deleteMenuItem(item._id);
            if (!result.success) Alert.alert("Error", "Error al eliminar platillo");
          },
        },
      ]
    );
  };

  const renderMenuCard = ({ item }) => (
    <Card style={styles.menuCard}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.menuImage} resizeMode="cover" />
      ) : item.image ? (
        <Image source={{ uri: item.image }} style={styles.menuImage} resizeMode="cover" />
      ) : (
        <View style={styles.menuImagePlaceholder}>
          <MaterialIcons name="restaurant" size={32} color={COLORS.textMuted} />
        </View>
      )}

      <View style={styles.menuHeader}>
        <View style={styles.menuInfo}>
          <Text style={styles.menuName}>{item.name}</Text>
          {item.category && (
            <Text style={styles.menuCategory}>
              {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
            </Text>
          )}
        </View>
        <View style={styles.menuPriceCol}>
          <Text style={styles.menuPrice}>Q{item.price?.toFixed(2)}</Text>
          <View style={[styles.availableBadge, { backgroundColor: item.available ? COLORS.success : COLORS.error }]}>
            <Text style={styles.availableText}>
              {item.available ? "Disponible" : "No disponible"}
            </Text>
          </View>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.menuDescription}>{item.description}</Text>
      ) : null}

      {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
        <Text style={styles.menuIngredients}>🧂 {item.ingredients.join(", ")}</Text>
      )}

      {item.availability?.days?.length > 0 && (
        <View style={styles.daysRow}>
          {DAYS.map((d) => (
            <View
              key={d.value}
              style={[styles.dayPill, item.availability.days.includes(d.value) && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillText, item.availability.days.includes(d.value) && styles.dayPillTextActive]}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.menuActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleOpenModal(item)}>
          <MaterialIcons name="edit" size={18} color={COLORS.white} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
          <MaterialIcons name="delete" size={18} color={COLORS.white} />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.screenTitle}>Menú del Restaurante</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <MaterialIcons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {menuItems.length > 0 ? (
        <FlatList
          data={menuItems}
          renderItem={renderMenuCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="restaurant-menu" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No hay platillos registrados</Text>
          <Text style={styles.emptySubtext}>Crea tu primer platillo para comenzar</Text>
          <Button title="Agregar Platillo" onPress={() => handleOpenModal()} style={styles.emptyButton} />
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? "Editar Platillo" : "Agregar Platillo"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>

              {/* Imagen */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Foto del platillo</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                  {formData.photo ? (
                    <Image
                      source={{ uri: formData.photo.uri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  ) : editingItem?.photo || editingItem?.image ? (
                    <>
                      <Image
                        source={{ uri: editingItem.photo || editingItem.image }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <MaterialIcons name="edit" size={20} color={COLORS.white} />
                        <Text style={styles.imageOverlayText}>Cambiar foto</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialIcons name="add-a-photo" size={32} color={COLORS.textMuted} />
                      <Text style={styles.imagePlaceholderText}>Toca para agregar foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {formData.photo && (
                  <TouchableOpacity
                    onPress={() => setFormData((prev) => ({ ...prev, photo: null }))}
                    style={styles.removeImageBtn}
                  >
                    <MaterialIcons name="close" size={14} color={COLORS.error} />
                    <Text style={styles.removeImageText}>Quitar foto</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Nombre del platillo"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.name}
                  onChangeText={(text) => updateField("name", text)}
                />
                {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descripción *</Text>
                <TextInput
                  style={[styles.input, styles.textarea, formErrors.description && styles.inputError]}
                  placeholder="Descripción del platillo"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.description}
                  onChangeText={(text) => updateField("description", text)}
                  multiline
                  numberOfLines={3}
                />
                {formErrors.description ? <Text style={styles.errorText}>{formErrors.description}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Precio *</Text>
                <TextInput
                  style={[styles.input, formErrors.price && styles.inputError]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.price}
                  onChangeText={(text) => updateField("price", text)}
                  keyboardType="decimal-pad"
                />
                {formErrors.price ? <Text style={styles.errorText}>{formErrors.price}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.chip,
                        formData.category === cat.value && styles.chipSelected,
                        formErrors.category && styles.chipError,
                      ]}
                      onPress={() => updateField("category", cat.value)}
                    >
                      <Text style={[styles.chipText, formData.category === cat.value && styles.chipTextSelected]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {formErrors.category ? <Text style={styles.errorText}>{formErrors.category}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ingredientes *</Text>
                <TextInput
                  style={[styles.input, formErrors.ingredients && styles.inputError]}
                  placeholder="queso, tomate, albahaca..."
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.ingredients}
                  onChangeText={(text) => updateField("ingredients", text)}
                />
                {formErrors.ingredients ? (
                  <Text style={styles.errorText}>{formErrors.ingredients}</Text>
                ) : (
                  <Text style={styles.hint}>Separados por coma</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Días disponibles *</Text>
                <View style={styles.daysSelector}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayBtn,
                        formData.availabilityDays.includes(day.value) && styles.dayBtnSelected,
                        formErrors.availabilityDays && styles.dayBtnError,
                      ]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text style={[styles.dayBtnText, formData.availabilityDays.includes(day.value) && styles.dayBtnTextSelected]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.availabilityDays ? (
                  <Text style={styles.errorText}>{formErrors.availabilityDays}</Text>
                ) : null}
              </View>

            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" onPress={handleCloseModal} style={styles.cancelButton} textStyle={styles.cancelText} />
              <Button title={editingItem ? "Actualizar" : "Crear"} onPress={handleSubmit} loading={loading} style={styles.submitButton} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  addButton: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  listContent: { padding: SPACING.lg },
  menuCard: { marginBottom: SPACING.md, padding: 0, overflow: "hidden" },
  menuImage: { width: "100%", height: 160 },
  menuImagePlaceholder: {
    width: "100%", height: 100,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center", alignItems: "center",
  },
  menuHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    padding: SPACING.md, paddingBottom: 0,
  },
  menuInfo: { flex: 1 },
  menuName: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700", marginBottom: SPACING.xs },
  menuCategory: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  menuPriceCol: { alignItems: "flex-end", gap: 4 },
  menuPrice: { color: COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  availableBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  availableText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  menuDescription: {
    color: COLORS.textSecondary, fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm, lineHeight: 18,
    paddingHorizontal: SPACING.md, marginTop: SPACING.sm,
  },
  menuIngredients: {
    color: COLORS.textSecondary, fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  daysRow: { flexDirection: "row", gap: 4, marginBottom: SPACING.sm, paddingHorizontal: SPACING.md },
  dayPill: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center", backgroundColor: COLORS.border,
  },
  dayPillActive: { backgroundColor: COLORS.primary },
  dayPillText: { color: COLORS.textMuted, fontSize: 11, fontWeight: "700" },
  dayPillTextActive: { color: COLORS.white },
  menuActions: { flexDirection: "row", gap: SPACING.md, padding: SPACING.md, paddingTop: SPACING.sm },
  actionButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, gap: SPACING.xs,
  },
  editButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.error },
  actionText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.lg },
  emptyText: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginTop: SPACING.lg },
  emptySubtext: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  emptyButton: { marginTop: SPACING.lg },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  formContent: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  formGroup: { marginBottom: SPACING.lg },
  label: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "600", marginBottom: SPACING.xs },
  hint: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 4 },
  input: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    color: COLORS.text, fontSize: FONT_SIZE.md,
  },
  // Estado de error, consistente con dbe-input-error de client-admin (mismo color rosa)
  inputError: { borderColor: COLORS.error, borderWidth: 1.5 },
  errorText: { color: COLORS.error, fontSize: FONT_SIZE.xs, marginTop: 4 },
  textarea: { minHeight: 80, paddingTop: SPACING.md, textAlignVertical: "top" },
  chipsRow: { flexDirection: "row" },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipError: { borderColor: COLORS.error },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  chipTextSelected: { color: COLORS.white },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  daysSelector: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  dayBtn: {
    width: 36, height: 36, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  dayBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnError: { borderColor: COLORS.error },
  dayBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: "700" },
  dayBtnTextSelected: { color: COLORS.white },
  // Image picker
  imagePicker: {
    width: "100%",
    height: 160,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  imagePreview: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  imageOverlayText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },
  imagePlaceholderText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: SPACING.xs,
  },
  removeImageText: { color: COLORS.error, fontSize: FONT_SIZE.sm },
  modalActions: {
    flexDirection: "row", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    gap: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelButton: { flex: 1, backgroundColor: COLORS.background },
  cancelText: { color: COLORS.text },
  submitButton: { flex: 1 },
});

export default ResAdminMenuScreen;