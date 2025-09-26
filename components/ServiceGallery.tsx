import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { Modal } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";
import httpService from "../services/httpService"; // adjust the import path as needed

const { height } = Dimensions.get("window");

type Service = {
  id: number;
  name: string;
  short_name: string;
  short_description: string;
  description: string;
};

type ServiceGalleryProps = {
  services: Service[];
  showRemove?: boolean;
  onRemove?: (id: number) => void;
};

const ServiceGallery: React.FC<ServiceGalleryProps> = ({
  services,
  showRemove = false,
  onRemove,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScopeModalVisible, setIsScopeModalVisible] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scopeItems = useMemo(() => {
    const raw = selectedScope ?? "";
    // Normalize CRLF and also handle literal "\r\n"
    const normalized = raw.replace(/\\r\\n|\r\n/g, "\n");
    return normalized
      .split("\n")
      .map((s) => s.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);
  }, [selectedScope]);

  const handleConfirmDelete = async () => {
    if (selectedServiceId === null) return;

    setLoading(true);

    try {
      await httpService.delete(`/jobs/services/${selectedServiceId}/`);
      onRemove?.(selectedServiceId);
    } catch (error) {
      Alert.alert("Error", "Failed to delete service. Please try again.");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setSelectedServiceId(null);
    }
  };

  return (
    <>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.content}>
              <Text style={styles.name}>{item.short_name || item.name}</Text>
              <Text style={styles.description}>{item.short_description}</Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedScope(item.description);
                  setIsScopeModalVisible(true);
                }}
              >
                <Text style={styles.removeText}>Scope</Text>
              </TouchableOpacity>
              {showRemove && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedServiceId(item.id);
                    setIsModalVisible(true);
                  }}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !loading && setIsModalVisible(false)}
      >
        {/* Backdrop */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        />
        <GestureHandlerRootView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.modalContainerWide}>
            <View style={modalStyles.container}>
              {loading ? (
                <LottieView
                  source={require("../assets/animations/progress-bar.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150, alignSelf: "center" }}
                />
              ) : (
                <>
                  <Text style={modalStyles.title}>
                    Are you sure you want to delete this service?
                  </Text>
                  <Text style={[modalStyles.subtitle, { marginTop: 10 }]}>
                    {
                      services.find((s) => s.id === selectedServiceId)
                        ?.short_name
                    }
                  </Text>
                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.cancelButton]}
                      onPress={() => setIsModalVisible(false)}
                    >
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.deleteButton]}
                      onPress={handleConfirmDelete}
                    >
                      <Text style={modalStyles.deleteText}>Delete Service</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>

      <Modal
        visible={isScopeModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !loading && setIsScopeModalVisible(false)}
      >
        {/* Backdrop */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        />
        <GestureHandlerRootView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.modalContainerWide}>
            <View style={modalStyles.container}>
              <Text style={modalStyles.title}>Scope of Work</Text>
              <ScrollView
                style={{ maxHeight: Math.min(height * 0.6, 420) }} // cap to ~60% of screen
                contentContainerStyle={{ paddingVertical: 8 }}
                showsVerticalScrollIndicator
                alwaysBounceVertical
                overScrollMode="always" // Android
              >
                {scopeItems.map((line, i) => (
                  <View key={i} style={styles.liRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.liText}>{line}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={[modalStyles.buttonRow, { marginTop: 20 }]}>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.cancelButton]}
                  onPress={() => setIsScopeModalVisible(false)}
                >
                  <Text style={modalStyles.cancelText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: 4,
  },
  card: {
    width: 240,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "space-between",
  },
  liRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10, // spacing between bullets
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
    lineHeight: 20,
    color: "#111827",
  },
  liText: {
    flex: 1,
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainerWide: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "92%", // NEW
    maxWidth: 520, // NEW
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    marginTop: 20,
    alignItems: "center",
  },
  removeText: {
    color: "#3B82F6",
    fontWeight: "500",
    fontSize: 14,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280", // Tailwind's gray-500
    marginTop: -24,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  cancelText: {
    color: "#111827",
    fontWeight: "600",
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ServiceGallery;
