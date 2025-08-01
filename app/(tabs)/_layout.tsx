import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function TabsLayout() {
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
      {/* 1. HOME TAB */}
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

      {/* 2. CREATE JOB TAB */}
      <Tabs.Screen
        name="create"
        options={{
          headerShown: true, // optional: show back button
          title: "New Job",
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIcon}>
              <MaterialIcons name="work-outline" size={26} color={color} />
              <Text style={styles.tabLabel}>New Job</Text>
            </View>
          ),
        }}
      />

      {/* 3. MORE TAB */}
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
