import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TextInput } from "react-native-paper";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!username || !email) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await fetch("https://api-livetakeoff.herokuapp.com/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, email: email }),
      });

      setMessageSent(true);
    } catch (e) {
      Alert.alert("Failure", "Unable to send reset password email.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/animations/progress-bar.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {messageSent && (
        <View style={messageStyles.container}>
          <LottieView
            source={require("../assets/animations/check-success.json")}
            autoPlay
            loop={false}
            style={messageStyles.animation}
          />

          <View style={messageStyles.textWrapper}>
            <Text style={messageStyles.title}>Check your email</Text>
            <Text style={messageStyles.subtitle}>
              If an account with that email exists, we've sent instructions to
              reset your password.
            </Text>
          </View>

          <View style={messageStyles.buttonWrapper}>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={messageStyles.link}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!messageSent && (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/login")}
            >
              <Ionicons name="arrow-back" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Image
            source={require("../assets/logo_2618936_web.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={messageStyles.mainTitle}>Forgot Password</Text>

          <View style={styles.form}>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              activeOutlineColor="#3B82F6" // Tailwind blue-500
              outlineColor="#D1D5DB" // Tailwind gray-300
              autoCapitalize="none"
              style={{ marginVertical: 5, backgroundColor: "white" }}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              mode="outlined"
              activeOutlineColor="#3B82F6" // Tailwind blue-500
              outlineColor="#D1D5DB" // Tailwind gray-300
              style={{
                marginVertical: 5,
                marginBottom: 20,
                backgroundColor: "white",
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleForgotPassword}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const messageStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 140,
    paddingBottom: 64,
    alignItems: "center",
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  textWrapper: {
    marginTop: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827", // Tailwind's gray-900
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280", // Tailwind's gray-500
    marginTop: 8,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  link: {
    fontSize: 18,
    color: "#2563eb", // Tailwind's blue-600
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  logo: {
    width: 128,
    height: 128,
    marginBottom: 24,
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1d4ed8", // Tailwind's blue-700
    marginBottom: 24,
  },
  form: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db", // Tailwind's gray-300
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb", // Tailwind's gray-50
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ef4444", // Tailwind's red-500
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB", // light gray border
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280", // Tailwind's gray-500
    textAlign: "center",
  },
  link: {
    color: "#2563EB", // Tailwind's blue-500
    textDecorationLine: "underline",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or 'rgba(255,255,255,0.9)' for overlay effect
  },
  backButton: {
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  formContainer: {
    width: "90%", // same as your form
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "flex-start", // aligns back button left inside centered container
  },
});
