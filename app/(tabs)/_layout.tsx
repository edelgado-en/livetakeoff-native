import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#ef4444',
          height: Platform.OS === 'ios' ? 90 : 100,
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
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

      {/* 2. ALL JOBS TAB (center) */}
      <Tabs.Screen
        name="all-jobs"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIcon}>
              <MaterialIcons name="work-outline" size={26} color={color} />
              <Text style={styles.tabLabel}>All Jobs</Text>
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
              <Ionicons name="ellipsis-horizontal-circle" size={24} color={color} />
              <Text style={styles.tabLabel}>More</Text>
            </View>
          ),
        }}
      />

        <Tabs.Screen
            name="create"
            options={{
                href: null, // hides it from the bottom tab bar
                headerShown: true, // optional: show back button
                title: 'Create Job',
            }}
        />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    width: 60,
    overflow: 'hidden',
  },
});
