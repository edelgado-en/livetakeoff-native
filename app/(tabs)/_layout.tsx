import { Tabs, useRouter } from 'expo-router';
import { Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function TabsLayout() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

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

      {/* 2. PLUS BUTTON TAB */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: () => (
            <View style={styles.plusButton}>
              <Entypo name="plus" size={28} color="#fff" />
            </View>
          ),
          tabBarButton: (props) => (
            <Pressable style={styles.plusWrapper} {...props} />
          ),
        }}
      />

      {/* 3. LOGOUT TAB */}
      <Tabs.Screen
        name="dummy"
        options={{
          tabBarButton: () => (
            <Pressable onPress={handleLogout} style={styles.tabIcon}>
              <MaterialIcons name="logout" size={24} color="#fff" />
              <Text style={styles.tabLabel}>Logout</Text>
            </Pressable>
          ),
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
    //dont break line
    textAlign: 'center',
    width: 60, // fixed width to prevent line breaks
    overflow: 'hidden',
    whiteSpace: 'nowrap', // for web compatibility
  },
  plusWrapper: {
    position: 'absolute',
    top: -30,
    left: '50%',
    marginLeft: -12.5,
    zIndex: 10,
  },
  plusButton: {
    backgroundColor: '#ef4444',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6, 
  },
});
