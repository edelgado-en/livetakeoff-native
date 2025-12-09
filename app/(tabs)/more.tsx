import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useContext } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { AuthContext } from "../../providers/AuthProvider";
import { MaterialIcons } from "@expo/vector-icons";

const getCurrentYear = () => new Date().getFullYear();

export default function MoreScreen() {
  const { logout } = useAuth();
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    logout();
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={[styles.container, { marginTop: 20 }]}>
        <Text style={styles.title}>Hi, {currentUser.first_name}</Text>
        <Text>{currentUser.email}</Text>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/user-profile")}
          >
            <View style={styles.cardContent}>
              <MaterialIcons name="person-outline" size={22} color="#6B7280" />
              <Text style={styles.cardText}>Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/change-password")}
          >
            <View style={styles.cardContent}>
              <MaterialIcons name="lock-outline" size={22} color="#6B7280" />
              <Text style={styles.cardText}>Change password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          {(currentUser.isInternalCoordinator ||
            currentUser.isProjectManager) && (
            <>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push("/my-airports")}
              >
                <View style={styles.cardContent}>
                  <MaterialIcons
                    name="airplane-ticket"
                    size={22}
                    color="#6B7280"
                  />
                  <Text style={styles.cardText}>My Airports</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push("/my-documents")}
              >
                <View style={styles.cardContent}>
                  <MaterialIcons
                    name="document-scanner"
                    size={22}
                    color="#6B7280"
                  />
                  <Text style={styles.cardText}>My Documents</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Constants.expoConfig?.version} (Build{" "}
            {Constants.expoConfig?.ios?.buildNumber})
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 14,
              lineHeight: 24,
              color: "#6B7280",
            }}
          >
            © {getCurrentYear()} Livetakeoff. All rights reserved.
          </Text>
        </View>
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
    flex: 1,
    backgroundColor: "#F3F4F6", // Tailwind gray-100
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827", // Tailwind gray-900
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280", // Tailwind gray-500
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB", // Tailwind gray-300
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 32,
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  versionContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  versionText: {
    color: "#6B7280",
    fontSize: 14,
  },
});
