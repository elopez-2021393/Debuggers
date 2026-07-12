// client-user/src/features/home/screens/HomeScreen.jsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import restaurantClient from "../../../shared/api/restaurantClient";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Input from "../../../shared/components/common/Input";

const CATEGORY_LABELS = {
  COMIDA_RAPIDA: "Comida Rápida",
  ITALIANA: "Italiana",
  CHINA: "China",
  MEXICANA: "Mexicana",
  CAFETERIA: "Cafetería",
};

const RestaurantCard = ({ item, onPress }) => {
  const isOpen = item.isOpen;
  const statusColor = isOpen ? COLORS.success : COLORS.error;

  return (
    <TouchableOpacity onPress={onPress} style={styles.restaurantCard}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.restaurantImage} />
      ) : (
        <View style={[styles.restaurantImage, styles.restaurantImagePlaceholder]}>
          <MaterialIcons name="restaurant" size={40} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORY_LABELS[item.category] || item.category}
          </Text>
        </View>
        <Text style={styles.restaurantAddress} numberOfLines={1}>{item.address}</Text>
        <Text style={[styles.restaurantStatus, { color: statusColor }]}>
          {isOpen ? "Abierto" : "Cerrado"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantClient.get("/restaurants");
      const data = response.data.data || response.data;

      const withStatus = data.map((r) => {
        const now = new Date();
        const h = now.getHours();
        const open = parseInt(r.businessHours?.open?.split(":")[0] || "0");
        const close = parseInt(r.businessHours?.close?.split(":")[0] || "24");
        return { ...r, isOpen: h >= open && h < close };
      });

      setRestaurants(withStatus);
    } catch {
      // silencioso — la lista simplemente queda vacía
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const filtered = searchQuery.trim()
    ? restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : restaurants;

  const featured = filtered.slice(0, 6);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hola, {user?.firstName || "Usuario"} 👋
        </Text>
        <Text style={styles.title}>
          ¿Qué vas a <Text style={styles.highlight}>ordenar</Text> hoy?
        </Text>
      </View>

      {/* Búsqueda */}
      <Input
        placeholder="Busca restaurante o dirección..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {/* Restaurantes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? "Resultados" : "Restaurantes"}
          </Text>
          <Text style={styles.sectionCount}>{filtered.length} disponibles</Text>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : featured.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featured.map((item) => (
              <RestaurantCard
                key={item._id}
                item={item}
                onPress={() =>
                  navigation.navigate("Restaurantes", {
                    screen: "RestaurantDetail",
                    params: { restaurantId: item._id },
                  })
                }
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            icon="restaurant"
            title="Sin resultados"
            subtitle="Intenta con otro nombre o dirección"
          />
        )}
      </View>

      {/* Categorías rápidas */}
      <View style={[styles.section, { marginBottom: SPACING.xl * 2 }]}>
        <Text style={styles.sectionTitle}>Explorar por categoría</Text>
        <View style={styles.categoriesGrid}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
            const count = restaurants.filter((r) => r.category === value).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={value}
                style={styles.categoryCard}
                onPress={() => {
                  navigation.navigate("Restaurantes", {
                    screen: "RestaurantsList",
                    params: { category: value },
                  });
                }}
              >
                <MaterialIcons name="restaurant" size={24} color={COLORS.primary} />
                <Text style={styles.categoryCardLabel}>{label}</Text>
                <Text style={styles.categoryCardCount}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, paddingBottom: SPACING.md },
  greeting: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  title: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: "700" },
  highlight: { color: COLORS.primary, fontWeight: "700" },
  searchInput: { marginHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  section: { marginBottom: SPACING.xl, paddingHorizontal: SPACING.xl },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "600" },
  sectionCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  loadingRow: { alignItems: "center", padding: SPACING.lg },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  restaurantCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md, width: 200, overflow: "hidden", ...SHADOWS.sm,
  },
  restaurantImage: { width: "100%", height: 120, resizeMode: "cover" },
  restaurantImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt, justifyContent: "center", alignItems: "center",
  },
  restaurantInfo: { padding: SPACING.md },
  restaurantName: {
    color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "600", marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm, alignSelf: "flex-start", marginBottom: SPACING.xs,
  },
  categoryText: { color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: "600" },
  restaurantAddress: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs },
  restaurantStatus: { fontSize: FONT_SIZE.xs, fontWeight: "600" },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  categoryCard: {
    flex: 1, minWidth: "45%", backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, alignItems: "center", gap: SPACING.xs, ...SHADOWS.sm,
  },
  categoryCardLabel: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600", textAlign: "center" },
  categoryCardCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
});

export default HomeScreen;