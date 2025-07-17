import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/jobs');
    } catch (err) {
        console.log(err)
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold text-center mb-6">Live Takeoff Login</Text>
      <TextInput
        placeholder="Email"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-lg"
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg font-semibold">Login</Text>
      </TouchableOpacity>
    </View>
  );
}