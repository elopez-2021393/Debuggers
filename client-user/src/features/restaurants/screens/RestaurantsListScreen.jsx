// client-user/src/features/restaurants/screens/RestaurantsListScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRestaurants } from "../hooks/useRestaurants";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Input from "../../../shared/components/common/Input";

const CATEGORY_LABELS = {
  ALL: "Todos",
  COMIDA_RAPIDA: "Comida Rápida",
  ITALIANA: "Italiana",
  CHINA: "China",
  MEXICANA: "Mexicana",
  CAFETERIA: "Cafetería",
};

const CATEGORIES = ["ALL", "COMIDA_RAPIDA", "ITALIANA", "CHINA", "MEXICANA", "CAFETERIA"];

const CategoryChip = ({ category, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
  >
    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
      {CATEGORY_LABELS[category] || category}
    </Text>
  </TouchableOpacity>
);

const RestaurantCard = ({ item, onPress }) => {
  const isOpen = item.isOpen ? "Abierto" : "Cerrado";
  const statusColor = item.isOpen ? COLORS.success : COLORS.error;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <MaterialIcons name="restaurant" size={40} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{CATEGORY_LABELS[item.category] || item.category}</Text>
        </View>
        <Text style={styles.cardAddress}>{item.address}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardStatus, { color: statusColor }]}>{isOpen}</Text>
          <MaterialIcons name="arrow-forward" size={20} color={COLORS.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RestaurantsListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.includes(route.params?.category) ? route.params.category : "ALL"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Sincroniza el filtro cuando se navega a esta pantalla con una categoría
  // específica (p. ej. desde "Explorar por categoría" en HomeScreen).
  useEffect(() => {
    const categoryParam = route.params?.category;
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [route.params?.category]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurantes</Text>
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryChip
              category={item}
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RestaurantCard
            item={item}
            onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item._id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="restaurant"
            title="No hay restaurantes"
            subtitle={selectedCategory !== "ALL" || searchQuery ? "Intenta con otro filtro o búsqueda" : "No hay restaurantes disponibles"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  searchInput: {
    marginBottom: SPACING.sm,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  categoriesList: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  cardImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  cardAddress: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardStatus: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
});

export default RestaurantsListScreen;