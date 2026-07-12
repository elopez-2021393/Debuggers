import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Modal, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import { useResAdminReviews } from "../hooks/useResAdminEvents";

const ReviewCard = ({ review, onReply }) => (
  <Card style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewerInfo}>
        <Text style={styles.reviewerName}>{review.userId?.username || "Usuario"}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <MaterialIcons
              key={i}
              name={i < review.rating ? "star" : "star-outline"}
              size={16}
              color={i < review.rating ? "#FFD700" : COLORS.textMuted}
            />
          ))}
          <Text style={styles.ratingText}>({review.rating.toFixed(1)})</Text>
        </View>
      </View>
      <Text style={styles.reviewDate}>
        {new Date(review.createdAt).toLocaleDateString("es-ES", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </Text>
    </View>

    {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}

    {review.dishes?.length > 0 && (
      <View style={styles.dishesSection}>
        <Text style={styles.dishesLabel}>Platillos probados:</Text>
        <View style={styles.dishesList}>
          {review.dishes.map((dish, index) => (
            <View key={index} style={styles.dishTag}>
              <Text style={styles.dishTagText}>{dish}</Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {review.reply ? (
      <View style={styles.replyBox}>
        <View style={styles.replyHeader}>
          <MaterialIcons name="reply" size={16} color={COLORS.primary} />
          <Text style={styles.replyLabel}>Tu respuesta</Text>
        </View>
        <Text style={styles.replyText}>{review.reply}</Text>
        <TouchableOpacity style={styles.editReplyBtn} onPress={() => onReply(review)}>
          <MaterialIcons name="edit" size={14} color={COLORS.primary} />
          <Text style={styles.editReplyText}>Editar respuesta</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.replyBtn} onPress={() => onReply(review)}>
        <MaterialIcons name="reply" size={16} color={COLORS.primary} />
        <Text style={styles.replyBtnText}>Responder reseña</Text>
      </TouchableOpacity>
    )}
  </Card>
);

const ResAdminReviewsScreen = () => {
  const navigation = useNavigation();
  const { reviews, loading, fetchReviews, replyToReview } = useResAdminReviews();
  const [refreshing, setRefreshing] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    const unsub = navigation.addListener("focus", fetchReviews);
    return unsub;
  }, [navigation, fetchReviews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert("Campo vacío", "Escribe una respuesta antes de enviar.");
      return;
    }
    setSubmitting(true);
    const result = await replyToReview(selectedReview._id, replyText.trim());
    setSubmitting(false);
    if (result.success) {
      Alert.alert("¡Listo!", "Tu respuesta fue publicada.");
      setReplyModalVisible(false);
      setSelectedReview(null);
      setReplyText("");
    } else {
      Alert.alert("Error", result.error || "No se pudo publicar la respuesta.");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Calificación Promedio</Text>
        <Text style={styles.ratingNumber}>{averageRating}</Text>
        <View style={styles.starsDisplay}>
          {[...Array(5)].map((_, i) => (
            <MaterialIcons
              key={i}
              name={i < Math.round(averageRating) ? "star" : "star-outline"}
              size={20}
              color={i < Math.round(averageRating) ? "#FFD700" : COLORS.textMuted}
            />
          ))}
        </View>
        <Text style={styles.reviewsCount}>({reviews.length} reseñas)</Text>
      </View>
      {reviews.length > 0 && (
        <View style={styles.statsGrid}>
          {[5, 4, 3].map((stars) => (
            <View key={stars} style={styles.statItem}>
              <Text style={styles.statValue}>{reviews.filter((r) => r.rating === stars).length}</Text>
              <Text style={styles.statLabel}>{stars}⭐</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Reseñas del Restaurante</Text>
      </View>

      {reviews.length > 0 ? (
        <FlatList
          data={reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
          renderItem={({ item }) => <ReviewCard review={item} onReply={handleOpenReply} />}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="rate-review" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No hay reseñas aún</Text>
          <Text style={styles.emptySubtext}>Las reseñas de tus clientes aparecerán aquí</Text>
        </View>
      )}

      {/* Modal responder */}
      <Modal visible={replyModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReview?.reply ? "Editar respuesta" : "Responder reseña"}
              </Text>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewBox}>
              <View style={styles.previewRating}>
                {[...Array(5)].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name={i < (selectedReview?.rating || 0) ? "star" : "star-outline"}
                    size={14}
                    color={i < (selectedReview?.rating || 0) ? "#FFD700" : COLORS.textMuted}
                  />
                ))}
              </View>
              <Text style={styles.previewComment} numberOfLines={3}>
                {selectedReview?.comment}
              </Text>
              <Text style={styles.previewAuthor}>— {selectedReview?.userId?.username || "Usuario"}</Text>
            </View>

            <Text style={styles.inputLabel}>Tu respuesta</Text>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Escribe tu respuesta al cliente..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{replyText.length}/500</Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => setReplyModalVisible(false)}
                style={styles.cancelButton}
                textStyle={{ color: COLORS.text }}
              />
              <Button
                title={submitting ? "Publicando..." : "Publicar"}
                onPress={handleSubmitReply}
                disabled={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenHeader: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  listContent: { padding: SPACING.lg },
  headerSection: { marginBottom: SPACING.lg },
  statsCard: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: "center",
  },
  statsLabel: { color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.sm, fontWeight: "600", marginBottom: SPACING.sm },
  ratingNumber: { color: COLORS.white, fontSize: FONT_SIZE.xxl, fontWeight: "700" },
  starsDisplay: { flexDirection: "row", marginVertical: SPACING.sm, gap: SPACING.xs },
  reviewsCount: { color: "rgba(255,255,255,0.7)", fontSize: FONT_SIZE.sm },
  statsGrid: { flexDirection: "row", gap: SPACING.md },
  statItem: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { color: COLORS.primary, fontSize: FONT_SIZE.xxl, fontWeight: "700", marginBottom: SPACING.xs },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, textAlign: "center" },
  reviewCard: { marginBottom: SPACING.md, padding: SPACING.md },
  reviewHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: SPACING.md, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  reviewerInfo: { flex: 1 },
  reviewerName: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700", marginBottom: SPACING.xs },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  ratingText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginLeft: SPACING.xs },
  reviewDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  reviewComment: { color: COLORS.text, fontSize: FONT_SIZE.md, lineHeight: 20, marginBottom: SPACING.md },
  dishesSection: { marginTop: SPACING.sm },
  dishesLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: "600", marginBottom: SPACING.xs },
  dishesList: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  dishTag: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  dishTagText: { color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  replyBox: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  replyHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.xs },
  replyLabel: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "700", textTransform: "uppercase" },
  replyText: { color: COLORS.text, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  editReplyBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACING.sm },
  editReplyText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  replyBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    marginTop: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary,
    alignSelf: "flex-start",
  },
  replyBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.lg },
  emptyText: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginTop: SPACING.lg },
  emptySubtext: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, marginTop: SPACING.xs },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, paddingBottom: SPACING.xl * 2,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg,
  },
  modalTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  previewBox: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  previewRating: { flexDirection: "row", gap: 2, marginBottom: SPACING.xs },
  previewComment: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.xs },
  previewAuthor: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontStyle: "italic" },
  inputLabel: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600", marginBottom: SPACING.sm },
  replyInput: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, color: COLORS.text,
    fontSize: FONT_SIZE.md, padding: SPACING.md,
    minHeight: 100, textAlignVertical: "top",
  },
  charCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: "right", marginTop: 4 },
  modalActions: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
  cancelButton: { flex: 1, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
});

export default ResAdminReviewsScreen;