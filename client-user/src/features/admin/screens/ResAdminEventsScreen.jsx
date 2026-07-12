import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import { useResAdminEvents } from "../hooks/useResAdminEvents";

const DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
];

const TYPES = [
  { value: "event", label: "Evento" },
  { value: "promotion", label: "Promoción" },
];

const STATUSES = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

const RECURRENCES = [
  { value: "none", label: "Sin recurrencia" },
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
];

const VISIBILITIES = [
  { value: "public", label: "Público" },
  { value: "private", label: "Privado" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "event",
  status: "draft",
  schedule: {
    start_date: "",
    end_date: "",
    recurrence: "none",
    days_of_week: [],
    time_slots: [{ from: "", to: "" }],
  },
  visibility: "public",
  max_capacity: "",
  max_usos: "",
  tags: "",
};

const ResAdminEventsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    events,
    loading,
    fetchEvents,
    deleteEvent,
    createEvent,
    updateEvent,
  } = useResAdminEvents();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  
  // Picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    fetchEvents();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation, fetchEvents]);

  const setF = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));
  const setSched = (key, val) =>
    setFormData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [key]: val },
    }));

  const toggleDay = (d) => {
    const days = formData.schedule.days_of_week;
    setSched(
      "days_of_week",
      days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort()
    );
  };

  const updateTimeSlot = (index, field, val) => {
    const slots = formData.schedule.time_slots.map((s, i) =>
      i === index ? { ...s, [field]: val } : s
    );
    setSched("time_slots", slots);
  };

  const addTimeSlot = () =>
    setSched("time_slots", [...formData.schedule.time_slots, { from: "", to: "" }]);

  const removeTimeSlot = (index) =>
    setSched(
      "time_slots",
      formData.schedule.time_slots.filter((_, i) => i !== index)
    );

  // Date and time picker handlers
  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowStartDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setSched("start_date", formattedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowEndDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setSched("end_date", formattedDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowStartTimePicker(false);
    if (event.type === "dismissed") return;
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      updateTimeSlot(0, "from", timeString);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowEndTimePicker(false);
    if (event.type === "dismissed") return;
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      updateTimeSlot(0, "to", timeString);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Seleccionar fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "Seleccionar hora";
    return timeString;
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name || "",
        description: event.description || "",
        type: event.type || "event",
        status: event.status || "draft",
        schedule: {
          start_date: event.schedule?.start_date
            ? event.schedule.start_date.slice(0, 10)
            : "",
          end_date: event.schedule?.end_date
            ? event.schedule.end_date.slice(0, 10)
            : "",
          recurrence: event.schedule?.recurrence || "none",
          days_of_week: event.schedule?.days_of_week || [],
          time_slots:
            event.schedule?.time_slots?.length
              ? event.schedule.time_slots
              : [{ from: "", to: "" }],
        },
        visibility: event.visibility || "public",
        max_capacity: event.max_capacity?.toString() || "",
        max_usos: event.max_usos?.toString() || "",
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
      });
    } else {
      setEditingEvent(null);
      setFormData(EMPTY_FORM);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!formData.schedule.start_date || !formData.schedule.end_date) {
      Alert.alert("Error", "Las fechas de inicio y fin son obligatorias");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      status: formData.status,
      schedule: {
        start_date: formData.schedule.start_date,
        end_date: formData.schedule.end_date,
        recurrence: formData.schedule.recurrence,
        days_of_week: formData.schedule.days_of_week,
        time_slots: formData.schedule.time_slots.filter(
          (s) => s.from && s.to
        ),
      },
      visibility: formData.visibility,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (formData.max_capacity)
      payload.max_capacity = Number(formData.max_capacity);
    if (formData.max_usos) payload.max_usos = Number(formData.max_usos);

    if (editingEvent) {
      const result = await updateEvent(editingEvent._id, payload);
      if (result.success) {
        Alert.alert("Éxito", "Evento actualizado correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al actualizar evento");
      }
    } else {
      const result = await createEvent(payload);
      if (result.success) {
        Alert.alert("Éxito", "Evento creado correctamente");
        handleCloseModal();
      } else {
        Alert.alert("Error", result.error || "Error al crear evento");
      }
    }
  };

  const handleDelete = (event) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar el evento "${event.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const result = await deleteEvent(event._id);
            if (!result.success) {
              Alert.alert("Error", "Error al eliminar evento");
            }
          },
        },
      ]
    );
  };

  const renderEventCard = ({ item }) => {
    const startDate = item.schedule?.start_date
      ? new Date(item.schedule.start_date).toLocaleDateString("es-ES")
      : item.date
        ? new Date(item.date).toLocaleDateString("es-ES")
        : "—";

    return (
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{item.name}</Text>
            <View style={styles.eventMeta}>
              <MaterialIcons name="event" size={14} color={COLORS.textSecondary} />
              <Text style={styles.eventDate}>{startDate}</Text>
              {item.status && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "active"
                          ? COLORS.success
                          : item.status === "draft"
                            ? COLORS.textMuted
                            : COLORS.error,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {STATUSES.find((s) => s.value === item.status)?.label ||
                      item.status}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {item.type && (
            <Text style={styles.typeBadge}>
              {TYPES.find((t) => t.value === item.type)?.label || item.type}
            </Text>
          )}
        </View>

        {item.description ? (
          <Text style={styles.eventDescription}>{item.description}</Text>
        ) : null}

        <View style={styles.eventMeta}>
          {item.max_capacity ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.max_capacity} personas</Text>
            </View>
          ) : null}
          {item.visibility && (
            <View style={styles.metaItem}>
              <MaterialIcons
                name={item.visibility === "public" ? "public" : "lock"}
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.metaText}>
                {VISIBILITIES.find((v) => v.value === item.visibility)?.label}
              </Text>
            </View>
          )}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <Text style={styles.tagsText}>🏷 {item.tags.join(", ")}</Text>
          )}
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleOpenModal(item)}
          >
            <MaterialIcons name="edit" size={18} color={COLORS.white} />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={18} color={COLORS.white} />
            <Text style={styles.actionText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const ChipSelector = ({ options, value, onChange }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, value === opt.value && styles.chipSelected]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            style={[
              styles.chipText,
              value === opt.value && styles.chipTextSelected,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.screenTitle}>Eventos del Restaurante</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <MaterialIcons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="event" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No hay eventos registrados</Text>
          <Text style={styles.emptySubtext}>
            Crea tu primer evento para comenzar
          </Text>
          <Button
            title="Crear Evento"
            onPress={() => handleOpenModal()}
            style={styles.emptyButton}
          />
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEvent ? "Editar Evento" : "Nuevo Evento"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del evento"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.name}
                  onChangeText={(text) => setF("name", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Descripción del evento"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.description}
                  onChangeText={(text) => setF("description", text)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo</Text>
                <ChipSelector
                  options={TYPES}
                  value={formData.type}
                  onChange={(v) => setF("type", v)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <ChipSelector
                  options={STATUSES}
                  value={formData.status}
                  onChange={(v) => setF("status", v)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha de inicio *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>
                    {formatDateForDisplay(formData.schedule.start_date)}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={formData.schedule.start_date ? new Date(formData.schedule.start_date) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleStartDateChange}
                    textColor={COLORS.text}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha de fin *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>
                    {formatDateForDisplay(formData.schedule.end_date)}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.schedule.end_date ? new Date(formData.schedule.end_date) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleEndDateChange}
                    textColor={COLORS.text}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Recurrencia</Text>
                <ChipSelector
                  options={RECURRENCES}
                  value={formData.schedule.recurrence}
                  onChange={(v) => setSched("recurrence", v)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Días de la semana</Text>
                <View style={styles.daysSelector}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayBtn,
                        formData.schedule.days_of_week.includes(day.value) &&
                        styles.dayBtnSelected,
                      ]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text
                        style={[
                          styles.dayBtnText,
                          formData.schedule.days_of_week.includes(day.value) &&
                          styles.dayBtnTextSelected,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.slotHeader}>
                  <Text style={styles.label}>Horarios</Text>
                  <TouchableOpacity onPress={addTimeSlot}>
                    <MaterialIcons name="add-circle" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {formData.schedule.time_slots.map((slot, index) => (
                  <View key={index} style={styles.slotRow}>
                    <TouchableOpacity
                      style={[styles.input, styles.slotInput, styles.pickerButton]}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                      <Text style={styles.pickerButtonText}>
                        {formatTimeForDisplay(slot.from) || "Desde"}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.slotSeparator}>–</Text>
                    <TouchableOpacity
                      style={[styles.input, styles.slotInput, styles.pickerButton]}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                      <Text style={styles.pickerButtonText}>
                        {formatTimeForDisplay(slot.to) || "Hasta"}
                      </Text>
                    </TouchableOpacity>
                    {formData.schedule.time_slots.length > 1 && (
                      <TouchableOpacity onPress={() => removeTimeSlot(index)}>
                        <MaterialIcons
                          name="remove-circle"
                          size={22}
                          color={COLORS.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {showStartTimePicker && (
                  <DateTimePicker
                    value={formData.schedule.time_slots[0]?.from ? 
                      new Date(`2000-01-01T${formData.schedule.time_slots[0].from}`) : new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleStartTimeChange}
                    textColor={COLORS.text}
                  />
                )}
                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.schedule.time_slots[0]?.to ? 
                      new Date(`2000-01-01T${formData.schedule.time_slots[0].to}`) : new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleEndTimeChange}
                    textColor={COLORS.text}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Visibilidad</Text>
                <ChipSelector
                  options={VISIBILITIES}
                  value={formData.visibility}
                  onChange={(v) => setF("visibility", v)}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.flex1, { marginRight: SPACING.sm }]}>
                  <Text style={styles.label}>Capacidad máx.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 50"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.max_capacity}
                    onChangeText={(text) => setF("max_capacity", text)}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Usos máx.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 100"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.max_usos}
                    onChangeText={(text) => setF("max_usos", text)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Etiquetas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="cena, wine, especial..."
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.tags}
                  onChangeText={(text) => setF("tags", text)}
                />
                <Text style={styles.hint}>Separadas por coma</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={handleCloseModal}
                style={styles.cancelButton}
                textStyle={styles.cancelText}
              />
              <Button
                title={editingEvent ? "Actualizar" : "Crear"}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: SPACING.lg,
  },
  eventCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.xs,
  },
  eventDate: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  typeBadge: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  eventDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  tagsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  eventActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "94%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  formContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  pickerButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  pickerButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  textarea: {
    minHeight: 80,
    paddingTop: SPACING.md,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  daysSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  dayBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  dayBtnTextSelected: {
    color: COLORS.white,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  slotInput: {
    flex: 1,
  },
  slotSeparator: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  row: {
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cancelText: {
    color: COLORS.text,
  },
  submitButton: {
    flex: 1,
  },
});

export default ResAdminEventsScreen;