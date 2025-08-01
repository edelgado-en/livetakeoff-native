import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useEffect,
  useState,
  useContext,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Button, IconButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { TextInput as PaperTextInput } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

import UserAvatar from "../../../components/UserAvatar";

import httpService from "../../../services/httpService";

import JobCommentsPreview from "../../../components/JobCommentsPreview";
import InfoTable from "../../../components/job-info";
import ImageGallery from "../../../components/ImageGallery";
import ServiceGallery from "../../../components/ServiceGallery";
import JobStatusSteps from "../../../components/JobStatusSteps";
import PriceBreakdown from "../../../components/PriceBreakdown";

import { AuthContext } from "../../../providers/AuthProvider";

const { width: screenWidth } = Dimensions.get("window");
const isTablet = screenWidth >= 768; // Tailwind's md breakpoint

import { cropTextForDevice } from "../../../utils/textUtils";

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { currentUser } = useContext(AuthContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const inputRef = useRef<PaperTextInput>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [photos, setPhotos] = useState([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const [cancelLoading, setCancelLoading] = useState(false);

  const [priceBreakdown, setPriceBreakdown] = useState(null);

  const isTablet = width >= 768;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "A":
        return { backgroundColor: "#60a5fa" }; // bg-blue-400
      case "S":
        return { backgroundColor: "#f59e0b" }; // bg-yellow-500
      case "U":
        return { backgroundColor: "#6366f1" }; // bg-indigo-500
      case "W":
      case "C":
        return { backgroundColor: "#10B981" }; // bg-green-500
      case "T":
        return { backgroundColor: "#4b5563" }; // bg-gray-600
      case "R":
        return { backgroundColor: "#8b5cf6" }; // bg-purple-500
      case "I":
        return { backgroundColor: "#3b82f6" }; // bg-blue-500
      default:
        return { backgroundColor: "#6b7280" }; // default gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "A":
        return "Confirmed";
      case "S":
        return "Assigned";
      case "U":
        return "Submitted";
      case "W":
        return "In Progress";
      case "C":
        return "Completed";
      case "T":
        return "Canceled";
      case "R":
        return "Review";
      case "I":
        return "Invoiced";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isModalVisible]);

  useFocusEffect(
    useCallback(() => {
      const fetchJob = async () => {
        try {
          const response = await httpService.get(`/jobs/${jobId}/`);
          setJob(response);

          setCommentsRefreshKey((prev) => prev + 1);
        } catch (err) {
          console.error("Failed to fetch job", err);
        } finally {
          setLoading(false);
        }
      };

      fetchJob();
    }, [jobId])
  );

  useFocusEffect(
    useCallback(() => {
      if (!jobId) return;
      fetchPhotos();
    }, [jobId])
  );

  useFocusEffect(
    useCallback(() => {
      if (!jobId) return;

      if (currentUser.canSeePrice) {
        fetchPriceBreakdown();
      }
    }, [jobId])
  );

  const saveComment = async () => {
    if (!newComment.trim()) return;

    try {
      await httpService.post(`/job-comments/${jobId}/`, {
        comment: newComment,
        isPublic: true,
      });

      setNewComment("");
      setModalVisible(false);

      setCommentsRefreshKey((prev) => prev + 1);

      Toast.show({
        type: "success",
        text1: "Our team has been notified!",
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to post comment",
        text2: "Please try again.",
        position: "top",
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const response = await httpService.get(`/jobs/${jobId}/`);
      setJob(response);

      const photosResponse = await httpService.get(`/job-photos/${jobId}/`);
      setPhotos(photosResponse.results || []);

      setCommentsRefreshKey((prev) => prev + 1);

      if (currentUser.canSeePrice) {
        try {
          const priceResponse = await httpService.get(
            `/jobs/price-breakdown/${jobId}/`
          );
          setPriceBreakdown(priceResponse);
        } catch (error) {
          console.error("Failed to fetch price breakdown", error);
        }
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await httpService.get(`/job-photos/${jobId}/`);
      setPhotos(response.results || []);
    } catch (err) {
      console.error("Failed to fetch photos", err);
    }
  };

  const fetchPriceBreakdown = async () => {
    try {
      const response = await httpService.get(`/jobs/price-breakdown/${jobId}/`);
      setPriceBreakdown(response);
    } catch (error) {
      console.error("Failed to fetch price breakdown", error);
    }
  };

  const handleUploadPictures = async () => {
    const formData = new FormData();
    formData.append("is_customer", true);

    // Convert each image URI into a blob and append
    for (const uri of images) {
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("photo", {
        uri,
        name: filename,
        type,
      } as any); // React Native's FormData needs this cast
    }

    setImageUploadLoading(true);

    try {
      await httpService.post(`/job-photos/upload/${jobId}/`, formData);

      setImages([]);

      Toast.show({
        type: "success",
        text1: "Pictures uploaded!",
        position: "top",
      });

      fetchPhotos();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to upload pictures",
        text2: "Please try again.",
        position: "top",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleCancelJob = async () => {
    setCancelLoading(true);

    try {
      await httpService.patch(`/jobs/${jobId}/`, { status: "T" });

      onRefresh();

      Toast.show({
        type: "success",
        text1: "Job canceled!",
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to cancel job",
        text2: "Please try again.",
        position: "top",
      });
    } finally {
      setCancelLoading(false);
      setCancelModalVisible(false);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const removeImage = (uri: string) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setImages((prev) => prev.filter((img) => img !== uri)),
      },
    ]);
  };

  const handleRemoveService = async (id: number) => {
    setJob((prev) => ({
      ...prev,
      service_assignments: prev.service_assignments.filter(
        (service) => service.id !== id
      ),
    }));
  };

  if (loading || !job) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../../assets/animations/progress-bar.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { marginLeft: isTablet ? 0 : 7 }]}
            onPress={() => router.push("/jobs")}
          >
            <Ionicons name="arrow-back" size={20} color="#4B5563" />
          </TouchableOpacity>

          <View style={styles.jobTitleContainer}>
            <Text style={styles.tailNumber}>{job.tailNumber}</Text>
            <Text style={styles.customerName}>
              {cropTextForDevice(job.customer.name, 40)}
            </Text>
          </View>

          <Text style={[styles.statusPill, getStatusStyle(job.status)]}>
            {getStatusLabel(job.status)}
          </Text>
        </View>

        <View style={styles.tagContainer}>
          {job.tags?.map((tag) => {
            const tagStyle = getTagStyle(tag.tag_color);
            return (
              <View
                key={tag.id}
                style={[styles.tag, { borderColor: tagStyle.borderColor }]}
              >
                <Text style={[styles.tagText, { color: tagStyle.color }]}>
                  {tag.tag_short_name}
                </Text>
              </View>
            );
          })}
        </View>

        {currentUser.isCustomer &&
          (job.status === "U" || job.status === "A") && (
            <View style={styles.fullWidthContainer}>
              <Button
                onPress={() => setCancelModalVisible(true)}
                labelStyle={styles.cancelLabel}
                mode="text"
                contentStyle={{ justifyContent: "flex-end" }}
              >
                Cancel Job
              </Button>
            </View>
          )}

        {/* Job Info */}
        {isTablet ? (
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={[styles.card, { flex: 4 }]}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.cardTitle}>Job Info</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: "#374151" }}>
                    {job.purchase_order}
                  </Text>

                  {currentUser.isCustomer && (
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        marginLeft: 12,
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: "#6B7280",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setNewComment("");
                        setModalVisible(true);
                      }}
                    >
                      <Feather name="edit-2" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <InfoTable job={job} />
            </View>

            <View style={[styles.card, { flex: 1 }]}>
              <JobStatusSteps jobId={job.id} jobCurrentStatus={job.status} />
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.cardTitle}>Job Info</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#374151" }}>
                  {job.purchase_order}
                </Text>

                {currentUser.isCustomer && (
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      marginLeft: 12,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#6B7280",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setNewComment("");
                      setModalVisible(true);
                    }}
                  >
                    <Feather name="edit-2" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <InfoTable job={job} />
          </View>
        )}

        {/* Services */}
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: job.service_assignments?.length > 0 ? 8 : 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}
              >
                Services
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginLeft: 6,
                  position: "relative",
                  top: 1,
                }}
              >
                {job.service_assignments?.length}
              </Text>
            </View>
          </View>

          <ServiceGallery
            services={job.service_assignments}
            showRemove={
              currentUser.isCustomer &&
              (job.status === "A" || job.status === "U")
            }
            onRemove={handleRemoveService}
          />
        </View>

        {/* Comments */}
        <View style={styles.card}>
          <JobCommentsPreview jobId={job.id} refreshKey={commentsRefreshKey} />
        </View>

        {/* Pictures */}
        <View style={styles.card}>
          {imageUploadLoading ? (
            <LottieView
              source={require("../../../assets/animations/progress-bar.json")}
              autoPlay
              loop
              style={{ width: 150, height: 150, alignSelf: "center" }}
            />
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#111827",
                    }}
                  >
                    Pictures
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      marginLeft: 6,
                      position: "relative",
                      top: 1,
                    }}
                  >
                    {photos.length}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={pickImages}
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1,
                    borderColor: "#D1D5DB", // Tailwind gray-300
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 6,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather name="plus" size={16} color="#3B82F6" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#3B82F6",
                      fontWeight: "500",
                      marginLeft: 4,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageContainer}
              >
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <IconButton
                      icon="close"
                      size={16}
                      onPress={() => removeImage(uri)}
                      style={styles.removeButton}
                      iconColor="#fff"
                    />
                  </View>
                ))}
              </ScrollView>

              {images.length > 0 && (
                <Button
                  mode="outlined"
                  style={[styles.outlinedButton, { marginBottom: 20 }]}
                  labelStyle={styles.buttonLabel}
                  onPress={handleUploadPictures}
                >
                  Upload Pictures
                </Button>
              )}

              <ImageGallery images={photos} />
            </>
          )}
        </View>

        {/* Price Breakdown */}
        {priceBreakdown && currentUser.canSeePrice && (
          <PriceBreakdown
            priceBreakdown={priceBreakdown}
            jobDetails={job}
            currentUser={currentUser}
          />
        )}
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        backdropOpacity={0.5}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContainer}>
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <UserAvatar
              avatar={currentUser.avatar}
              initials={currentUser.initials}
            />
            <View style={{ flex: 1 }}>
              <PaperTextInput
                ref={inputRef}
                label="Tell us what would you like to change..."
                value={newComment}
                onChangeText={setNewComment}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={styles.textarea}
                theme={{ colors: { outline: "#D1D5DB" } }}
              />
            </View>
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postButton} onPress={saveComment}>
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={isCancelModalVisible}
        onBackdropPress={() => !cancelLoading && setCancelModalVisible(false)}
        onBackButtonPress={() => !cancelLoading && setCancelModalVisible(false)}
      >
        <View style={modalStyles.container}>
          {isCancelModalVisible ? (
            <LottieView
              source={require("../../../assets/animations/progress-bar.json")}
              autoPlay
              loop
              style={{ width: 150, height: 150, alignSelf: "center" }}
            />
          ) : (
            <>
              <Text style={modalStyles.title}>
                Are you sure you want to cancel this job?
              </Text>
              <View style={modalStyles.buttonRow}>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.cancelButton]}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Text style={modalStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.deleteButton]}
                  onPress={handleCancelJob}
                >
                  <Text style={modalStyles.deleteText}>Cancel Job</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const getTagStyle = (color: string) => {
  const colorStyles = {
    red: { borderColor: "#ef4444", color: "#ef4444" },
    orange: { borderColor: "#f97316", color: "#f97316" },
    amber: { borderColor: "#f59e0b", color: "#f59e0b" },
    indigo: { borderColor: "#6366f1", color: "#6366f1" },
    violet: { borderColor: "#8b5cf6", color: "#8b5cf6" },
    fuchsia: { borderColor: "#d946ef", color: "#d946ef" },
    pink: { borderColor: "#ec4899", color: "#ec4899" },
    slate: { borderColor: "#64748b", color: "#64748b" },
    lime: { borderColor: "#84cc16", color: "#84cc16" },
    emerald: { borderColor: "#10b981", color: "#10b981" },
    cyan: { borderColor: "#06b6d4", color: "#06b6d4" },
    blue: { borderColor: "#3b82f6", color: "#3b82f6" },
  };
  return colorStyles[color] || { borderColor: "#ccc", color: "#fff" };
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  statusPill: {
    color: "#fff",
    fontSize: isTablet ? 18 : 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
    top: 2,
    right: isTablet ? 0 : 6,
  },
  container: {
    paddingTop: 16,
    paddingHorizontal: isTablet ? 8 : 0,
    paddingBottom: 40,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 4,
    marginLeft: 6,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
  },
  loading: {
    marginTop: 100,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
    marginRight: 10,
  },
  jobTitleContainer: {
    flex: 1,
  },
  tailNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444", // Tailwind's red-500
  },
  customerName: {
    fontSize: 16,
    color: "#6B7280",
  },
  statusBadge: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  cardAction: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  infoContainer: {
    borderRadius: 12,
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    padding: 16,
    margin: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  label: {
    width: 100,
    fontWeight: "600",
    fontSize: 14,
    color: "#374151", // Tailwind gray-700
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563", // Tailwind gray-600
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or 'rgba(255,255,255,0.9)' for overlay effect
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  textarea: {
    marginBottom: 20,
    width: "100%",
    minHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 14,
  },
  postButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  postText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 9999,
    zIndex: 1,
  },
  outlinedButton: {
    width: "100%",
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  fullWidthContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    marginTop: 2,
  },
  cancelLabel: {
    color: "#EF4444", // Tailwind red-500
    fontSize: 14,
    fontWeight: "500",
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
