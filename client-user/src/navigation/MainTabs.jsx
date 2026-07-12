// client-user/src/navigation/MainTabs.jsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONT_SIZE } from "../shared/constants/theme";

import HomeScreen from "../features/home/screens/HomeScreen";
import RestaurantsListScreen from "../features/restaurants/screens/RestaurantsListScreen";
import RestaurantDetailScreen from "../features/restaurants/screens/RestaurantDetailScreen";
import RestaurantMenuScreen from "../features/restaurants/screens/RestaurantMenuScreen";
import CartScreen from "../features/orders/screens/CartScreen";
import CheckoutModal from "../features/orders/screens/CheckoutModal";
import ReservationsListScreen from "../features/reservations/screens/ReservationsListScreen";
import CreateReservationScreen from "../features/reservations/screens/CreateReservationScreen";
import OrdersListScreen from "../features/orders/screens/OrdersListScreen";
import OrderDetailScreen from "../features/orders/screens/OrderDetailScreen";
import EventsListScreen from "../features/events/screens/EventsListScreen";
import EventDetailScreen from "../features/events/screens/EventDetailScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import MyReviewsScreen from "../features/reviews/screens/MyReviewsScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const RestaurantsStack = createNativeStackNavigator();
const ReservationsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const screenOpts = { headerShown: false };

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={screenOpts}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
  </HomeStack.Navigator>
);

const RestaurantsStackNavigator = () => (
  <RestaurantsStack.Navigator screenOptions={screenOpts}>
    <RestaurantsStack.Screen name="RestaurantsList" component={RestaurantsListScreen} />
    <RestaurantsStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <RestaurantsStack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
    <RestaurantsStack.Screen name="Cart" component={CartScreen} />
    <RestaurantsStack.Screen name="CheckoutModal" component={CheckoutModal} />
    {/* CreateReservation accesible desde RestaurantDetail → "Reservar Mesa" */}
    <RestaurantsStack.Screen name="CreateReservation" component={CreateReservationScreen} />
  </RestaurantsStack.Navigator>
);

const ReservationsStackNavigator = () => (
  <ReservationsStack.Navigator screenOptions={screenOpts}>
    <ReservationsStack.Screen name="ReservationsList" component={ReservationsListScreen} />
    <ReservationsStack.Screen name="CreateReservation" component={CreateReservationScreen} />
  </ReservationsStack.Navigator>
);

const OrdersStackNavigator = () => (
  <OrdersStack.Navigator screenOptions={screenOpts}>
    <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} />
    <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </OrdersStack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator screenOptions={screenOpts}>
    <EventsStack.Screen name="EventsList" component={EventsListScreen} />
    <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
  </EventsStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={screenOpts}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <ProfileStack.Screen name="MyReviews" component={MyReviewsScreen} />
    {/* ReservationsList y CreateReservation en ProfileStack para acceso desde perfil */}
    <ProfileStack.Screen name="ReservationsList" component={ReservationsListScreen} />
    <ProfileStack.Screen name="CreateReservation" component={CreateReservationScreen} />
  </ProfileStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Inicio: "home",
          Restaurantes: "restaurant",
          Reservaciones: "event-seat",
          Pedidos: "shopping-cart",
          Eventos: "celebration",
          Perfil: "person",
        };
        return <MaterialIcons name={icons[route.name] || "circle"} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        height: 62,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Inicio" component={HomeStackNavigator} />
    <Tab.Screen name="Restaurantes" component={RestaurantsStackNavigator} />
    <Tab.Screen name="Reservaciones" component={ReservationsStackNavigator} />
    <Tab.Screen name="Pedidos" component={OrdersStackNavigator} />
    <Tab.Screen name="Eventos" component={EventsStackNavigator} />
    <Tab.Screen name="Perfil" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

export default MainTabs;