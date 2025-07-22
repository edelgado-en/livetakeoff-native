import { View, Text, Button, StyleSheet } from 'react-native';
import React, { useContext } from 'react';

import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

import { AuthContext } from '../../providers/AuthProvider';

import UserCard from '../../components/UserCard';

export default function MoreScreen() {
  const { logout } = useAuth();
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More Options</Text>
      <UserCard currentUser={currentUser}/>
      <Button title="Logout" color="#ef4444" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});