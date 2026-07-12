// client-user/src/features/reviews/screens/CreateReviewModal.jsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useReviews } from "../hooks/useReviews";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const StarRating = ({ rating, onSelect }) => (
  <View style={styles.starsContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onSelect(star)}
        style={styles.starButton}
      >
        <MaterialIcons
          name={star <= rating ? "star" : "star-border"}
          size={32}
          color={star <= rating ? COLORS.primary : COLORS.textMuted}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const RestaurantItem = ({ item, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.restaurantItem, selected && styles.restaurantItemSelected]}
    onPress={() => onSelect(item)}
  >
    <Text style={[styles.restaurantItemText, selected && styles.restaurantItemTextSelected]}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

const CreateReviewModal = ({ visible, onClose, onSuccess, preselectedRestaurantId }) => {
  const { createReview, loading } = useReviews();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  useEffect(() => {
    if (visible) {
      fetchRestaurants();
    }
  }, [visible]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantClient.get("/restaurants");
      const data = response.data.data || response.data;
      setRestaurants(data);
      if (preselectedRestaurantId) {
        const found = data.find((r) => r._id === preselectedRestaurantId);
        if (found) setSelectedRestaurant(found);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar los restaurantes");
    }
  };

  const onSubmit = async (data) => {
    if (!selectedRestaurant) {
      Alert.alert("Restaurante requerido", "Selecciona un restaurante para reseñar");
      return;
    }

    if (rating === 0) {
      Alert.alert("Calificación requerida", "Selecciona una calificación de 1 a 5 estrellas");
      return;
    }

    // El comment ya está validado por react-hook-form (minLength: 10)
    try {
      await createReview(selectedRestaurant._id, {
        rating,
        comment: data.comment.trim(),
      });
      Alert.alert("Éxito", "Reseña publicada correctamente");
      reset();
      setRating(0);
      // Solo limpiar restaurante si NO venía preseleccionado
      if (!preselectedRestaurantId) {
        setSelectedRestaurant(null);
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "No se pudo publicar la reseña";
      Alert.alert("Error", msg);
    }
  };

  const handleClose = () => {
    reset();
    setRating(0);
    if (!preselectedRestaurantId) {
      setSelectedRestaurant(null);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nueva Reseña</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.label}>Selecciona restaurante</Text>
            <TouchableOpacity
              style={[
                styles.restaurantSelector,
                preselectedRestaurantId && styles.restaurantSelectorDisabled,
              ]}
              onPress={() => !preselectedRestaurantId && setShowRestaurantPicker(true)}
            >
              <Text style={styles.restaurantSelectorText}>
                {selectedRestaurant ? selectedRestaurant.name : "Seleccionar restaurante..."}
              </Text>
              {!preselectedRestaurantId && (
                <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Calificación</Text>
            <StarRating rating={rating} onSelect={setRating} />

            <Input
              label="Comentario"
              control={control}
              name="comment"
              rules={{
                required: "El comentario es requerido",
                minLength: {
                  value: 10,
                  message: "El comentario es muy corto. El comentario debe tener al menos 10 caracteres",
                },
                validate: (value) =>
                  value.trim().length >= 10 ||
                  "El comentario es muy corto. El comentario debe tener al menos 10 caracteres",
              }}
              error={errors.comment?.message}
              placeholder="Comparte tu experiencia..."
              multiline
              numberOfLines={4}
            />

            <Button
              title="Publicar reseña"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>

        <Modal
          visible={showRestaurantPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowRestaurantPicker(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Seleccionar restaurante</Text>
                <TouchableOpacity onPress={() => setShowRestaurantPicker(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {restaurants.map((item) => (
                  <RestaurantItem
                    key={item._id}
                    item={item}
                    selected={selectedRestaurant?._id === item._id}
                    onSelect={(restaurant) => {
                      setSelectedRestaurant(restaurant);
                      setShowRestaurantPicker(false);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  restaurantSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  restaurantSelectorDisabled: {
    opacity: 0.7,
  },
  restaurantSelectorText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: SPACING.md,
  },
  starButton: {
    marginHorizontal: SPACING.xs,
  },
  submitButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "70%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  pickerList: {
    padding: SPACING.md,
  },
  restaurantItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  restaurantItemSelected: {
    backgroundColor: COLORS.primary,
  },
  restaurantItemText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  restaurantItemTextSelected: {
    color: COLORS.text,
    fontWeight: "600",
  },
});

export default CreateReviewModal;