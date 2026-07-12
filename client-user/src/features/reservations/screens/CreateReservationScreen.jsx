// client-user/src/features/reservations/screens/CreateReservationScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useReservations } from "../hooks/useReservations";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const CreateReservationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId: paramRestaurantId, restaurantName: paramRestaurantName } = route.params || {};
  const user = useAuthStore((state) => state.user);
  const { createReservation, fetchAvailability, loading } = useReservations();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(paramRestaurantName || "");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(paramRestaurantId || "");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // FIX: errores de validación en línea (borde rosa) en lugar de Alert.alert
  const [formErrors, setFormErrors] = useState({
    restaurant: null,
    date: null,
    table: null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      restaurantName: paramRestaurantName || "",
      reservationDate: "",
      reservationHour: "12:00",
      peopleName: user ? `${user.firstName} ${user.surname}` : "",
      peopleNumber: "2",
      observation: "",
    },
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await restaurantClient.get("/restaurants");
      const data = response.data.data || response.data;
      setRestaurants(data);
    } catch (err) {
      console.error("Error al cargar restaurantes:", err);
    }
  }, []);

  useEffect(() => {
    if (!paramRestaurantId) {
      fetchRestaurants();
    }
    setValue("peopleName", user ? `${user.firstName} ${user.surname}` : "");
  }, [fetchRestaurants, user, setValue, paramRestaurantId]);

  const formatTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed") return;
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        Alert.alert("Fecha inválida", "La fecha debe ser futura o el día de hoy");
        return;
      }

      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setValue("reservationDate", formattedDate);
      setAvailability(null);
      setTables([]);
      setSelectedTable("");
      setFormErrors((prev) => ({ ...prev, date: null }));
    }
  };

  const handleTimeChange = (event, time) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (event.type === "dismissed") return;
    if (time) {
      setSelectedTime(time);
      const timeStr = formatTimeString(time);
      setValue("reservationHour", timeStr);
      setAvailability(null);
      setTables([]);
      setSelectedTable("");
    }
  };

  // FIX: valida en línea (sin Alert) antes de consultar disponibilidad
  const handleCheckAvailability = async () => {
    const nextErrors = { restaurant: null, date: null };
    if (!selectedRestaurant) nextErrors.restaurant = "Selecciona un restaurante para continuar";
    if (!selectedDate) nextErrors.date = "Selecciona una fecha para continuar";

    if (nextErrors.restaurant || nextErrors.date) {
      setFormErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    try {
      setCheckingAvailability(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const timeStr = formatTimeString(selectedTime);

      const result = await fetchAvailability(selectedRestaurant, dateStr, timeStr);
      setAvailability(result);

      if (result?.disponible && result.mesas?.length > 0) {
        const normalizedTables = result.mesas.map((t) => ({
          _id: t.id || t._id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          location: t.location,
        }));
        setTables(normalizedTables);
      } else {
        setTables([]);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo verificar disponibilidad");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // FIX: onSubmit ahora valida restaurante/fecha/mesa en línea (borde rosa)
  // en lugar de mostrar Alert.alert nativo. Se mantiene el Alert solo para
  // el resultado final (éxito o error del backend).
  const onSubmit = async (data) => {
    const nextErrors = { restaurant: null, date: null, table: null };
    if (!selectedRestaurant) nextErrors.restaurant = "Selecciona un restaurante para continuar";
    if (!data.reservationDate) nextErrors.date = "Selecciona una fecha para continuar";
    if (!selectedTable) nextErrors.table = "Verifica disponibilidad y selecciona una mesa para continuar";

    if (nextErrors.restaurant || nextErrors.date || nextErrors.table) {
      setFormErrors(nextErrors);
      return;
    }
    setFormErrors({ restaurant: null, date: null, table: null });

    try {
      await createReservation({
        restaurantName: selectedRestaurant,
        tableId: selectedTable,
        reservationDate: data.reservationDate,
        reservationHour: data.reservationHour,
        peopleName: data.peopleName,
        peopleNumber: parseInt(data.peopleNumber),
        observation: data.observation || undefined,
      });

      Alert.alert(
        "Reservación creada",
        "Tu reservación ha sido enviada. El restaurante la confirmará próximamente.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Reservaciones", { screen: "ReservationsList" }),
          },
        ]
      );
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo crear la reservación";
      Alert.alert("Error", msg);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = formatTimeString(selectedTime);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Reservación</Text>

        {/* Selector de restaurante */}
        {!paramRestaurantId && (
          <View style={styles.section}>
            <Text style={styles.label}>Restaurante</Text>
            <View
              style={[
                styles.selectorWrapper,
                formErrors.restaurant && styles.selectorWrapperError,
              ]}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {restaurants.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant._id}
                    style={[
                      styles.chip,
                      selectedRestaurant === restaurant.name && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSelectedRestaurant(restaurant.name);
                      setSelectedRestaurantId(restaurant._id);
                      setValue("restaurantName", restaurant.name);
                      setAvailability(null);
                      setTables([]);
                      setSelectedTable("");
                      setFormErrors((prev) => ({ ...prev, restaurant: null }));
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedRestaurant === restaurant.name && styles.chipTextSelected,
                      ]}
                    >
                      {restaurant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {formErrors.restaurant && (
              <Text style={styles.fieldErrorText}>{formErrors.restaurant}</Text>
            )}
          </View>
        )}

        {paramRestaurantName && (
          <View style={styles.section}>
            <Text style={styles.label}>Restaurante</Text>
            <View style={styles.selectedRestaurant}>
              <MaterialIcons name="restaurant" size={18} color={COLORS.primary} />
              <Text style={styles.selectedRestaurantText}>{paramRestaurantName}</Text>
            </View>
          </View>
        )}

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Fecha de reservación</Text>
          <TouchableOpacity
            style={[styles.pickerButton, formErrors.date && styles.pickerButtonError]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
            <Text style={styles.pickerButtonText}>{formattedDate}</Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {formErrors.date && (
            <Text style={styles.fieldErrorText}>{formErrors.date}</Text>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
              textColor={COLORS.text}
            />
          )}
        </View>

        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Hora de reservación</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
            <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
            <Text style={styles.pickerButtonText}>{formattedTime}</Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
              is24Hour={true}
              textColor={COLORS.text}
            />
          )}
        </View>

        <Button
          title="Verificar disponibilidad"
          onPress={handleCheckAvailability}
          loading={checkingAvailability}
          variant="secondary"
          style={styles.checkButton}
        />

        {/* Resultado de disponibilidad */}
        {availability !== null && (
          <View
            style={[
              styles.availabilityCard,
              availability.disponible ? styles.available : styles.unavailable,
            ]}
          >
            <MaterialIcons
              name={availability.disponible ? "check-circle" : "cancel"}
              size={24}
              color={availability.disponible ? COLORS.success : COLORS.error}
            />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.availabilityText}>
                {availability.mensaje ||
                  (availability.disponible ? "Hay mesas disponibles" : "No hay mesas disponibles")}
              </Text>
              {availability.mesasDisponibles !== undefined && (
                <Text style={styles.availabilitySubtext}>
                  {availability.mesasDisponibles} de {availability.totalMesas} mesa(s) disponible(s)
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Selector de mesa */}
        {availability?.disponible && tables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Seleccionar mesa</Text>
            <View
              style={[
                styles.tablesGrid,
                formErrors.table && styles.tablesGridError,
              ]}
            >
              {tables.map((table) => (
                <TouchableOpacity
                  key={table._id}
                  style={[styles.tableCard, selectedTable === table._id && styles.tableCardSelected]}
                  onPress={() => {
                    setSelectedTable(table._id);
                    setFormErrors((prev) => ({ ...prev, table: null }));
                  }}
                >
                  <Text
                    style={[
                      styles.tableNumber,
                      selectedTable === table._id && styles.tableNumberSelected,
                    ]}
                  >
                    Mesa {table.tableNumber}
                  </Text>
                  <Text style={styles.tableInfo}>
                    👥 {table.capacity}{" \u00B7 "}{table.location || "Interior"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formErrors.table && (
              <Text style={styles.fieldErrorText}>{formErrors.table}</Text>
            )}
          </View>
        )}

        <Input
          label="Nombre del titular"
          control={control}
          name="peopleName"
          rules={{ required: "El nombre es requerido" }}
          error={errors.peopleName?.message}
        />

        <Input
          label="Número de personas"
          control={control}
          name="peopleNumber"
          rules={{
            required: "El número es requerido",
            min: { value: 1, message: "Mínimo 1 persona" },
            max: { value: 20, message: "Máximo 20 personas" },
          }}
          error={errors.peopleNumber?.message}
          keyboardType="number-pad"
        />

        <Input
          label="Observaciones (opcional)"
          control={control}
          name="observation"
          placeholder="Alguna solicitud especial..."
          multiline
          numberOfLines={3}
        />

        <Button
          title="Crear Reservación"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  title: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: "700", marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.lg },
  label: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm, fontWeight: "500" },
  chipsContainer: { flexDirection: "row" },
  selectorWrapper: { borderRadius: BORDER_RADIUS.md },
  selectorWrapperError: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  chipTextSelected: { color: COLORS.text },
  selectedRestaurant: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedRestaurantText: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "600" },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerButtonError: { borderColor: COLORS.error },
  pickerButtonText: { color: COLORS.text, fontSize: FONT_SIZE.md, flex: 1, marginLeft: SPACING.sm },
  checkButton: { marginBottom: SPACING.lg },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  available: { backgroundColor: "rgba(76, 175, 80, 0.1)", borderWidth: 1, borderColor: COLORS.success },
  unavailable: { backgroundColor: "rgba(244, 67, 54, 0.1)", borderWidth: 1, borderColor: COLORS.error },
  availabilityText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  availabilitySubtext: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 2 },
  tablesGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  tablesGridError: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
    alignItems: "center",
  },
  tableCardSelected: { backgroundColor: "rgba(147,98,217,0.15)", borderColor: COLORS.primary },
  tableNumber: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "700", marginBottom: 2 },
  tableNumberSelected: { color: COLORS.primary },
  tableInfo: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
  submitButton: { marginTop: SPACING.lg, marginBottom: SPACING.xl },
});

export default CreateReservationScreen;