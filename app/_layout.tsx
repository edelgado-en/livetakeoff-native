import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/AuthProvider';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../toastConfig';
import * as Notifications from 'expo-notifications';

enableScreens();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // shows alert while app is foregrounded
    shouldShowList: true,    // puts it in the notification center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  // Set Inter as the default font globally for all <Text />
  if (fontsLoaded) {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = { fontFamily: 'Inter_400Regular' };
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PaperProvider>
                    <AuthProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                        <StatusBar style="auto" />
                        <Toast config={toastConfig} />
                    </AuthProvider>
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
  );
}