import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { TextInput, RadioButton, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SignupScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

      useFocusEffect(
          useCallback(() => {
              return () => {
              // Reset local state here manually
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhoneNumber('');
                setSelectedRole(null);
                setCustomerName('');
                setVendorName('');
                setSuccessMessage(null);
                setLoading(false);
              };
          }, [])
      );

  const onSubmit = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !selectedRole) {
      Alert.alert('Missing Field', 'Please complete all required fields.');
      return;
    }

    const data = {
      firstName,
      lastName,
      email,
      phoneNumber,
      selectedRole,
      customerName,
      vendorName,
    };

    setLoading(true);
    try {
      const response = await fetch('https://api-livetakeoff.herokuapp.com/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error: ${response.status} ${errorText}`);
            }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Signup failed');
        }

      setSuccessMessage(
        'Your request has been submitted. You will receive an email with further instructions shortly.'
      );

    } catch (e) {
      Alert.alert('Error', 'Unable to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: 'customer' | 'vendor') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedRole(role);
  };

  if (successMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successText}>{successMessage}</Text>
          <LottieView
                source={require('../assets/animations/check-success.json')}
                autoPlay
                loop={false}
                style={styles.animation}
            />
          <Button
                    mode="outlined"
                    style={styles.outlinedButton}
                    labelStyle={styles.buttonLabel}
                    onPress={() => router.replace('/login')}
                >
                    Go back to login
                </Button>
        </View>
      </SafeAreaView>
    );
  }

  const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '').slice(0, 10);

  const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return digits;

  const [, area, prefix, line] = match;
  if (area && !prefix) return `(${area}`;
  if (area && prefix && !line) return `(${area}) ${prefix}`;
  if (area && prefix && line) return `(${area}) ${prefix}-${line}`;

  return digits;
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
            <Image
                source={require('../assets/logo_2618936_web.png')}
                style={styles.logo}
                resizeMode="contain"
            />

        <Text style={styles.title}>Register your account</Text>
        <Text style={styles.subtitle}>
          We will review your request and get back to you shortly.
        </Text>

        <TextInput 
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            activeOutlineColor="#3B82F6" // Tailwind blue-500
            outlineColor="#D1D5DB"   
            style={styles.input} />

        

        <TextInput 
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            activeOutlineColor="#3B82F6" // Tailwind blue-500
            outlineColor="#D1D5DB"   
            style={styles.input} />
        
        <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            activeOutlineColor="#3B82F6" // Tailwind blue-500
            outlineColor="#D1D5DB"
            autoCapitalize="none"
            style={styles.input} />

        <TextInput
            label="Phone"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            mode="outlined"
            activeOutlineColor="#3B82F6" // Tailwind blue-500
            outlineColor="#D1D5DB"
            keyboardType="number-pad"
            style={styles.input}
        />

        <Text style={styles.roleLabel}>Specify your role</Text>
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity style={styles.radioRow} onPress={() => handleRoleChange('customer')}>
            <RadioButton value="customer" status={selectedRole === 'customer' ? 'checked' : 'unchecked'} />
            <Text style={styles.radioText}>I am a customer</Text>
          </TouchableOpacity>
          {selectedRole === 'customer' && (
            <TextInput
              label="Company Name (optional)"
              value={customerName}
              onChangeText={setCustomerName}
              mode="outlined"
              activeOutlineColor="#3B82F6" // Tailwind blue-500
              outlineColor="#D1D5DB"
              style={styles.input}
            />
          )}

          <TouchableOpacity style={styles.radioRow} onPress={() => handleRoleChange('vendor')}>
            <RadioButton value="vendor" status={selectedRole === 'vendor' ? 'checked' : 'unchecked'} />
            <Text style={styles.radioText}>I am a vendor</Text>
          </TouchableOpacity>
          {selectedRole === 'vendor' && (
            <TextInput
              label="Vendor Name (optional)"
              value={vendorName}
              onChangeText={setVendorName}
              mode="outlined"
              activeOutlineColor="#3B82F6" // Tailwind blue-500
              outlineColor="#D1D5DB"
              style={styles.input}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.agreement}>
          By signing up, you agree to our{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.livetakeoff.com/terms-and-conditions')}>
            Terms and Conditions
          </Text>{' '}and{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.livetakeoff.com/privacy-policy')}>
            Privacy Policy
          </Text>.
        </Text>

        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40, width: '90%', justifyContent: 'center', marginTop: 24,
    maxWidth: 500, alignSelf: 'center'},
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginTop: 10, color: '#374151' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6B7280', marginTop: 5, marginBottom: 24 },
  input: { marginBottom: 12, backgroundColor: 'white' },
  phoneContainer: { marginBottom: 12, borderRadius: 6, borderColor: '#D1D5DB', borderWidth: 1 },
  phoneTextContainer: { backgroundColor: '#fff' },
  roleLabel: { fontSize: 16, fontWeight: '500', marginVertical: 10, color: '#374151' },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  radioText: { fontSize: 14, color: '#4B5563' },
  button: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  agreement: { fontSize: 14, color: '#6B7280', marginTop: 20, textAlign: 'center' },
  link: { color: '#3B82F6', textDecorationLine: 'underline' },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  signinText: { fontSize: 14, color: '#6B7280' },
  loginLink: { marginLeft: 4, color: '#3B82F6', fontWeight: '500' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    animation: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
    successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
    outlinedButton: {
    width: '100%',
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
});