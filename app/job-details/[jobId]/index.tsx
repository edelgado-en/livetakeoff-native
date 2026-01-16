import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
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

import SimpleMessage from "../../../components/NotificationMessage";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Button, IconButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { Modal } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { GestureHandlerRootView } from "react-native-gesture-handler";

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
import { set } from "date-fns";

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { currentUser } = useContext(AuthContext);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [isReturnJobModalVisible, setReturnJobModalVisible] = useState(false);
  const [isCompleteJobModalVisible, setCompleteJobModalVisible] =
    useState(false);

  const [isInitialInspectionModalVisible, setInitialInspectionModalVisible] =
    useState(false);

  const [
    isInspectionChecklistModalVisible,
    setInspectionChecklistModalVisible,
  ] = useState(false);
  const [inspectionComment, setInspectionComment] = useState("");
  const [inspectionPerformedBy, setInspectionPerformedBy] = useState("");
  const [globalInspectionChecklist, setGlobalInspectionChecklist] = useState(
    []
  );
  const [showChecklist, setShowChecklist] = useState(false);

  const [showNotificationMessage, setShowNotificationMessage] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // "success" | "error" | "info"

  const inputRef = useRef<PaperTextInput>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);

  const [returnJobComment, setReturnJobComment] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [photos, setPhotos] = useState([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const [cancelLoading, setCancelLoading] = useState(false);

  const [returnJobLoading, setReturnJobLoading] = useState(false);

  const [completeJobLoading, setCompleteJobLoading] = useState(false);

  const [startJobLoading, setStartJobLoading] = useState(false);

  const [priceBreakdown, setPriceBreakdown] = useState(null);

  const [isVendorAccepted, setIsVendorAccepted] = useState(false);

  const [photosCount, setPhotosCount] = useState(0);
  const [numberOfPeople, setNumberOfPeople] = useState(0);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [minutesWorked, setMinutesWorked] = useState(0);
  const [otherPMsWorkingOnIt, setOtherPMsWorkingOnIt] = useState(false);

  const [serviceActivities, setServiceActivities] = useState([]);

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

          const vendorAcceptedTag = response.tags.find(
            (tag) => tag.tag_name === "Vendor Accepted"
          );

          if (vendorAcceptedTag) {
            setIsVendorAccepted(true);
          }

          setJob(response);

          setCommentsRefreshKey((prev) => prev + 1);

          const response2 = await httpService.post("/tail-service-history", {
            tail_number: response.tailNumber,
          });

          //iterate through response2.data.results and remove duplicates entry.
          //A duplicate entry has the same service name and the same purchase order number
          const uniqueServiceActivities = [];

          for (let i = 0; i < response2.results.length; i++) {
            const serviceActivity = response2.results[i];
            const found = uniqueServiceActivities.some(
              (el) =>
                el.service_name === serviceActivity.service_name &&
                el.purchase_order === serviceActivity.purchase_order
            );

            if (!found) {
              uniqueServiceActivities.push(serviceActivity);
            }
          }

          setServiceActivities(uniqueServiceActivities);
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
    console.log("Saving comment:", newComment);
    if (!newComment.trim()) return;

    try {
      await httpService.post(`/job-comments/${jobId}/`, {
        comment: newComment,
        isPublic: true,
      });

      setNewComment("");
      setModalVisible(false);

      setCommentsRefreshKey((prev) => prev + 1);

      setShowNotificationMessage(true);
      setNotificationMessage("Comment posted!");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to post comment. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);

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
      setLoading(false);
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

      fetchPhotos();
    } catch (error) {
      Alert.alert("Error", "Failed to upload pictures. Please try again.");
    } finally {
      setImageUploadLoading(false);
    }
  };

  const canCompleteJob = async () => {
    setCompleteJobModalVisible(true);

    try {
      const response = await httpService.get(`/jobs/can-complete/${jobId}/`);

      setOtherPMsWorkingOnIt(response.other_pms_working_on_it);
      setPhotosCount(response.photos_count);
      setHoursWorked(response.hours);
      setMinutesWorked(response.minutes);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to verify if job can be completed. Please try again."
      );
    }
  };

  const handleAcceptJob = async () => {
    try {
      await httpService.get(`/jobs/accept/${jobId}/`);

      setShowNotificationMessage(true);
      setNotificationMessage("Job Accepted!");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);

      setIsVendorAccepted(true);

      onRefresh();
    } catch (err) {
      Alert.alert("Error", "Failed to accept job. Please try again.");
    }
  };

  const handleNothingToReport = () => {
    if (inspectionPerformedBy.trim() === "") {
      Alert.alert(
        "Please enter the name of the person performing the inspection."
      );
      return;
    }
    handleStartJob(null);
  };

  const handlePreExistingConditionToReport = async () => {
    if (inspectionPerformedBy.trim() === "") {
      Alert.alert(
        "Please enter the name of the person performing the inspection."
      );
      return;
    }
    if (inspectionComment.trim() === "") {
      Alert.alert("Please enter a comment to report pre-existing condition.");
      return;
    }

    try {
      const response = await httpService.post(`/job-comments/${jobId}/`, {
        comment: inspectionComment,
        isPublic: true,
        sendEmail: true,
      });

      handleStartJob(response.id);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to report pre-existing condition. Please try again."
      );
      return;
    }
  };

  const handleCompleteNothingToReport = () => {
    if (!inspectionPerformedBy.trim()) {
      Alert.alert("Validation", "Please enter who performed the inspection.");
      return;
    }

    // validate number of people is specified and is a positive number
    if (numberOfPeople <= 0) {
      Alert.alert("Error", "Please specify valid number of people.");
      return;
    }

    // No extra comment needed; just complete
    handleCompleteJob(null);
  };

  const handleReportConcern = async () => {
    if (!inspectionPerformedBy.trim()) {
      Alert.alert("Validation", "Please enter who performed the inspection.");
      return;
    }
    if (!inspectionComment.trim()) {
      Alert.alert(
        "Validation",
        "Please add a brief note describing the issue."
      );
      return;
    }

    // validate number of people is specified and is a positive number
    if (numberOfPeople <= 0) {
      Alert.alert("Error", "Please specify valid number of people.");
      return;
    }

    try {
      // Post the concern as a public job comment
      const response = await httpService.post(`/job-comments/${jobId}/`, {
        comment: inspectionComment,
        isPublic: true,
        sendEmail: true,
      });

      handleCompleteJob(response.id);
    } catch (e) {
      Alert.alert("Error", "Failed to post your concern. You can try again.");
      return;
    }
  };

  const handleStartJob = async (commentId: number | null) => {
    setStartJobLoading(true);

    try {
      await httpService.patch(`/jobs/${jobId}/`, {
        status: "W",
        inspection_performed_by: inspectionPerformedBy,
        initial_issue_comment_id: commentId,
      });

      setShowNotificationMessage(true);
      setNotificationMessage("Job Started!");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);

      onRefresh();
    } catch (error) {
      Alert.alert("Error", "Failed to start job. Please try again.");
    } finally {
      setStartJobLoading(false);
      setInitialInspectionModalVisible(false);
    }
  };

  const handleCompleteJob = async (commentId: number | null) => {
    setCompleteJobLoading(true);

    const totalMinutes = hoursWorked * 60 + minutesWorked;
    const totalHours = totalMinutes / 60;
    const laborTime = totalHours * numberOfPeople;

    const request = {
      status: "C",
      hours_worked: hoursWorked,
      minutes_worked: minutesWorked,
      number_of_workers: numberOfPeople,
      labor_time: laborTime,
      final_inspection_done_by: inspectionPerformedBy,
      final_concern_comment_id: commentId,
    };

    try {
      httpService.patch(`/jobs/${jobId}/`, request);

      router.push("/jobs");
    } catch (error) {
      Alert.alert("Error", "Failed to complete job. Please try again.");
    } finally {
      setCompleteJobLoading(false);
      setCompleteJobModalVisible(false);
    }
  };

  const handleReturnJob = async () => {
    setReturnJobLoading(true);

    const data = {
      comment: returnJobComment,
    };

    try {
      await httpService.post(`/jobs/return/${jobId}/`, data);

      onRefresh();

      router.push("/jobs");
    } catch (error) {
      Alert.alert("Error", "Failed to return job. Please try again.");
    } finally {
      setReturnJobLoading(false);
      setReturnJobModalVisible(false);
      setReturnJobComment("");
    }
  };

  const handleCancelJob = async () => {
    setCancelLoading(true);

    try {
      await httpService.patch(`/jobs/${jobId}/`, { status: "T" });

      onRefresh();

      setShowNotificationMessage(true);
      setNotificationMessage("Job Canceled!");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel job. Please try again.");
    } finally {
      setCancelLoading(false);
      setCancelModalVisible(false);
    }
  };

  const handleConfirmJob = async () => {
    setLoading(true);
    try {
      await httpService.patch(`/jobs/${jobId}/`, { status: "A" });

      onRefresh();

      setShowNotificationMessage(true);
      setNotificationMessage("Job Confirmed!");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to confirm job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInitialInspectionModal = async () => {
    setInitialInspectionModalVisible(true);
    setInspectionPerformedBy("");
    setInspectionComment("");

    try {
      const response = await httpService.post(`/global-inspection-checklist`, {
        inspection_type: "I",
      });

      const items = response.results
        .flatMap((item) => (item.item_description || "").split(/\r?\n/))
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      setGlobalInspectionChecklist(items);
    } catch {
      Alert.alert("Unable to fetch global inspection checklist.");
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
      if (uris.length + images.length > 25) {
        Alert.alert("Error", "You can only upload up to 25 pictures.");
        return;
      }

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

  const handleSetNumberOfPeople = (value) => {
    //it can only be a positive number
    if (value >= 0) {
      setNumberOfPeople(value);
    }
  };

  const handleSetHoursWorked = (value) => {
    //it can only be a positive number
    if (value >= 0) {
      //value can only be an integer
      value = Math.floor(value);

      setHoursWorked(value);
    }
  };

  const handleSetMinutesWorked = (value) => {
    //it can only be a positive number
    if (value >= 0 && value < 60) {
      value = Math.floor(value);
      setMinutesWorked(value);
    }
  };

  const renderServiceActivity = ({ item }: any) => (
    <View style={styles.itemContainer}>
      {/* Top row: date + PO link */}
      <View style={styles.rowBetween}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push(`/job-details/${item.job_id}/`)}
          style={styles.linkButton}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>{item.purchase_order}</Text>
        </TouchableOpacity>
      </View>

      {/* Service name */}
      <Text style={styles.serviceName}>{item.service_name}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.airportPill}>
          <Text style={styles.airportPillText}>{item.airport_name}</Text>
        </View>

        <Text style={styles.fboText}>{item.fbo_name}</Text>

        <Text style={styles.tailText}>{item.tail_number}</Text>
      </View>
    </View>
  );

  if (!currentUser) return null;

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
      <SimpleMessage
        visible={showNotificationMessage}
        text={notificationMessage}
        type={notificationType}
        position="top" // or "bottom"
      />
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
            <View style={[styles.fullWidthContainer, { marginBottom: 6 }]}>
              <Button
                onPress={() => setCancelModalVisible(true)}
                labelStyle={styles.cancelLabel}
                mode="text"
                contentStyle={{ justifyContent: "flex-end" }}
              >
                Cancel Job
              </Button>
              {job.status === "U" && currentUser.canConfirmJobs && (
                <TouchableOpacity
                  onPress={handleConfirmJob}
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1,
                    borderColor: "#D1D5DB", // Tailwind gray-300
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginLeft: 6,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#3B82F6",
                      fontWeight: "500",
                      marginLeft: 4,
                    }}
                  >
                    Confirm Job
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        {!currentUser.isCustomer && (
          <>
            {job.status === "U" && (
              <View style={[styles.fullWidthContainer, { marginBottom: 6 }]}>
                <Button
                  onPress={handleConfirmJob}
                  labelStyle={styles.primaryButton}
                  mode="text"
                  contentStyle={{ justifyContent: "flex-end" }}
                >
                  Confirm Job
                </Button>
              </View>
            )}

            {job.status === "S" && (
              <View style={[styles.fullWidthContainer, { marginBottom: 6 }]}>
                {currentUser.isProjectManager && (
                  <>
                    <Button
                      onPress={() => setReturnJobModalVisible(true)}
                      labelStyle={styles.secondaryButton}
                      mode="text"
                      contentStyle={{ justifyContent: "flex-end" }}
                    >
                      <Text style={styles.buttonText}>Return Job</Text>
                    </Button>
                    {currentUser.canAcceptJobs && (
                      <>
                        {isVendorAccepted ? (
                          <Button
                            onPress={handleOpenInitialInspectionModal}
                            labelStyle={styles.primaryButton}
                            mode="text"
                            contentStyle={{ justifyContent: "flex-end" }}
                          >
                            Start Job
                          </Button>
                        ) : (
                          <Button
                            onPress={handleAcceptJob}
                            labelStyle={styles.primaryButton}
                            mode="text"
                          >
                            Accept Job
                          </Button>
                        )}
                      </>
                    )}

                    {!currentUser.canAcceptJobs && (
                      <Button
                        onPress={handleOpenInitialInspectionModal}
                        labelStyle={styles.primaryButton}
                        mode="text"
                        contentStyle={{ justifyContent: "flex-end" }}
                      >
                        Start Job
                      </Button>
                    )}
                  </>
                )}

                {!currentUser.isProjectManager && (
                  <Button
                    onPress={handleOpenInitialInspectionModal}
                    labelStyle={styles.primaryButton}
                    mode="text"
                    contentStyle={{ justifyContent: "flex-end" }}
                  >
                    Start Job
                  </Button>
                )}
              </View>
            )}

            {job.status === "W" && (
              <View style={[styles.fullWidthContainer, { marginBottom: 6 }]}>
                <Button
                  onPress={() => canCompleteJob()}
                  labelStyle={styles.primaryButton}
                  mode="text"
                  contentStyle={{ justifyContent: "flex-end" }}
                >
                  Complete Job
                </Button>
              </View>
            )}
          </>
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

        {serviceActivities?.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>
                Found {serviceActivities.length} previous services
              </Text>
            </View>

            <FlatList
              data={serviceActivities}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderServiceActivity}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false} // <- disables inner scrolling
              nestedScrollEnabled // helps Android nested gestures
              removeClippedSubviews={false} // safer when nested
            />
          </View>
        )}
      </ScrollView>

      {/* Add Comment modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
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
            <View style={styles.modalContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
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
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={saveComment}
                >
                  <Text style={styles.postText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Cancel Job Modal */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !cancelLoading && setCancelModalVisible(false)}
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
              {cancelLoading ? (
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
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Return Job Modal */}
      <Modal
        visible={isReturnJobModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          !returnJobLoading && setReturnJobModalVisible(false)
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
              {returnJobLoading ? (
                <LottieView
                  source={require("../../../assets/animations/progress-bar.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150, alignSelf: "center" }}
                />
              ) : (
                <>
                  <Text style={modalStyles.title}>
                    Are you sure you want to return this job?
                  </Text>
                  <View>
                    <PaperTextInput
                      ref={inputRef}
                      label="Add an explanation..."
                      value={returnJobComment}
                      onChangeText={setReturnJobComment}
                      mode="outlined"
                      multiline
                      numberOfLines={5}
                      style={[styles.textarea, { backgroundColor: "white" }]}
                      theme={{ colors: { outline: "#D1D5DB" } }}
                    />
                  </View>
                  <View style={[modalStyles.buttonRow, { marginTop: 20 }]}>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.cancelButton]}
                      onPress={() => setReturnJobModalVisible(false)}
                    >
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.deleteButton]}
                      disabled={!returnJobComment.trim()}
                      onPress={handleReturnJob}
                    >
                      <Text style={modalStyles.deleteText}>Return Job</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Complete Job Modal */}
      <Modal
        visible={isCompleteJobModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onShow={() => {
          // Fetch FINAL inspection checklist when modal opens
          (async () => {
            try {
              const response = await httpService.post(
                `/global-inspection-checklist`,
                {
                  inspection_type: "F", // Final inspection
                }
              );
              const items = response.results
                .flatMap((it: any) =>
                  (it.item_description || "").split(/\r?\n/)
                )
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
              setGlobalInspectionChecklist(items);
            } catch {
              // keep UX smooth
            }
          })();
        }}
        onRequestClose={() =>
          !completeJobLoading && setCompleteJobModalVisible(false)
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
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={{ width: "92%", maxWidth: 520 }}
            keyboardVerticalOffset={Platform.select({ ios: 24, android: 0 })}
          >
            <View style={[modalStyles.sheet]}>
              {/* Header */}
              <View style={modalStyles.headerPad}>
                <Text style={modalStyles.title}>Complete Job</Text>
                <Text style={[modalStyles.subtitle, { marginTop: -8 }]}>
                  Completing a job will complete all services associated with
                  it.
                  {currentUser.isProjectManager
                    ? " You won't have access to the job after it is completed."
                    : ""}
                </Text>
              </View>

              {completeJobLoading ? (
                <LottieView
                  source={require("../../../assets/animations/progress-bar.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150, alignSelf: "center" }}
                />
              ) : (
                <>
                  {/* Scrollable content */}
                  <ScrollView
                    style={modalStyles.body}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    bounces={false}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Acknowledgment */}
                    <View style={modalStyles.sectionCard}>
                      <View style={modalStyles.sectionHeader}>
                        <Text style={modalStyles.sectionHeaderText}>
                          Acknowledgment
                        </Text>
                      </View>
                      <View style={modalStyles.sectionBody}>
                        <Text style={modalStyles.sectionBodyText}>
                          Final inspection completed and any discrepancies
                          reported immediately through LiveTakeoff.
                        </Text>
                      </View>
                    </View>

                    {/* Checklist (collapsible) */}
                    <View style={modalStyles.sectionCard}>
                      <TouchableOpacity
                        style={[
                          modalStyles.sectionHeader,
                          modalStyles.sectionHeaderRow,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => setShowChecklist((v) => !v)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: showChecklist }}
                      >
                        <Text style={modalStyles.sectionHeaderText}>
                          Review Checklist
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#6B7280"
                          style={{
                            transform: [
                              { rotate: showChecklist ? "180deg" : "0deg" },
                            ],
                          }}
                        />
                      </TouchableOpacity>

                      {showChecklist && (
                        <View
                          style={[modalStyles.sectionBody, { paddingTop: 12 }]}
                        >
                          <ScrollView
                            style={modalStyles.checklistScroll}
                            contentContainerStyle={{ paddingRight: 4 }}
                            bounces={false}
                            showsVerticalScrollIndicator
                          >
                            {globalInspectionChecklist.length === 0 ? (
                              <Text style={modalStyles.muted}>
                                No items found.
                              </Text>
                            ) : (
                              globalInspectionChecklist.map((item, idx) => (
                                <View
                                  key={`${idx}-${item}`}
                                  style={modalStyles.bulletRow}
                                >
                                  <Text style={modalStyles.bulletText}>
                                    {item}
                                  </Text>
                                </View>
                              ))
                            )}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    {/* Performed By */}
                    <View style={modalStyles.sectionCard}>
                      <View style={modalStyles.sectionHeader}>
                        <Text style={modalStyles.sectionHeaderText}>
                          Inspection Performed By
                        </Text>
                      </View>
                      <View style={modalStyles.sectionBody}>
                        <Text style={modalStyles.smallLabel}>
                          Full name (required)
                        </Text>
                        <PaperTextInput
                          value={inspectionPerformedBy}
                          onChangeText={setInspectionPerformedBy}
                          placeholder="e.g., John Smith"
                          mode="outlined"
                          style={[
                            styles.textarea,
                            { minHeight: 44, marginBottom: 0 },
                          ]}
                          theme={{ colors: { outline: "#D1D5DB" } }}
                          autoComplete="name"
                          returnKeyType="done"
                        />
                      </View>
                    </View>

                    {/* Optional Comment */}
                    <View style={modalStyles.sectionCard}>
                      <View
                        style={[
                          modalStyles.sectionHeader,
                          modalStyles.sectionHeaderRow,
                        ]}
                      >
                        <Text style={modalStyles.sectionHeaderText}>
                          Report Any Issues (Optional)
                        </Text>
                        <Text style={modalStyles.hint}>
                          Add notes if needed
                        </Text>
                      </View>
                      <View style={modalStyles.sectionBody}>
                        <PaperTextInput
                          label="Add an explanation..."
                          value={inspectionComment}
                          onChangeText={setInspectionComment}
                          mode="outlined"
                          multiline
                          numberOfLines={4}
                          style={[
                            styles.textarea,
                            { backgroundColor: "white" },
                          ]}
                          theme={{ colors: { outline: "#D1D5DB" } }}
                          returnKeyType="done"
                        />
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={cjStyles.divider} />

                    {/* Time Spent */}
                    <Text
                      style={[modalStyles.sectionTitle, { marginBottom: 12 }]}
                    >
                      Time Spent
                    </Text>
                    <View style={cjStyles.gridTwo}>
                      <View style={cjStyles.rowCenter}>
                        <PaperTextInput
                          value={hoursWorked.toString()}
                          onChangeText={handleSetHoursWorked}
                          style={cjStyles.input}
                          maxLength={2}
                          keyboardType="number-pad"
                        />
                        <Text style={cjStyles.inlineLabel}>hours</Text>
                      </View>
                      <View style={cjStyles.rowCenter}>
                        <PaperTextInput
                          value={minutesWorked.toString()}
                          onChangeText={handleSetMinutesWorked}
                          style={cjStyles.input}
                          maxLength={2}
                          keyboardType="number-pad"
                        />
                        <Text style={cjStyles.inlineLabel}>minutes</Text>
                      </View>
                    </View>

                    <View style={cjStyles.divider} />

                    {/* People count */}
                    <Text
                      style={[modalStyles.sectionTitle, { marginBottom: 10 }]}
                    >
                      How many people worked on this job?
                    </Text>
                    <View style={cjStyles.centerField}>
                      <PaperTextInput
                        value={numberOfPeople.toString()}
                        onChangeText={handleSetNumberOfPeople}
                        style={cjStyles.input}
                        maxLength={2}
                        keyboardType="number-pad"
                      />
                    </View>

                    <View style={cjStyles.divider} />

                    {photosCount === 0 && (
                      <Text style={cjStyles.warningText}>
                        There are no closeout photos for this job.
                      </Text>
                    )}
                  </ScrollView>

                  {/* Fixed stacked footer (matches Initial Inspection) */}
                  <View style={modalStyles.footerStack}>
                    <TouchableOpacity
                      style={[modalStyles.stackButton, modalStyles.stackCancel]}
                      onPress={() => setCompleteJobModalVisible(false)}
                    >
                      <Text style={modalStyles.stackCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        modalStyles.stackButton,
                        modalStyles.stackPrimary,
                      ]}
                      onPress={handleCompleteNothingToReport}
                    >
                      <Text style={modalStyles.stackPrimaryText}>
                        Nothing to Report
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[modalStyles.stackButton, modalStyles.stackDanger]}
                      onPress={handleReportConcern}
                    >
                      <Text style={modalStyles.stackDangerText}>
                        Report Concern or Incident
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </Modal>

      {/* Initial Inspection Job Modal */}
      <Modal
        visible={isInitialInspectionModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          !startJobLoading && setInitialInspectionModalVisible(false)
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
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={{ width: "92%", maxWidth: 520 }}
            keyboardVerticalOffset={Platform.select({ ios: 24, android: 0 })}
          >
            <View style={[modalStyles.sheet]}>
              <View style={modalStyles.headerPad}>
                <Text style={modalStyles.title}>
                  Initial Inspection / Walkthrough
                </Text>
              </View>

              {/* Scrollable content */}
              <ScrollView
                style={modalStyles.body}
                contentContainerStyle={{ paddingBottom: 16 }}
                bounces={false}
                showsVerticalScrollIndicator
              >
                {/* Acknowledgment */}
                <View style={modalStyles.sectionCard}>
                  <View style={modalStyles.sectionHeader}>
                    <Text style={modalStyles.sectionHeaderText}>
                      Acknowledgment
                    </Text>
                  </View>
                  <View style={modalStyles.sectionBody}>
                    <Text style={modalStyles.sectionBodyText}>
                      Initial inspection completed and all pre-existing issues
                      documented in LiveTakeoff with photos and notes (if any).
                    </Text>
                  </View>
                </View>

                {/* Checklist (collapsible) */}
                <View style={modalStyles.sectionCard}>
                  <TouchableOpacity
                    style={[
                      modalStyles.sectionHeader,
                      modalStyles.sectionHeaderRow,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setShowChecklist((v) => !v)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showChecklist }}
                  >
                    <Text style={modalStyles.sectionHeaderText}>
                      Review Checklist
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#6B7280"
                      style={{
                        transform: [
                          { rotate: showChecklist ? "180deg" : "0deg" },
                        ],
                      }}
                    />
                  </TouchableOpacity>

                  {showChecklist && (
                    <View style={[modalStyles.sectionBody, { paddingTop: 12 }]}>
                      <ScrollView
                        style={modalStyles.checklistScroll}
                        contentContainerStyle={{ paddingRight: 4 }}
                        bounces={false}
                        showsVerticalScrollIndicator
                      >
                        {globalInspectionChecklist.length === 0 ? (
                          <Text style={modalStyles.muted}>No items found.</Text>
                        ) : (
                          globalInspectionChecklist.map((item, idx) => (
                            <View
                              key={`${idx}-${item}`}
                              style={modalStyles.bulletRow}
                            >
                              <Text style={modalStyles.bulletText}>{item}</Text>
                            </View>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Performed By */}
                <View style={modalStyles.sectionCard}>
                  <View style={modalStyles.sectionHeader}>
                    <Text style={modalStyles.sectionHeaderText}>
                      Inspection Performed By
                    </Text>
                  </View>
                  <View style={modalStyles.sectionBody}>
                    <Text style={modalStyles.smallLabel}>
                      Full name (required)
                    </Text>
                    <PaperTextInput
                      value={inspectionPerformedBy}
                      onChangeText={setInspectionPerformedBy}
                      placeholder="e.g., John Smith"
                      mode="outlined"
                      style={[
                        styles.textarea,
                        { minHeight: 44, marginBottom: 0 },
                      ]}
                      theme={{ colors: { outline: "#D1D5DB" } }}
                      autoComplete="name"
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Optional Comment */}
                <View style={modalStyles.sectionCard}>
                  <View
                    style={[
                      modalStyles.sectionHeader,
                      modalStyles.sectionHeaderRow,
                    ]}
                  >
                    <Text style={modalStyles.sectionHeaderText}>
                      Report Any Issues (Optional)
                    </Text>
                    <Text style={modalStyles.hint}>Add notes if needed</Text>
                  </View>
                  <View style={modalStyles.sectionBody}>
                    <PaperTextInput
                      label="Add an explanation..."
                      value={inspectionComment}
                      onChangeText={setInspectionComment}
                      mode="outlined"
                      multiline
                      numberOfLines={4}
                      style={[styles.textarea, { backgroundColor: "white" }]}
                      theme={{ colors: { outline: "#D1D5DB" } }}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Fixed footer buttons (always visible) */}
              <View style={modalStyles.footerStack}>
                <TouchableOpacity
                  style={[modalStyles.stackButton, modalStyles.stackCancel]}
                  onPress={() => setInitialInspectionModalVisible(false)}
                >
                  <Text style={modalStyles.stackCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.stackButton, modalStyles.stackPrimary]}
                  onPress={handleNothingToReport}
                >
                  <Text style={modalStyles.stackPrimaryText}>
                    Nothing to Report
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.stackButton, modalStyles.stackDanger]}
                  onPress={handlePreExistingConditionToReport}
                >
                  <Text style={modalStyles.stackDangerText}>
                    Report Pre-existing Condition
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
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
    fontSize: isTablet ? 16 : 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
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
  cardHeader: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // gray-100
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827", // gray-900
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timestamp: {
    color: "#6B7280", // gray-500
  },
  linkButton: {
    borderRadius: 8,
  },
  linkText: {
    color: "#0284C7", // sky-600
    fontWeight: "600",
  },
  serviceName: {
    color: "#111827", // gray-900
    fontWeight: "600",
    marginTop: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D5DB", // gray-100
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
  modalContainerWide: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "92%", // NEW
    maxWidth: 520, // NEW
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
    justifyContent: "center",
    paddingHorizontal: 6,
    marginTop: 2,
  },
  cancelLabel: {
    color: "#EF4444", // Tailwind red-500
    fontSize: 15,
    fontWeight: "500",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    color: "#111827",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#ef4444",
    borderWidth: 1,
    fontWeight: "600",
    fontSize: 15,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    color: "#fff",
  },
  confirmLabel: {
    color: "#111827", // Tailwind gray-900 (black-ish)
    fontWeight: "500",
    fontSize: 14,
  },
  boutlinedButton: {
    backgroundColor: "#fff",
    borderColor: "#D1D5DB", // Tailwind gray-300
    borderWidth: 1,
    flex: 1,
    borderRadius: 8,
  },

  // give each row a subtle container edge so it reads as a "card"
  itemContainer: {
    paddingHorizontal: 6,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },

  // spacer + a faint divider line centered with side margins
  separatorContainer: {
    height: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  separatorLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB", // gray-200
    marginHorizontal: 12,
    borderRadius: 999,
  },

  // (optional) extra bottom padding so last item breathes
  listContent: {
    paddingBottom: 12,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
  },
  sheet: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12, // room for footer shadow/spacing
    maxHeight: Math.min(Dimensions.get("window").height * 0.85, 720),
    // 85% of screen height, capped for large phones/tablets
  },
  headerPad: {
    paddingBottom: 8,
  },
  body: {
    flexGrow: 0,
    // ScrollView gets bounded by sheet maxHeight; content scrolls if too tall
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
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
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionBodyText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  checklistScroll: {
    maxHeight: 224, // ~ max-h-56
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B7280",
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
    marginBottom: 8,
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  // stacked footer buttons
  footerStack: {
    marginTop: 10,
    gap: 10,
  },
  stackButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stackCancel: {
    backgroundColor: "#E5E7EB",
  },
  stackCancelText: {
    color: "#111827",
    fontWeight: "600",
  },
  stackPrimary: {
    backgroundColor: "#EF4444",
  },
  stackPrimaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  stackDanger: {
    backgroundColor: "#B91C1C",
  },
  stackDangerText: {
    color: "#fff",
    fontWeight: "600",
  },
  muted: {
    fontSize: 13,
    color: "#6B7280",
  },
});

const cjStyles = StyleSheet.create({
  title: {
    fontWeight: "500",
    fontSize: 20, // ~ text-xl
    color: "#6B7280",
    textAlign: "center",
  },
  gridTwo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16, // RN supports gap on modern versions; otherwise use margins
    marginTop: 12,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  input: {
    width: 60, // Tailwind w-14 -> 56px
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14, // sm
    backgroundColor: "#FFFFFF",
  },
  inlineLabel: {
    marginTop: 6, // matches the small vertical offset from web
    alignSelf: "center",
    color: "#374151",
    fontSize: 14,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB", // gray-200
    marginVertical: 16,
  },
  centerField: {
    marginTop: 12,
    alignItems: "center",
  },
  warningText: {
    fontSize: 18, // text-lg
    color: "#EF4444", // red-500
    paddingVertical: 8,
    fontWeight: "500",
    textAlign: "center",
  },
});
