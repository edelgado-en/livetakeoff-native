import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

const JobSuccessScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/check-success.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />

      <Text style={styles.title}>Job Created!</Text>
      <Text style={styles.subtitle}>
        Our account managers have been notified of your request.
      </Text>

      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.mainButtonLabel}
        onPress={() => router.replace('/create')}
      >
        Create Another Job
      </Button>
      <Button
        mode="outlined"
        style={styles.outlinedButton}
        labelStyle={styles.buttonLabel}
        onPress={() => router.replace('/jobs')}
      >
        Back to Jobs
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#10B981', //green
  },
  mainButtonLabel: {
    fontSize: 16,
    color: '#fff',
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

export default JobSuccessScreen;