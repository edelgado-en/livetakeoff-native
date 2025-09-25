import { Stack } from "expo-router";
import { useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../providers/AuthProvider";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Text, View, Platform } from "react-native";
import {
  Provider as PaperProvider,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
import { toastConfig } from "../toastConfig";
import * as Notifications from "expo-notifications";

import { AuthContext } from "../providers/AuthProvider";
import { useRouter, useSegments, usePathname } from "expo-router";

enableScreens();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // shows alert while app is foregrounded
    shouldShowList: true, // puts it in the notification center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AuthGate() {
  const { authIsBootstrapping, currentUser } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments(); // e.g. ['login'] or ['jobs']
  const pathname = usePathname();

  useEffect(() => {
    if (authIsBootstrapping) return;

    // Define which routes do NOT require auth
    const inAuthArea = [
      "login",
      "signup",
      "forgot-password",
      "(public)",
    ].includes((segments[0] as string) || "");

    if (currentUser && inAuthArea && pathname !== "/jobs") {
      // already logged in → send to jobs
      router.replace("/jobs");
    } else if (!currentUser && !inAuthArea && pathname !== "/login") {
      // not logged in → keep them on login
      router.replace("/login");
    }
  }, [authIsBootstrapping, currentUser, segments, router]);

  if (authIsBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Once bootstrapped, render the normal stack; redirects above will have run
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  // Set Inter as the default font globally for all <Text />
  if (fontsLoaded) {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = { fontFamily: "Inter_400Regular" };
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <AuthGate />
            <StatusBar style="auto" />
            {/* <Toast
                config={toastConfig}
                position="top"
                autoHide={true}
                visibilityTime={2500}
                topOffset={12}
                onShow={() => console.log("[toast] show")}
                onHide={() => console.log("[toast] hide")}
                /> */}
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
