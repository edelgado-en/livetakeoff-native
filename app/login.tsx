import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
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
    <View className="flex-1 justify-center items-center px-6 bg-white">
      <Image
        source={require('../assets/logo_2618936_web.png')}
        className="w-32 h-32 mb-6"
        resizeMode="contain"
      />
      <Text className="text-3xl font-extrabold text-blue-700 mb-6">Live Takeoff</Text>

      <View className="w-full max-w-md">
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50 text-base"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 bg-gray-50 text-base"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-xl shadow-md"
          onPress={handleLogin}
        >
          <Text className="text-white text-center text-lg font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}