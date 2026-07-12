// client-user/src/features/restaurants/screens/RestaurantMenuScreen.jsx
// Cambios principales:
//  1. Usa useCart() del store global → cartCount reactivo y addToCart abre el modal.
//  2. Reemplaza Alert.alert("Agregado") por apertura del CartModal.
//  3. Corrige el Safe Area: las categorías respetan el inset superior.

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import restaurantClient from "../../../shared/api/restaurantClient";
import { useCart } from "../../orders/hooks/useCart";
import CartModal from "../../orders/screens/CartModal";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";

const MENU_CATEGORIES = [
  { value: "ALL", label: "Todos" },
  { value: "DESAYUNO", label: "Desayuno" },
  { value: "ALMUERZO", label: "Almuerzo" },
  { value: "CENA", label: "Cena" },
  { value: "BEBIDA", label: "Bebida" },
  { value: "POSTRE", label: "Postre" },
];

const CategoryChip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
    activeOpacity={0.7}
  >
    <Text
      style={[
        styles.categoryChipText,
        selected && styles.categoryChipTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const MenuItemCard = ({ item, onAddToCart, adding }) => (
  <Card style={styles.menuItemCard}>
    {item.photo ? (
      <Image source={{ uri: item.photo }} style={styles.menuItemImage} />
    ) : (
      <View style={[styles.menuItemImage, styles.menuItemImagePlaceholder]}>
        <MaterialIcons
          name="restaurant-menu"
          size={40}
          color={COLORS.textMuted}
        />
      </View>
    )}
    <View style={styles.menuItemContent}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
        <Text style={styles.menuItemIngredients} numberOfLines={1}>
          🧂 {item.ingredients.join(", ")}
        </Text>
      )}
      <View style={styles.menuItemFooter}>
        <Text style={styles.menuItemPrice}>Q {item.price?.toFixed(2)}</Text>
        <Button
          title={adding ? "Agregando..." : "Agregar"}
          onPress={() => onAddToCart(item)}
          disabled={adding || !item.available}
          variant="secondary"
          style={styles.addButton}
        />
      </View>
      {!item.available && (
        <Text style={styles.unavailableText}>No disponible</Text>
      )}
    </View>
  </Card>
);

const RestaurantMenuScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { restaurantId } = route.params;

  const { addToCart, cartCount, openCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menu, setMenu] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [addingItem, setAddingItem] = useState(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(
        `/menu/restaurant/${restaurantId}`
      );
      const data = response.data.data || response.data;
      setMenu(Array.isArray(data) ? data : []);

      try {
        const restRes = await restaurantClient.get(
          `/restaurants/${restaurantId}`
        );
        const restData = restRes.data.data || restRes.data;
        setRestaurantName(restData.name || "Menú");
      } catch {
        // no crítico
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al cargar menú"
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleAddToCart = async (item) => {
    if (!item.available) {
      Alert.alert(
        "No disponible",
        "Este platillo no está disponible en este momento"
      );
      return;
    }
    try {
      setAddingItem(item._id);
      const result = await addToCart(item._id, 1, []);
      if (!result.ok) {
        Alert.alert("Error", result.message || "No se pudo agregar al carrito");
      }
      // Si ok: el store abre el CartModal automáticamente (isCartOpen = true)
    } finally {
      setAddingItem(null);
    }
  };

  const filteredMenu =
    selectedCategory === "ALL"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  // Header con botón del carrito
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: restaurantName || "Menú",
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: "600" },
      headerRight: () => (
        <TouchableOpacity
          onPress={openCart}
          style={styles.cartHeaderBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, restaurantName, cartCount, openCart]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="error" title="Error" subtitle={error} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Selector de categorías con Safe Area corregida ── */}
      <View
        style={[
          styles.categoriesContainer,
          // El stack de Restaurantes usa headerShown:false, así que el inset
          // superior no lo absorbe ningún header nativo. Lo aplicamos aquí.
          { paddingTop: insets.top + SPACING.sm },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {MENU_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.value}
              label={cat.label}
              selected={selectedCategory === cat.value}
              onPress={() => setSelectedCategory(cat.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Lista de platillos ── */}
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onAddToCart={handleAddToCart}
            adding={addingItem === item._id}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-menu"
            title="Sin platillos"
            subtitle={
              selectedCategory === "ALL"
                ? "Este restaurante no tiene platillos disponibles"
                : "No hay platillos en esta categoría"
            }
          />
        }
      />

      {/* ── Cart Modal (bottom sheet global) ── */}
      <CartModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: COLORS.text, fontSize: FONT_SIZE.md },

  // Categorías
  categoriesContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    alignItems: "center",
  },
  categoryChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
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
  categoryChipTextSelected: { color: "#fff" },

  // Lista
  listContent: { padding: SPACING.md },
  menuItemCard: { marginBottom: SPACING.md, overflow: "hidden" },
  menuItemImage: { width: "100%", height: 150, resizeMode: "cover" },
  menuItemImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemContent: { padding: SPACING.md },
  menuItemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  menuItemDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  menuItemIngredients: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  menuItemPrice: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
  },
  addButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  unavailableText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },

  // Header cart button
  cartHeaderBtn: { marginRight: SPACING.md, position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});

export default RestaurantMenuScreen;