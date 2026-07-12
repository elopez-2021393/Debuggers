// client-user/src/features/reviews/screens/MyReviewsScreen.jsx

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useReviews } from "../hooks/useReviews";
import restaurantClient from "../../../shared/api/restaurantClient";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import CreateReviewModal from "./CreateReviewModal";

const RATING_COLORS = {
  5: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  4: { bg: "rgba(132,204,22,0.15)", color: "#a3e635" },
  3: { bg: "rgba(234,179,8,0.15)", color: "#fbbf24" },
  2: { bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
  1: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
};

const REPLY_FILTERS = [
  { key: "ALL", label: "Todas" },
  { key: "REPLIED", label: "Respondidas" },
  { key: "PENDING", label: "Sin respuesta" },
];

const ReviewCard = ({ item, restaurantName, onDelete }) => {
  const ratingStyle = RATING_COLORS[item.rating] || RATING_COLORS[3];
  const hasReply = !!item.reply;

  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDelete = () => {
    Alert.alert(
      "Eliminar reseña",
      "¿Estás seguro de que deseas eliminar esta reseña?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí, eliminar", style: "destructive", onPress: () => onDelete(item._id) },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurantName || "Restaurante"}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View
          style={[
            styles.ratingBadge,
            { backgroundColor: ratingStyle.bg, borderColor: ratingStyle.color },
          ]}
        >
          <Text style={[styles.ratingText, { color: ratingStyle.color }]}>
            ★ {item.rating}/5
          </Text>
        </View>
      </View>

      <Text style={styles.comment}>"{item.comment}"</Text>

      {hasReply ? (
        <View style={styles.replyBox}>
          <View style={styles.replyLabelRow}>
            <View style={styles.replyIcon}>
              <Text style={styles.replyIconText}>R</Text>
            </View>
            <Text style={styles.replyLabel}>Respuesta del restaurante</Text>
          </View>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      ) : (
        <View style={styles.noReplyBox}>
          <Text style={styles.noReplyText}>Aún sin respuesta del restaurante</Text>
        </View>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <MaterialIcons name="delete-outline" size={16} color={COLORS.error} />
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </Card>
  );
};

const MyReviewsScreen = () => {
  const navigation = useNavigation();
  const { reviews, loading, fetchMyReviews, deleteReview } = useReviews();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterReply, setFilterReply] = useState("ALL");
  const [filterRestaurant, setFilterRestaurant] = useState("ALL");
  const [restaurantMap, setRestaurantMap] = useState({});

  useEffect(() => {
    fetchMyReviews();
    // Cargar todos los restaurantes para construir el mapa id→nombre
    restaurantClient
      .get("/restaurants")
      .then((r) => {
        const data = r.data.data || r.data;
        const map = {};
        data.forEach((rest) => { map[rest._id] = rest.name; });
        setRestaurantMap(map);
      })
      .catch(() => { });
  }, [fetchMyReviews]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.headerButton}
        >
          <MaterialIcons name="add-circle-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      Alert.alert("Éxito", "Reseña eliminada correctamente");
      fetchMyReviews();
    } catch {
      Alert.alert("Error", "No se pudo eliminar la reseña");
    }
  };

  // Restaurantes únicos que aparecen en mis reseñas
  const restaurantsInReviews = [
    ...new Map(
      reviews
        .filter((r) => restaurantMap[r.restaurantId])
        .map((r) => [r.restaurantId, restaurantMap[r.restaurantId]])
    ).entries(),
  ];

  const filtered = reviews.filter((r) => {
    const matchReply =
      filterReply === "ALL" ||
      (filterReply === "REPLIED" ? !!r.reply : !r.reply);
    const matchRestaurant =
      filterRestaurant === "ALL" || r.restaurantId === filterRestaurant;
    return matchReply && matchRestaurant;
  });

  const repliedCount = reviews.filter((r) => !!r.reply).length;
  const pendingCount = reviews.filter((r) => !r.reply).length;

  const ListHeader = () => (
    <View>
      {/* Estadísticas */}
      <View style={styles.statsRow}>
        {[
          { label: "Total", value: reviews.length, color: COLORS.textSecondary },
          { label: "Respondidas", value: repliedCount, color: "#4ade80" },
          { label: "Sin respuesta", value: pendingCount, color: "#fbbf24" },
        ].map(({ label, value, color }) => (
          <View key={label} style={styles.statCard}>
            <Text style={[styles.statNumber, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Filtros de respuesta */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {REPLY_FILTERS.map(({ key, label }) => {
          const active = filterReply === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilterReply(key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Selector de restaurante */}
        {restaurantsInReviews.length > 1 && (
          <>
            {restaurantsInReviews.map(([id, name]) => {
              const active = filterRestaurant === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setFilterRestaurant(active ? "ALL" : id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      <Text style={styles.resultsText}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            restaurantName={restaurantMap[item.restaurantId]}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchMyReviews}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          reviews.length === 0 ? (
            <EmptyState
              icon="rate-review"
              title="No hay reseñas"
              subtitle="Aún no has publicado ninguna reseña"
            />
          ) : (
            <View style={styles.emptyFiltered}>
              <Text style={styles.emptyFilteredText}>
                Sin resultados para este filtro
              </Text>
            </View>
          )
        }
      />

      <CreateReviewModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchMyReviews();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    marginRight: SPACING.md,
  },
  listContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  // Estadísticas
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
    textAlign: "center",
  },
  // Filtros
  filtersRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  resultsText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
  },
  // Tarjetas
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  restaurantName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  ratingBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  ratingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  comment: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: SPACING.sm,
  },
  // Reply
  replyBox: {
    backgroundColor: "rgba(242,80,156,0.07)",
    borderWidth: 1,
    borderColor: "rgba(242,80,156,0.2)",
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  replyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  replyIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  replyIconText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  replyLabel: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  replyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontStyle: "italic",
    lineHeight: 16,
  },
  noReplyBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  noReplyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  emptyFiltered: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyFilteredText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
});

export default MyReviewsScreen;