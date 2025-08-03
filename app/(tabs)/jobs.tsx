import { useEffect, useState, useCallback, useContext, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../providers/AuthProvider";

import httpService from "../../services/httpService";

import { cropTextForDevice } from "../../utils/textUtils";
import { useRegisterPushTokenOnce } from "../../hooks/useRegisterPushTokenOnce";

const screenWidth = Dimensions.get("window").width;
const isTablet = screenWidth >= 768; // adjust as needed for your breakpoint

export default function JobsScreen() {
  useRegisterPushTokenOnce();

  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [dueToday, setDueToday] = useState(false);
  const [dueTodayCount, setDueTodayCount] = useState(0);

  const [overdue, setOverdue] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);

  const pageSize = 50;
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");

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

  const handleCreateJob = () => {
    router.push("/create");
  };

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

  useFocusEffect(
    useCallback(() => {
      let didCancel = false;
      const restoreTab = async () => {
        const storedTab = await AsyncStorage.getItem("lastActiveTab");
        const tab =
          storedTab === "open" || storedTab === "completed"
            ? storedTab
            : "open";
        if (!didCancel) {
          setActiveTab(tab);
          setSearchText("");
          setTotalJobs(0);
          setJobs([]);
          setPage(1);
          fetchJobs(tab, 1); // explicitly pass tab and page
        }
      };
      restoreTab();
      return () => {
        didCancel = true;
      };
    }, [])
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchJobs(activeTab, 1);
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [searchText, activeTab]);

  const fetchJobs = async (tabOverride = null, pageOverride = null) => {
    setLoading(true);
    setRefreshing(true);

    const tab = tabOverride || activeTab;
    const currentPage = pageOverride || page;

    try {
      const endpoint =
        tab === "completed"
          ? `/jobs/completed?page=${currentPage}&size=${pageSize}`
          : `/jobs?page=${currentPage}&size=${pageSize}`;

      const response = await httpService.post(endpoint, {
        isMobileRequest: true,
        searchText,
        status: "All",
        sortField: "requestDate",
        customer: "All",
        airport: "All",
        vendor: "All",
        project_manager: "All",
        tags: [],
        airport_type: "All",
      });

      const processedJobs =
        response.results?.map((job) => {
          const uniqueUserIds = [];
          const uniqueUsers = [];

          job.job_service_assignments?.forEach((assignment) => {
            const userId = assignment.project_manager?.id;
            if (userId && !uniqueUserIds.includes(userId)) {
              uniqueUserIds.push(userId);
              uniqueUsers.push(assignment.project_manager);
            }
          });

          job.job_retainer_service_assignments?.forEach((assignment) => {
            const userId = assignment.project_manager?.id;
            if (userId && !uniqueUserIds.includes(userId)) {
              uniqueUserIds.push(userId);
              uniqueUsers.push(assignment.project_manager);
            }
          });

          job.asignees = uniqueUsers;

          const today = new Date();
          const month = today.getMonth() + 1;
          const day = today.getDate();
          const todayFormattedDate = `${month.toString().padStart(2, "0")}/${day
            .toString()
            .padStart(2, "0")}`;
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          job.isDueToday = job.completeBy?.includes(todayFormattedDate);
          job.isOverdue = job.completeByFullDate
            ? new Date(job.completeByFullDate) < yesterday
            : false;

          return job;
        }) ?? [];

      const filteredJobs = processedJobs.filter((job) => {
        if (!dueToday && !overdue) return true;
        if (dueToday && job.isDueToday) return true;
        if (overdue && job.isOverdue) return true;
        return false;
      });

      setJobs(filteredJobs);
      setTotalJobs(response.count || 0);
    } catch (e) {
      console.log(e);
      Toast.show({
        type: "error",
        text1: "Failed to fetch jobs",
        text2: "Please try again.",
        position: "top",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => fetchJobs(), []);

  const handleTabChange = async (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    await AsyncStorage.setItem("lastActiveTab", tab);
    setSearchText("");
    setTotalJobs(0);
    setJobs([]);
    setPage(1);

    fetchJobs(tab, 1); // pass tab and reset to page 1
  };

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => router.push(`/job-details/${item.id}/`)}>
        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.customer.logo }}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.cardTitle, { marginHorizontal: 8 }]}>
              {item.tailNumber}
            </Text>
            <Text style={{ position: "relative", top: 4, color: "#6b7280" }}>
              {cropTextForDevice(item.aircraftType.name)}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={[styles.statusPill, getStatusStyle(item.status)]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>

          {item.comments_count > 0 && (
            <View style={styles.commentBadge}>
              <Text style={styles.commentBadgeText}>{item.comments_count}</Text>
            </View>
          )}

          <View style={{ paddingVertical: 6 }}></View>

          {!currentUser.isCustomer && (
            <View style={styles.section}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.dateText}>
                {cropTextForDevice(item.customer.name)}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Airport:</Text>
            <Text style={styles.dateText}>{item.airport.initials}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>FBO:</Text>
            <Text style={styles.dateText}>{item.fbo.name}</Text>
          </View>

          {activeTab === "open" && (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Arrival:</Text>
                {item.on_site ? (
                  <View style={styles.pillRow}>
                    <View style={[styles.pill, styles.pillGreen]}>
                      <Text style={styles.pillText}>On Site</Text>
                    </View>
                  </View>
                ) : item.estimatedETA == null ? (
                  <View style={styles.pillRow}>
                    <View style={[styles.pill, styles.pillGray]}>
                      <Text style={styles.pillText}>TBD</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.dateText}>
                    {item.arrival_formatted_date}
                  </Text>
                )}
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Departure:</Text>
                {item.estimatedETD == null ? (
                  <View style={styles.pillRow}>
                    <View style={[styles.pill, styles.pillGray]}>
                      <Text style={styles.pillText}>TBD</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.dateText}>
                    {item.departure_formatted_date}
                  </Text>
                )}
              </View>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  {item.isDueToday && (
                    <Text style={styles.dueBadge}>DUE TODAY</Text>
                  )}
                  {item.isOverdue && (
                    <Text style={styles.dueBadge}>OVERDUE</Text>
                  )}

                  {item.tags?.map((tag) => {
                    const tagStyle = getTagStyle(tag.tag_color);
                    return (
                      <View
                        key={tag.id}
                        style={[
                          styles.tag,
                          { borderColor: tagStyle.borderColor },
                        ]}
                      >
                        <Text
                          style={[styles.tagText, { color: tagStyle.color }]}
                        >
                          {tag.tag_short_name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {activeTab === "completed" && (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Completed:</Text>
                <Text style={styles.dateText}>{item.completion_date}</Text>
              </View>
            </>
          )}

          {currentUser.canSeePrice && activeTab === "completed" && (
            <View style={{ position: "absolute", right: 12, bottom: 20 }}>
              <Text>${item.price.toLocaleString()}</Text>
            </View>
          )}

          {(currentUser.isAdmin ||
            currentUser.isSuperUser ||
            currentUser.isAccountManager ||
            currentUser.isInternalCoordinator ||
            currentUser.isMasterPM) &&
            activeTab === "open" &&
            item.asignees?.length > 0 && (
              <View style={styles.assigneeContainer}>
                <View style={styles.avatarRow}>
                  {item.asignees.map((asignee, index) => (
                    <Image
                      key={asignee.username}
                      source={{ uri: asignee.profile.avatar }}
                      style={[
                        styles.avatar,
                        item.asignees.length > 1 && {
                          marginLeft: index === 0 ? 0 : -10,
                        },
                      ]}
                    />
                  ))}
                  {isTablet && item.asignees.length === 1 && (
                    <Text style={styles.username}>
                      {item.asignees[0].profile?.vendor?.name}
                    </Text>
                  )}
                </View>
              </View>
            )}
        </View>
      </TouchableOpacity>
    ),
    [router, activeTab, currentUser]
  );

  const totalPages = Math.ceil(totalJobs / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 15,
          paddingHorizontal: 12,
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", gap: 2 }}>
          {page > 1 && (
            <>
              <Button
                mode="outlined"
                onPress={() => {
                  setPage(1);
                  fetchJobs(activeTab, 1);
                }}
                contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
                labelStyle={{ color: "#374151" }} // Tailwind gray-700
                style={{ borderColor: "#D1D5DB", backgroundColor: "#ffffff" }} // Tailwind gray-300 border
              >
                First
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setPage(page - 1);
                  fetchJobs(activeTab, page - 1);
                }}
                contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
                labelStyle={{ color: "#374151" }}
                style={{ borderColor: "#D1D5DB", backgroundColor: "#ffffff" }}
              >
                Prev
              </Button>
            </>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 2 }}>
          {page < totalPages && (
            <>
              <Button
                mode="outlined"
                onPress={() => {
                  setPage(page + 1);
                  fetchJobs(activeTab, page + 1);
                }}
                contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
                labelStyle={{ color: "#374151" }}
                style={{ borderColor: "#D1D5DB", backgroundColor: "#ffffff" }}
              >
                Next
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setPage(totalPages);
                  fetchJobs(activeTab, totalPages);
                }}
                contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
                labelStyle={{ color: "#374151" }}
                style={{ borderColor: "#D1D5DB", backgroundColor: "#ffffff" }}
              >
                Last
              </Button>
            </>
          )}
        </View>
      </View>
    );
  };

  if (!currentUser || !currentUser.id) {
    // Still loading user — avoid rendering role-based UI
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/progress-bar.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>LiveTakeoff</Text>

          {(currentUser.isAdmin ||
            currentUser.isSuperUser ||
            currentUser.isAccountManager ||
            currentUser.isCustomer ||
            currentUser.isInternalCoordinator) && (
            <TouchableOpacity style={styles.button} onPress={handleCreateJob}>
              <Text style={styles.buttonText}>+ New Job</Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 4,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            disabled={loading}
            style={{
              backgroundColor: activeTab === "open" ? "#10B981" : "#FFFFFF",
              borderWidth: activeTab === "open" ? 0 : 1,
              borderColor: "#D1D5DB",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 24,
              minWidth: 120,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
            onPress={() => handleTabChange("open")}
          >
            <Text
              style={{
                color: activeTab === "open" ? "#FFFFFF" : "#374151",
                fontWeight: activeTab === "open" ? "600" : "500",
                fontSize: 15,
              }}
            >
              Open Jobs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            style={{
              backgroundColor:
                activeTab === "completed" ? "#10B981" : "#FFFFFF",
              borderWidth: activeTab === "completed" ? 0 : 1,
              borderColor: "#D1D5DB",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 24,
              minWidth: 120,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
            onPress={() => handleTabChange("completed")}
          >
            <Text
              style={{
                color: activeTab === "completed" ? "#FFFFFF" : "#374151",
                fontWeight: activeTab === "completed" ? "600" : "500",
                fontSize: 15,
              }}
            >
              Completed Jobs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search tails..."
            placeholderTextColor="#374151"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={{ marginBottom: 10, marginLeft: isTablet ? 0 : 8 }}>
          <Text>
            {totalJobs.toLocaleString("en-US")}{" "}
            {activeTab === "open" ? "Open" : "Completed"} Jobs
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require("../../assets/animations/progress-bar.json")}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {jobs.map((item, index) => (
              <View key={item.id ?? index}>{renderItem({ item })}</View>
            ))}

            {renderPagination()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: isTablet ? 8 : 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900", // extra-bold, if available on device
    color: "#DC2626", // Tailwind's red-600
  },
  newJobButton: {
    fontSize: 14,
    color: "#ef4444", // Tailwind's red-500
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF", // White
    borderRadius: 12,
    borderColor: "#E5E7EB", // Tailwind gray-200
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444", // Tailwind's red-500
  },
  wrapper: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8, // use margin if gap not supported
    alignItems: "flex-start",
  },
  imageContainer: {
    flexShrink: 0,
    position: "relative",
    bottom: 4,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  nameContainer: {
    position: "relative",
    top: 10,
  },
  name: {
    fontSize: 14,
    color: "#1f2937", // Tailwind's gray-800
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 6,
    marginTop: 16,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  button: {
    backgroundColor: "#ef4444", // Tailwind's red-500
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    fontSize: 16,
    fontWeight: "500",
  },
  statusPill: {
    color: "#fff",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
    top: 12,
  },
  section: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  label: {
    fontSize: 14,
    color: "#6b7280", // Tailwind's gray-500
    width: 90,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#d1d5db", // gray-300
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#374151", // gray-700
    marginLeft: 6,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e", // green-500
  },
  dotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f43f5e", // rose-500
  },
  dateText: {
    fontSize: 14,
    color: "#374151", // gray-700
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827", // Tailwind gray-900
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // optional
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)", // optional translucent backdrop
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1, // allows the empty component to fill available space
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
    minHeight: 300, // optional, to avoid being too small on some tablets
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827", // Tailwind's gray-800
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280", // gray-500
  },
  infoText: {
    fontSize: 14,
    color: "#374151", // Tailwind gray-700
    flexShrink: 1, // Allow text to wrap if needed
  },
  dot: {
    fontSize: 14,
    color: "#9CA3AF", // Tailwind gray-400
    paddingHorizontal: 4,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pill: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 9999,
    alignSelf: "flex-start",
    marginLeft: 6,
  },

  pillText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },

  pillGreen: {
    backgroundColor: "#10B981", // Tailwind green-500
  },

  pillGray: {
    backgroundColor: "#9CA3AF", // Tailwind gray-400
  },
  commentBadge: {
    position: "absolute",
    top: 52,
    right: 12,
    backgroundColor: "#EF4444", // Tailwind red-500
    width: 28,
    height: 28,
    borderRadius: 14, // half of width/height
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 0.9 }],
    zIndex: 10,
  },
  statusBadge: {
    position: "absolute",
    top: 4,
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  commentBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  dueBadge: {
    alignSelf: "flex-start",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "#EF4444", // Tailwind red-500
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 6,
    fontWeight: "600",
  },
  assigneeContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    color: "#6B7280", // Tailwind gray-500
    fontSize: 13,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or 'rgba(255,255,255,0.9)' for overlay effect
  },
});
