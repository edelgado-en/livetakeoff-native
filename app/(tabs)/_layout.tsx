import { Tabs } from "expo-router";
import { useContext } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";

import { AuthContext } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { currentUser } = useContext(AuthContext);

  const canCreateJob =
    currentUser?.isAdmin ||
    currentUser?.isSuperUser ||
    currentUser?.isAccountManager ||
    currentUser?.isCustomer ||
    currentUser?.isInternalCoordinator;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#ef4444",
          height: Platform.OS === "ios" ? 90 : 100,
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIcon}>
              <Ionicons name="home" size={24} color={color} />
              <Text style={styles.tabLabel}>Home</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          headerShown: true,
          title: "New Job",
          // 👇 hide tab bar button when access is not allowed
          tabBarButton: canCreateJob ? undefined : () => null,
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIcon}>
              <MaterialIcons name="work-outline" size={26} color={color} />
              <Text style={styles.tabLabel}>New Job</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIcon}>
              <Ionicons
                name="ellipsis-horizontal-circle"
                size={24}
                color={color}
              />
              <Text style={styles.tabLabel}>More</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    width: 60,
    overflow: "hidden",
  },
});
