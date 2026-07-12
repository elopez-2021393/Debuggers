// client-user/src/features/events/screens/EventsListScreen.jsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useEvents } from "../hooks/useEvents";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
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

const TYPE_FILTERS = ["Todos", "event", "promotion", "coupon"];

const TypeChip = ({ type, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.typeChip, selected && styles.typeChipSelected]}
  >
    <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
      {TYPE_LABELS[type] || type}
    </Text>
  </TouchableOpacity>
);

const EventCard = ({ item, onPress }) => {
  const typeColor = TYPE_COLORS[item.type] || COLORS.primary;

  const startDate = new Date(item.schedule?.start_date);
  const endDate = new Date(item.schedule?.end_date);
  const formattedDate = `${startDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} - ${endDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}`;
  const capacityText = item.max_capacity
    ? `${item.current_capacity || 0} / ${item.max_capacity} lugares`
    : null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventName}>{item.name}</Text>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{TYPE_LABELS[item.type] || item.type}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="restaurant" size={16} color={COLORS.textSecondary} />
        <Text style={styles.cardText}>{item.restaurantName}</Text>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="calendar-today" size={16} color={COLORS.textSecondary} />
        <Text style={styles.cardText}>{formattedDate}</Text>
      </View>

      {capacityText && (
        <View style={styles.cardRow}>
          <MaterialIcons name="people" size={16} color={COLORS.textSecondary} />
          <Text style={styles.cardText}>{capacityText}</Text>
        </View>
      )}

      <Button title="Ver detalle" variant="secondary" onPress={onPress} style={styles.detailButton} />
    </TouchableOpacity>
  );
};

const EventsListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { events, loading, error, fetchAllPublicEvents } = useEvents();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedType, setSelectedType] = useState("Todos");
  const [fetchError, setFetchError] = useState(null);
  const restaurantsRef = useRef([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setFetchError(null);
        const response = await restaurantClient.get("/restaurants");
        const data = response.data.data || response.data;
        const list = Array.isArray(data) ? data : [];
        setRestaurants(list);
        restaurantsRef.current = list;
        await fetchAllPublicEvents(list);
      } catch (err) {
        setFetchError("No se pudieron cargar los restaurantes");
      }
    };
    fetchRestaurants();
  }, [fetchAllPublicEvents]);

  const onRefresh = useCallback(() => {
    fetchAllPublicEvents(restaurantsRef.current);
  }, [fetchAllPublicEvents]);

  const filteredEvents = selectedType === "Todos"
    ? events
    : events.filter((e) => e.type === selectedType);

  return (
    <View style={styles.container}>
      <View style={[styles.filtersContainer, { paddingTop: insets.top + SPACING.sm }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPE_FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TypeChip
              type={item}
              selected={selectedType === item}
              onPress={() => setSelectedType(item)}
            />
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {(fetchError || error) && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{fetchError || error}</Text>
        </View>
      )}

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            onPress={() =>
              navigation.navigate("EventDetail", {
                eventId: item._id,
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="event-busy"
              title="No hay eventos"
              subtitle="No hay eventos gastronómicos disponibles en este momento"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filtersContainer: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersList: { paddingRight: SPACING.md },
  typeChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: "500" },
  typeChipTextSelected: { color: COLORS.text },
  listContent: { padding: SPACING.xl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  eventName: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", flex: 1 },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: { color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm },
  cardText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginLeft: SPACING.sm },
  detailButton: { marginTop: SPACING.md },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error,
    gap: SPACING.sm,
  },
  errorText: { color: COLORS.error, fontSize: FONT_SIZE.xs, flex: 1 },
});

export default EventsListScreen;