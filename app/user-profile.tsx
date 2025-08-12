import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useContext, useCallback } from "react";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import httpService from "../services/httpService";
import UserAvatar from "../components/UserAvatar";

import { AuthContext } from "../providers/AuthProvider";

export default function ChangePasswordScreen() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(currentUser.email);
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser.phone_number || ""
  );
  const [firstName, setFirstName] = useState(currentUser.first_name);
  const [lastName, setLastName] = useState(currentUser.last_name);
  const router = useRouter();

  const handleUpdateUser = async () => {
    const request = {
      email,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
    };

    setLoading(true);

    if (!email || !firstName || !lastName) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    try {
      await httpService.patch("/users/me", request);
      const response = await httpService.get("/users/me");

      setCurrentUser(response);

      Alert.alert("Success", "Profile updated!.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
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

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <UserAvatar
            size={100}
            avatar={currentUser.avatar}
            initials={currentUser.initials}
          />
          <Text style={{ fontWeight: "600", fontSize: 20 }}>
            {currentUser.first_name} {currentUser.last_name}
          </Text>
          <Text style={{ fontSize: 18 }}>{currentUser.access_level_label}</Text>
        </View>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 10 }}
        />

        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          autoCapitalize="none"
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 10 }}
        />

        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="none"
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 10 }}
        />

        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="none"
          mode="outlined"
          activeOutlineColor="#3B82F6" // Tailwind blue-500
          outlineColor="#D1D5DB" // Tailwind gray-300
          style={{ marginVertical: 10 }}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleUpdateUser}
          disabled={loading || !firstName || !lastName || !email}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Complete"}
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
});
