import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

import { TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/jobs');
    } catch (err) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
            <Image
                source={require('../assets/logo_2618936_web.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <View style={styles.form}>
                <TextInput
                    label="Username"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    activeOutlineColor="#3B82F6" // Tailwind blue-500
                    outlineColor="#D1D5DB"        // Tailwind gray-300
                    autoCapitalize="none"
                    style={{ marginVertical: 5 }}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    secureTextEntry={secure}
                    mode="outlined"
                    activeOutlineColor="#3B82F6" // Tailwind blue-500
                    outlineColor="#D1D5DB"        // Tailwind gray-300
                    style={{ marginVertical: 5, marginBottom: 20 }}
                    right={
                    <TextInput.Icon
                        icon={secure ? 'eye-off' : 'eye'}
                        onPress={() => setSecure(!secure)}
                    />
                    }
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>  
            <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#6B7280' }}>
                    Don't have an account?
                    <Text
                    style={{ color: '#2563EB', fontWeight: '500', marginLeft: 4 }}
                    onPress={() => router.replace('/signup')}
                    >
                    {' '}Sign up
                    </Text>
                </Text>
            </View>
        </ScrollView>

        {/* Footer Terms and Privacy */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.footerText}>
          By logging in, you agree to our{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.livetakeoff.com/terms-and-conditions')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.livetakeoff.com/privacy-policy')}>
            Privacy Policy
          </Text>.
        </Text>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  logo: {
    width: 128,
    height: 128,
    marginBottom: 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1d4ed8', // Tailwind's blue-700
    marginBottom: 24,
  },
  form: {
    width: '90%',
    maxWidth: 400, 
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db', // Tailwind's gray-300
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f9fafb', // Tailwind's gray-50
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ef4444', // Tailwind's red-500
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // light gray border
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280', // Tailwind's gray-500
    textAlign: 'center',
  },
  link: {
    color: '#ef4444', // Tailwind's red-500
    textDecorationLine: 'underline',
  },
});
