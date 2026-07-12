// client-user/src/features/restaurants/screens/RestaurantDetailScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import CreateReviewModal from "../../reviews/screens/CreateReviewModal";

const CATEGORY_LABELS = {
  COMIDA_RAPIDA: "Comida Rápida",
  ITALIANA: "Italiana",
  CHINA: "China",
  MEXICANA: "Mexicana",
  CAFETERIA: "Cafetería",
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

// Fix #3: el modelo guarda el nombre en `userName`, no en `user.username`
const ReviewCard = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewUser}>{review.userName || "Usuario"}</Text>
      <View style={styles.stars}>
        {[...Array(5)].map((_, i) => (
          <MaterialIcons
            key={i}
            name="star"
            size={16}
            color={i < review.rating ? COLORS.warning : COLORS.textMuted}
          />
        ))}
      </View>
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
    {review.reply && (
      <View style={styles.replyContainer}>
        <Text style={styles.replyLabel}>Respuesta del restaurante:</Text>
        <Text style={styles.replyText}>{review.reply}</Text>
      </View>
    )}
  </View>
);

const RestaurantDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/restaurants/${restaurantId}`);
      const data = response.data.data || response.data;
      setRestaurant(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar restaurante");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await restaurantClient.get(`/reviews/restaurant/${restaurantId}`);
      const data = response.data.data || response.data;
      setReviews(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
  }, [fetchRestaurant, fetchReviews]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="error" title="Error" subtitle={error || "No se encontró el restaurante"} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {restaurant.photo ? (
        <Image source={{ uri: restaurant.photo }} style={styles.heroImage} />
      ) : (
        <LinearGradient colors={COLORS.primaryGradient} style={styles.heroGradient}>
          <MaterialIcons name="restaurant" size={80} color={COLORS.text} />
        </LinearGradient>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{CATEGORY_LABELS[restaurant.category] || restaurant.category}</Text>
        </View>

        <Card style={styles.infoCard}>
          <InfoRow icon="location-on" label="Dirección" value={restaurant.address} />
          <InfoRow icon="phone" label="Teléfono" value={restaurant.phone || "No disponible"} />
          <InfoRow
            icon="schedule"
            label="Horario"
            value={`${restaurant.businessHours?.open || "N/A"} - ${restaurant.businessHours?.close || "N/A"}`}
          />
          <InfoRow icon="people" label="Capacidad" value={`${restaurant.capacity || "N/A"} personas`} />
          <InfoRow icon="contact-mail" label="Contacto" value={restaurant.contactInfo?.email || "No disponible"} />
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Ver Menú"
            onPress={() => navigation.navigate("RestaurantMenu", { restaurantId })}
            style={styles.actionButton}
          />
          <Button
            title="Reservar Mesa"
            variant="secondary"
            onPress={() => navigation.navigate("CreateReservation", { restaurantId, restaurantName: restaurant.name })}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reseñas</Text>
          <TouchableOpacity
            style={styles.addReviewBtn}
            onPress={() => setShowReviewModal(true)}
          >
            <MaterialIcons name="rate-review" size={16} color={COLORS.primary} />
            <Text style={styles.addReviewBtnText}>Dejar reseña</Text>
          </TouchableOpacity>
        </View>

        {/* Fix #1: bloque de reseñas renderizado UNA SOLA VEZ */}
        {reviewsLoading ? (
          <Text style={styles.loadingText}>Cargando reseñas...</Text>
        ) : reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review._id} review={review} />)
        ) : (
          <EmptyState icon="rate-review" title="No hay reseñas" subtitle="Sé el primero en opinar" />
        )}

        <CreateReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => { setShowReviewModal(false); fetchReviews(); }}
          preselectedRestaurantId={restaurantId}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  heroImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  heroGradient: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: SPACING.xl,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
    marginBottom: SPACING.lg,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  reviewUser: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
  },
  reviewComment: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  replyContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  replyLabel: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  replyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontStyle: "italic",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  addReviewBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.primary,
  },
  addReviewBtnText: {
    color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "600",
  },
});

export default RestaurantDetailScreen;