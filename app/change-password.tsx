import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import httpService from "../services/httpService";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const router = useRouter();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (/^\d+$/.test(password)) {
      return "Password cannot be only numbers.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePassword(newPassword);
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    if (newPassword !== newPasswordAgain) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await httpService.patch("/users/me/reset-password", {
        new_password: newPassword,
        new_password_again: newPasswordAgain,
      });
      Alert.alert("Success", "Your password has been changed.");
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Create New Password</Text>

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
          secureTextEntry={secure}
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 5 }}
          right={
            <TextInput.Icon
              icon={secure ? "eye-off" : "eye"}
              onPress={() => setSecure(!secure)}
            />
          }
        />
        <Text style={styles.hintText}>
          Your password must contain at least 8 characters.
        </Text>
        <Text style={styles.hintText}>
          Your password can’t be entirely numeric.
        </Text>

        <TextInput
          label="Confirm New Password"
          value={newPasswordAgain}
          onChangeText={setNewPasswordAgain}
          autoCapitalize="none"
          secureTextEntry={secure}
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 5, marginTop: 20 }}
        />
        <Text style={styles.hintText}>Both passwords must match.</Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading || !newPassword || !newPasswordAgain}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Tailwind gray-100
  },
  container: {
    padding: 20,
  },
  backIcon: {
    marginBottom: 16,
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Tailwind gray-300
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
    marginRight: 10,
  },
  hintText: {
    fontSize: 14,
    color: "#6B7280", // Tailwind gray-500
    marginTop: 8,
  },
});
