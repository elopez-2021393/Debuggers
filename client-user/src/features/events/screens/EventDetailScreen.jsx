// client-user/src/features/events/screens/EventDetailScreen.jsx

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../../shared/store/authStore";
import { useEvents } from "../hooks/useEvents";
import restaurantClient from "../../../shared/api/restaurantClient";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";

const TYPE_COLORS = {
  event: "#f2509c",
  promotion: "#9362d9",
  coupon: "#c35bb9",
};

const TYPE_LABELS = {
  event: "Evento",
  promotion: "Promoción",
  coupon: "Cupón",
};

const EventDetailScreen = () => {
  const route = useRoute();
  const { eventId, restaurantId, restaurantName: paramRestaurantName } = route.params;
  const user = useAuthStore((state) => state.user);
  const { events, joinEvent, leaveEvent, applyEvent, loading } = useEvents();
  const [event, setEvent] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const userId = user?._id || user?.id;

  const resolveInscriptionState = useCallback(
    (eventData) => {
      const joined =
        eventData.inscripciones?.some(
          (i) => (i.userId?._id || i.userId)?.toString() === userId?.toString()
        ) || false;
      setIsJoined(joined);

      const applied =
        eventData.usos?.some(
          (u) => (u.userId?._id || u.userId)?.toString() === userId?.toString()
        ) || false;
      setHasApplied(applied);
    },
    [userId]
  );

  const fetchEvent = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await restaurantClient.get(`/events/${eventId}`);
      const data = response.data.data || response.data;
      // Inyectar restaurantName desde params si no viene en la respuesta
      if (!data.restaurantName && paramRestaurantName) {
        data.restaurantName = paramRestaurantName;
      }
      setEvent(data);
      resolveInscriptionState(data);
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el evento");
    } finally {
      setFetchLoading(false);
    }
  }, [eventId, paramRestaurantName, resolveInscriptionState]);

  useEffect(() => {
    const localEvent = events.find((e) => e._id === eventId);
    if (localEvent) {
      setEvent(localEvent);
      resolveInscriptionState(localEvent);
    } else {
      fetchEvent();
    }
  }, [eventId, events, fetchEvent, resolveInscriptionState]);

  const handleJoin = () => {
    if (event.max_capacity && event.current_capacity >= event.max_capacity) {
      Alert.alert("Sin cupos", "Este evento ya no tiene cupos disponibles.");
      return;
    }
    Alert.alert(
      "Inscribirse al evento",
      `¿Deseas inscribirte a "${event.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Inscribirse",
          onPress: async () => {
            try {
              const result = await joinEvent(eventId);
              setIsJoined(true);
              const cupos =
                result?.cuposRestantes !== undefined
                  ? `\nCupos restantes: ${result.cuposRestantes}`
                  : "";
              Alert.alert("¡Inscripción exitosa!", `Te has inscrito al evento.${cupos}`);
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo inscribir al evento");
            }
          },
        },
      ]
    );
  };

  const handleLeave = () => {
    Alert.alert(
      "Cancelar inscripción",
      "¿Estás seguro de que deseas cancelar tu inscripción?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveEvent(eventId);
              setIsJoined(false);
              Alert.alert("Listo", "Tu inscripción ha sido cancelada.");
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo cancelar la inscripción");
            }
          },
        },
      ]
    );
  };

  const handleApply = () => {
    const label = TYPE_LABELS[event.type];
    Alert.alert(
      `Aplicar ${label}`,
      `¿Deseas aplicar este ${label}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aplicar",
          onPress: async () => {
            try {
              const result = await applyEvent(eventId);
              setHasApplied(true);
              Alert.alert(
                "¡Listo!",
                result?.mensaje || `${label} aplicado correctamente.`
              );
            } catch (err) {
              Alert.alert("Error", err.message || `No se pudo aplicar el ${label}`);
            }
          },
        },
      ]
    );
  };

  if (fetchLoading || (!event && loading)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[event.type] || COLORS.primary;
  const isFull =
    event.max_capacity && event.current_capacity >= event.max_capacity && !isJoined;
  const capacityPercent = event.max_capacity
    ? (event.current_capacity / event.max_capacity) * 100
    : 0;

  const startDate = new Date(event.schedule?.start_date);
  const endDate = new Date(event.schedule?.end_date);
  const formattedDateRange = `${startDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} - ${endDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={COLORS.primaryGradient} style={styles.hero}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{TYPE_LABELS[event.type] || event.type}</Text>
        </View>
        <Text style={styles.eventName}>{event.name}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.section}>
          <InfoRow
            icon="restaurant"
            label="Restaurante"
            value={event.restaurantName || paramRestaurantName || "N/A"}
          />
          <InfoRow icon="info" label="Estado" value={event.status} />
          <InfoRow icon="visibility" label="Visibilidad" value={event.visibility} />
        </Card>

        {event.description && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{event.description}</Text>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios</Text>
          <InfoRow icon="calendar-today" label="Fechas" value={formattedDateRange} />
          {event.schedule?.recurrence && event.schedule.recurrence !== "none" && (
            <InfoRow icon="repeat" label="Recurrencia" value={event.schedule.recurrence} />
          )}
          {event.schedule?.time_slots?.length > 0 && (
            <View style={styles.timeSlotsContainer}>
              <Text style={styles.timeSlotsLabel}>Franjas horarias:</Text>
              {event.schedule.time_slots.map((slot, index) => (
                <Text key={index} style={styles.timeSlotText}>
                  {slot.from} - {slot.to}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {event.tags?.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Etiquetas</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {event.max_capacity && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Capacidad</Text>
            <View style={styles.capacityContainer}>
              <View style={styles.capacityBar}>
                <View
                  style={[
                    styles.capacityFill,
                    { width: `${Math.min(capacityPercent, 100)}%` },
                    isFull && styles.capacityFillFull,
                  ]}
                />
              </View>
              <Text style={styles.capacityText}>
                {event.current_capacity || 0} / {event.max_capacity} lugares
              </Text>
            </View>
          </Card>
        )}

        {event.type === "coupon" && event.max_usos && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Usos del cupón</Text>
            <Text style={styles.usesText}>
              {event.usos_actuales || 0} / {event.max_usos} usos disponibles
            </Text>
          </Card>
        )}

        {/* Botón de acción para eventos */}
        {event.type === "event" && (
          <>
            <Button
              title={
                isJoined
                  ? "Cancelar inscripción"
                  : isFull
                    ? "Sin cupos disponibles"
                    : "Inscribirse al evento"
              }
              onPress={isJoined ? handleLeave : handleJoin}
              loading={loading}
              disabled={loading || (!isJoined && isFull)}
              style={[
                styles.actionButton,
                isJoined && styles.actionButtonDanger,
              ]}
            />
            {isJoined && (
              <Text style={styles.joinedText}>✓ Ya estás inscrito en este evento</Text>
            )}
            {isFull && !isJoined && (
              <Text style={styles.fullText}>Este evento ya no tiene cupos disponibles</Text>
            )}
          </>
        )}

        {/* Botón de acción para promociones y cupones */}
        {(event.type === "promotion" || event.type === "coupon") && (
          <>
            <Button
              title={
                hasApplied
                  ? `✓ ${event.type === "promotion" ? "Promoción aplicada" : "Cupón canjeado"}`
                  : event.type === "promotion"
                    ? "Activar promoción"
                    : "Canjear cupón"
              }
              onPress={handleApply}
              loading={loading}
              disabled={loading || hasApplied}
              style={styles.actionButton}
            />
            {hasApplied && (
              <Text style={styles.joinedText}>
                {event.type === "promotion"
                  ? "Ya aplicaste esta promoción"
                  : "Ya canjeaste este cupón"}
              </Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: COLORS.text, fontSize: FONT_SIZE.md },
  hero: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  typeText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  eventName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: "700",
    textAlign: "center",
  },
  content: { padding: SPACING.xl },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: SPACING.md },
  infoContent: { marginLeft: SPACING.md, flex: 1 },
  infoLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs },
  infoValue: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  timeSlotsContainer: { marginTop: SPACING.sm },
  timeSlotsLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs },
  timeSlotText: { color: COLORS.text, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: { color: COLORS.text, fontSize: FONT_SIZE.xs },
  capacityContainer: { marginTop: SPACING.sm },
  capacityBar: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  capacityFill: { height: "100%", backgroundColor: COLORS.primary },
  capacityFillFull: { backgroundColor: COLORS.error },
  capacityText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  usesText: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "600" },
  actionButton: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  actionButtonDanger: { backgroundColor: COLORS.error },
  joinedText: {
    color: COLORS.success || "#4ade80",
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  fullText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
});

export default EventDetailScreen;