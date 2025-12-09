import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
  Modal,
  SafeAreaView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import DatePicker from "../components/DatePicker";

import SimpleDropdown from "../components/SimpleDropdown";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { formatForDjangoNY } from "../utils/datetime";

import httpService from "../services/httpService";
import { set } from "date-fns";

type DocType = "I" | "O" | "W";

type DocumentItem = {
  id: string | number;
  name: string;
  file: string; // Cloudinary delivery URL
  file_type: DocType;
  created_at?: string | Date;
  expiration_date?: string | Date;
};

const BADGE_STYLES: Record<DocType, { bg: string; fg: string; label: string }> =
  {
    I: { bg: "#DBEAFE", fg: "#1D4ED8", label: "Insurance" },
    W: { bg: "#EDE9FE", fg: "#6D28D9", label: "W-9" },
    O: { bg: "#E5E7EB", fg: "#374151", label: "Other" },
  };

const fileTypeOptions = [
  { label: "Insurance", value: "I" },
  { label: "W-9", value: "W" },
  { label: "Other", value: "O" },
];

export default function MyDocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpService.get("/vendor-files");
      setDocuments(res.results);
    } catch (e) {
      Alert.alert("Error", "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [fetchDocuments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDocuments();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDocuments]);

  // ---- Upload handler (uses expo-document-picker) ----
  const handleAdd = useCallback(async () => {
    console.log("Uploading file with type", selectedDocType);

    if (!selectedDocType) {
      Alert.alert("Validation Error", "Please select a document type.");
      return;
    }

    if (selectedDocType === "I" && !expirationDate) {
      Alert.alert(
        "Validation Error",
        "Expiration date is required for Insurance documents."
      );
      return;
    }

    try {
      setUploadLoading(true);

      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        // also accept text files
        type: ["image/*", "application/pdf", "text/*"],
      });

      const asset = res.assets[0]; // { uri, name, size, mimeType }

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
        size: asset.size,
      } as any); // 'as any' to satisfy TS
      formData.append("file_type", selectedDocType?.toString());
      formData.append("is_approved", "false");

      if (expirationDate) {
        formData.append("expiration_date", formatForDjangoNY(expirationDate));
      }

      await httpService.post("/vendor-files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFileUploadModalVisible(false);

      // 2) Refresh list
      await fetchDocuments();
    } catch (e) {
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setUploadLoading(false);
    }
  }, [selectedDocType, expirationDate, fetchDocuments]);

  const downloadFile = (item: DocumentItem) => {
    const fileUrl =
      "https://res.cloudinary.com/datidxeqm/" + item.file + "?dl=true";

    Linking.openURL(fileUrl).catch(() => {
      Alert.alert("Error", "Failed to open the document.");
    });
  };

  const renderItem = ({ item }: { item: DocumentItem }) => {
    const badge = BADGE_STYLES[item.file_type];
    const expiresLabel = item.expiration_date;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>
                {badge.label}
              </Text>
            </View>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
          </View>

          <Text style={styles.meta}>Uploaded on: {item.created_at}</Text>
          {!!expiresLabel && (
            <Text style={[styles.meta, { marginTop: 2 }]}>
              Expires on: {expiresLabel}
            </Text>
          )}
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => downloadFile(item)}
          >
            <Text style={styles.actionText}>Open</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backIcon}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Documents</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setFileUploadModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={18} color="#2563EB" />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Card container */}
      <View style={styles.wrap}>
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No files yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload insurance, W-9, or other documents.
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(d) => String(d.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 8 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* File Upload Modal */}
      <Modal
        visible={isFileUploadModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          !uploadLoading && setFileUploadModalVisible(false)
        }
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
              {uploadLoading ? (
                <LottieView
                  source={require("../assets/animations/progress-bar.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150, alignSelf: "center" }}
                />
              ) : (
                <>
                  <Text style={modalStyles.title}>Document Upload</Text>
                  <View style={{ paddingBottom: 16 }}>
                    <Text style={{ marginBottom: 8, fontWeight: "600" }}>
                      File Type
                    </Text>
                    <SimpleDropdown
                      options={fileTypeOptions}
                      selectedValue={selectedDocType}
                      onChange={setSelectedDocType}
                      placeholder="Choose a file type"
                    />
                  </View>
                  <View>
                    <DatePicker
                      label="Expiration Date"
                      value={expirationDate}
                      onChange={setExpirationDate}
                    />
                  </View>
                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.cancelButton]}
                      onPress={() => setFileUploadModalVisible(false)}
                    >
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.deleteButton]}
                      onPress={handleAdd}
                    >
                      <Text style={modalStyles.deleteText}>Upload File</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#F3F4F6",
    gap: 12,
  },
  modalContainerWide: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "92%", // NEW
    maxWidth: 520, // NEW
  },
  backIcon: {
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  screenTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: { color: "#2563EB", fontWeight: "600" },

  wrap: {
    flex: 1,
    margin: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 14,
    marginRight: 14,
  },
  card: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  meta: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionsCol: {
    marginLeft: 12,
    alignItems: "flex-end",
  },
  actionBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteBtn: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    color: "#111827",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280", // Tailwind's gray-500
    marginTop: -24,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 50,
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
