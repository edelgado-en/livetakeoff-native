import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import httpService from "../services/httpService"; // adjust the import path as needed

type Service = {
  id: number;
  name: string;
  short_name: string;
  short_description: string;
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
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);

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

            {showRemove && (
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedServiceId(item.id);
                    setIsModalVisible(true);
                  }}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => !loading && setIsModalVisible(false)}
        onBackButtonPress={() => !loading && setIsModalVisible(false)}
      >
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
              <Text style={modalStyles.subtitle}>
                {services.find((s) => s.id === selectedServiceId)?.short_name}
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
    marginBottom: 40,
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
