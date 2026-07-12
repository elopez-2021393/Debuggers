// client-user/src/navigation/AppNavigator.jsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { useAuthStore } from "../shared/store/authStore";
import { LoadingSpinner } from "../shared/components/common/Common";
import { RoleGuard } from "../shared/components/RoleGuard";
import { COLORS } from "../shared/constants/theme";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import AdminDashboardScreen from "../features/admin/screens/AdminDashboardScreen";
import ResAdminDashboardScreen from "../features/admin/screens/ResAdminDashboardScreen";
import AdminUsersScreen from "../features/admin/screens/AdminUsersScreen";
import AdminRestaurantsScreen from "../features/admin/screens/AdminRestaurantsScreen";
import AdminReportsScreen from "../features/admin/screens/AdminReportsScreen";
import PlaceholderScreen from "../features/admin/screens/PlaceholderScreen";
import ResAdminMenuScreen from "../features/admin/screens/ResAdminMenuScreen";
import ResAdminTablesScreen from "../features/admin/screens/ResAdminTablesScreen";
import ReservationsListScreen from "../features/admin/screens/ReservationsListScreen";
import OrdersListScreen from "../features/admin/screens/OrdersListScreen";
import ResAdminEventsScreen from "../features/admin/screens/ResAdminEventsScreen";
import ResAdminReviewsScreen from "../features/admin/screens/ResAdminReviewsScreen";
import ResAdminReportsScreen from "../features/admin/screens/ResAdminReportsScreen";

const Stack = createNativeStackNavigator();

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="RestaurantsList" component={AdminRestaurantsScreen} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
  </Stack.Navigator>
);

const ResAdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ResAdminDashboard" component={ResAdminDashboardScreen} />
    <Stack.Screen name="ResAdminRestaurant">
      {(props) => <ResAdminDashboardScreen {...props} miProp="valor" />}
    </Stack.Screen>
    <Stack.Screen
      name="ResAdminMenu"
      component={ResAdminMenuScreen}
    />
    <Stack.Screen
      name="ResAdminTables"
      component={ResAdminTablesScreen}
    />
    <Stack.Screen
      name="ReservationsList"
      component={ReservationsListScreen}
    />
    <Stack.Screen
      name="OrdersList"
      component={OrdersListScreen}
    />
    <Stack.Screen
      name="EventsList"
      component={ResAdminEventsScreen}
    />
    <Stack.Screen
      name="MyReviews"
      component={ResAdminReviewsScreen}
    />
    <Stack.Screen
      name="ResAdminReports"
      component={ResAdminReportsScreen}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        user?.role === "ADMIN_ROLE" ? (
          <RoleGuard allowedRoles={["ADMIN_ROLE"]}>
            <AdminStack />
          </RoleGuard>
        ) : user?.role === "RES_ADMIN_ROLE" ? (
          <RoleGuard allowedRoles={["RES_ADMIN_ROLE"]}>
            <ResAdminStack />
          </RoleGuard>
        ) : (
          <MainTabs />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
