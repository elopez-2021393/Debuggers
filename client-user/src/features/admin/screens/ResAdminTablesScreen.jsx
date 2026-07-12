// client-user/src/features/admin/screens/ResAdminTablesScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Modal, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import { useResAdminTables } from "../hooks/useResAdminTables";

const LOCATIONS = ["Interior", "Terraza", "Ventana", "Jardín", "Otro"];

const EMPTY_ERRORS = { tableNumber: "", capacity: "" };

// Mismo criterio de validación que ResAdminMenuScreen / client-admin TableModal
const validateForm = (formData) => {
  const errors = { ...EMPTY_ERRORS };

  const tableNumber = formData.tableNumber.trim();
  if (!tableNumber) errors.tableNumber = "El número o nombre de la mesa es obligatorio";
  else if (tableNumber.length > 20) errors.tableNumber = "Máximo 20 caracteres";

  const capacity = parseInt(formData.capacity);
  if (!formData.capacity) errors.capacity = "La capacidad es obligatoria";
  else if (Number.isNaN(capacity) || capacity < 1 || capacity > 20)
    errors.capacity = "La capacidad debe estar entre 1 y 20 personas";

  return errors;
};

const hasErrors = (errors) => Object.values(errors).some((msg) => msg);

const ResAdminTablesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    tables, loading, error,
    fetchTables, deleteTable, createTable, updateTable, toggleTableStatus,
  } = useResAdminTables();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({ tableNumber: "", capacity: "2", location: "Interior" });
  const [formErrors, setFormErrors] = useState(EMPTY_ERRORS);

  useEffect(() => {
    fetchTables();
    const unsubscribe = navigation.addListener("focus", fetchTables);
    return unsubscribe;
  }, [navigation, fetchTables]);

  // Actualiza un campo del form y limpia su error en cuanto el usuario escribe
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleOpenModal = (table = null) => {
    setFormErrors(EMPTY_ERRORS);
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNumber: table.tableNumber?.toString() || "",
        capacity: table.capacity?.toString() || "2",
        location: table.location || "Interior",
      });
    } else {
      setEditingTable(null);
      setFormData({ tableNumber: "", capacity: "2", location: "Interior" });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTable(null);
    setFormData({ tableNumber: "", capacity: "2", location: "Interior" });
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
      tableNumber: formData.tableNumber.trim(),
      capacity: parseInt(formData.capacity),
      location: formData.location || undefined,
      isActive: true,
    };

    if (editingTable) {
      const result = await updateTable(editingTable._id, payload);
      if (result.success) {
        Alert.alert("Éxito", "Mesa actualizada correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al actualizar mesa");
      }
    } else {
      const result = await createTable(payload);
      if (result.success) {
        Alert.alert("Éxito", "Mesa creada correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al crear mesa");
      }
    }
  };

  const handleDelete = (table) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Eliminar la Mesa ${table.tableNumber}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar", style: "destructive",
          onPress: async () => {
            const result = await deleteTable(table._id);
            if (!result.success) Alert.alert("Error", "Error al eliminar mesa");
          },
        },
      ]
    );
  };

  const handleToggle = (table) => {
    const action = table.isActive ? "inhabilitar" : "habilitar";
    Alert.alert(
      "Confirmar",
      `¿Deseas ${action} la Mesa ${table.tableNumber}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: table.isActive ? "Inhabilitar" : "Habilitar",
          onPress: async () => {
            const result = await toggleTableStatus(table._id);
            if (!result.success) Alert.alert("Error", result.error || "Error al cambiar estado");
          },
        },
      ]
    );
  };

  const renderTableCard = ({ item }) => (
    <Card style={styles.tableCard}>
      <View style={styles.tableContent}>
        <View style={styles.tableIcon}>
          <MaterialIcons name="table-restaurant" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.tableInfo}>
          <Text style={styles.tableName}>Mesa {item.tableNumber}</Text>
          <Text style={styles.tableCapacity}>{item.capacity} personas</Text>
          {item.location && <Text style={styles.tableLocation}>{item.location}</Text>}
        </View>
        <TouchableOpacity onPress={() => handleToggle(item)} style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: item.isActive ? COLORS.success : COLORS.textMuted }]} />
          <Text style={[styles.statusText, { color: item.isActive ? COLORS.success : COLORS.textMuted }]}>
            {item.isActive ? "Activa" : "Inactiva"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleOpenModal(item)}>
          <MaterialIcons name="edit" size={18} color={COLORS.white} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? COLORS.warning : COLORS.success }]}
          onPress={() => handleToggle(item)}
        >
          <MaterialIcons name={item.isActive ? "block" : "check-circle"} size={18} color={COLORS.white} />
          <Text style={styles.actionText}>{item.isActive ? "Inhabilitar" : "Habilitar"}</Text>
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
      {/* FIX: paddingTop con insets */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.screenTitle}>Gestión de Mesas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <MaterialIcons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Total", value: tables.length, color: COLORS.primary },
          { label: "Activas", value: tables.filter((t) => t.isActive).length, color: COLORS.success },
          { label: "Inactivas", value: tables.filter((t) => !t.isActive).length, color: COLORS.error },
        ].map((s) => (
          <View key={s.label} style={styles.statChip}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {tables.length > 0 ? (
        <FlatList
          data={tables.sort((a, b) => {
            const na = parseInt(a.tableNumber) || 0;
            const nb = parseInt(b.tableNumber) || 0;
            return na !== nb ? na - nb : a.tableNumber?.localeCompare(b.tableNumber);
          })}
          renderItem={renderTableCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="table-restaurant" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No hay mesas registradas</Text>
          <Text style={styles.emptySubtext}>Crea tu primera mesa para comenzar</Text>
          <Button title="Agregar Mesa" onPress={() => handleOpenModal()} style={styles.emptyButton} />
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingTable ? "Editar Mesa" : "Agregar Mesa"}</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Número / Nombre *</Text>
                <TextInput
                  style={[styles.input, formErrors.tableNumber && styles.inputError]}
                  placeholder="Ej. Mesa 5, VIP-1, Terraza-A"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.tableNumber}
                  onChangeText={(text) => updateField("tableNumber", text)}
                  maxLength={20}
                />
                {formErrors.tableNumber ? (
                  <Text style={styles.errorText}>{formErrors.tableNumber}</Text>
                ) : (
                  <Text style={styles.hint}>Máx. 20 caracteres {"\u00B7"} {formData.tableNumber.length}/20</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Capacidad *</Text>
                <TextInput
                  style={[styles.input, formErrors.capacity && styles.inputError]}
                  placeholder="Número de personas (1-20)"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.capacity}
                  onChangeText={(text) => updateField("capacity", text)}
                  keyboardType="numeric"
                />
                {formErrors.capacity ? (
                  <Text style={styles.errorText}>{formErrors.capacity}</Text>
                ) : (
                  <Text style={styles.hint}>Entre 1 y 20 personas</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ubicación</Text>
                <View style={styles.chipsWrap}>
                  {LOCATIONS.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      style={[styles.chip, formData.location === loc && styles.chipSelected]}
                      onPress={() => setFormData({ ...formData, location: loc })}
                    >
                      <Text style={[styles.chipText, formData.location === loc && styles.chipTextSelected]}>
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" onPress={handleCloseModal} style={styles.cancelButton} textStyle={styles.cancelText} />
              <Button title={editingTable ? "Actualizar" : "Crear"} onPress={handleSubmit} loading={loading} style={styles.submitButton} />
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
    paddingBottom: SPACING.md,           // paddingTop viene del inset inline
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  addButton: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  statsRow: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  statChip: {
    flex: 1, alignItems: "center", paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: "700" },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  listContent: { padding: SPACING.lg },
  tableCard: { marginBottom: SPACING.md, padding: SPACING.md },
  tableContent: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  tableIcon: {
    width: 56, height: 56, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt, justifyContent: "center", alignItems: "center", marginRight: SPACING.md,
  },
  tableInfo: { flex: 1 },
  tableName: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700", marginBottom: SPACING.xs },
  tableCapacity: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  tableLocation: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  statusBadge: { alignItems: "center", gap: SPACING.xs },
  statusDot: { width: 8, height: 8, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: "600" },
  tableActions: { flexDirection: "row", gap: SPACING.sm },
  actionButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, gap: SPACING.xs,
  },
  editButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.error },
  actionText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.lg },
  emptyText: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginTop: SPACING.lg },
  emptySubtext: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  emptyButton: { marginTop: SPACING.lg },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
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
  // Estado de error, consistente con dbe-input-error de client-admin
  inputError: { borderColor: COLORS.error, borderWidth: 1.5 },
  errorText: { color: COLORS.error, fontSize: FONT_SIZE.xs, marginTop: 4 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  chipTextSelected: { color: COLORS.white },
  modalActions: {
    flexDirection: "row", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    gap: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelButton: { flex: 1, backgroundColor: COLORS.background },
  cancelText: { color: COLORS.text },
  submitButton: { flex: 1 },
});

export default ResAdminTablesScreen;