// client-user/src/features/admin/screens/AdminRestaurantsScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdminRestaurants } from "../hooks/useAdminRestaurants";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import CreateRestaurantModal from "../components/CreateRestaurantModal";

const CATEGORIES = ["ALL", "COMIDA_RAPIDA", "ITALIANA", "CHINA", "MEXICANA", "CAFETERIA"];

const RestaurantCard = ({ restaurant, onDelete, onEdit }) => {
  const handleDelete = () => {
    Alert.alert(
      "Eliminar restaurante",
      `¿Eliminar "${restaurant.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(restaurant._id) },
      ]
    );
  };

  return (
    <Card style={styles.restaurantCard}>
      {restaurant.photo ? (
        <Image source={{ uri: restaurant.photo }} style={styles.restaurantImage} />
      ) : (
        <View style={[styles.restaurantImage, styles.restaurantImagePlaceholder]}>
          <MaterialIcons name="restaurant" size={40} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.restaurantContent}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.restaurantInfo}>
          <MaterialIcons name="location-on" size={14} color={COLORS.textSecondary} />
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>
        <View style={styles.restaurantMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="category" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{restaurant.category}</Text>
          </View>
          {restaurant.assignedAdmin && (
            <View style={styles.metaItem}>
              <MaterialIcons name="person" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                {restaurant.assignedAdmin.username || "Admin asignado"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(restaurant)}
          >
            <MaterialIcons name="edit" size={18} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={18} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const AdminRestaurantsScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    restaurants,
    loading,
    error,
    fetchAllRestaurants,
    deleteRestaurant,
    createRestaurant,
    updateRestaurant,
    uploadRestaurantPhoto,
  } = useAdminRestaurants();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAllRestaurants();
  }, [fetchAllRestaurants]);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const q = search.trim().toLowerCase();
    return (
      matchesCategory &&
      (!q || r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q))
    );
  });

  const handleCreateRestaurant = async (data, restaurantId, photo) => {
    setCreating(true);
    let result;
    let photoError = null;

    if (restaurantId) {
      result = await updateRestaurant(restaurantId, data);
      // Si se seleccionó una foto nueva, se sube aparte con el endpoint dedicado
      if (result.success && photo) {
        const photoResult = await uploadRestaurantPhoto(restaurantId, photo);
        if (photoResult.success) {
          result = photoResult;
        } else {
          // Los datos de texto sí se guardaron, pero la foto falló: hay que decirlo
          photoError = photoResult.error || "No se pudo subir la foto del restaurante";
        }
      }
    } else {
      result = await createRestaurant(data);
    }
    setCreating(false);

    if (result.success) {
      if (photoError) {
        Alert.alert(
          "Restaurante actualizado",
          `Los datos se guardaron correctamente, pero la foto no se pudo subir: ${photoError}`
        );
      } else {
        Alert.alert(
          "Éxito",
          restaurantId ? "Restaurante actualizado exitosamente" : "Restaurante creado exitosamente"
        );
      }
      setModalVisible(false);
      setEditingRestaurant(null);
    } else {
      Alert.alert(
        "Error",
        result.error ||
        (restaurantId ? "No se pudo actualizar el restaurante" : "No se pudo crear el restaurante")
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* FIX #5: paddingTop con insets */}
      <View style={[styles.screenHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Restaurantes</Text>
          <Text style={styles.screenSubtitle}>Gestiona restaurantes y su administración</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Input
          placeholder="Buscar restaurantes..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilterScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                categoryFilter === category && styles.categoryChipSelected,
              ]}
              onPress={() => setCategoryFilter(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  categoryFilter === category && styles.categoryChipTextSelected,
                ]}
              >
                {category === "ALL" ? "Todos" : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onDelete={async (id) => {
              const result = await deleteRestaurant(id);
              if (result.success) {
                Alert.alert("Éxito", "Restaurante eliminado");
              } else {
                Alert.alert("Error", "No se pudo eliminar el restaurante");
              }
            }}
            onEdit={(restaurant) => {
              setEditingRestaurant(restaurant);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchAllRestaurants}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant"
            title="No hay restaurantes"
            subtitle="No se encontraron restaurantes"
          />
        }
      />

      <CreateRestaurantModal
        visible={modalVisible}
        restaurant={editingRestaurant}
        onClose={() => {
          setModalVisible(false);
          setEditingRestaurant(null);
        }}
        onSubmit={handleCreateRestaurant}
        loading={creating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // FIX #5: paddingTop se aplica inline con insets
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: "700", marginBottom: SPACING.xs },
  screenSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filters: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: { marginBottom: SPACING.md },
  categoryFilterScroll: { marginBottom: SPACING.sm },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
  categoryChipTextSelected: { color: COLORS.text },
  listContent: { padding: SPACING.md },
  restaurantCard: { marginBottom: SPACING.md, overflow: "hidden" },
  restaurantImage: { width: "100%", height: 150, resizeMode: "cover" },
  restaurantImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantContent: { padding: SPACING.md },
  restaurantName: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700", marginBottom: SPACING.xs },
  restaurantInfo: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm },
  restaurantAddress: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  restaurantMeta: { flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.md },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: SPACING.md },
  metaText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginLeft: SPACING.xs },
  actions: { flexDirection: "row", gap: SPACING.sm },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  editButton: { backgroundColor: "rgba(242,80,156,0.1)", borderColor: "rgba(242,80,156,0.2)" },
  deleteButton: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" },
  actionButtonText: { fontSize: FONT_SIZE.xs, fontWeight: "600", marginLeft: SPACING.xs, color: COLORS.primary },
  deleteButtonText: { fontSize: FONT_SIZE.xs, fontWeight: "600", marginLeft: SPACING.xs, color: COLORS.error },
});

export default AdminRestaurantsScreen;