import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { Modal } from "react-native";
import { useRouter } from "expo-router";
import {
  TextInput as PaperTextInput,
  Switch as PaperSwitch,
} from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";

import SimpleMessage from "../components/NotificationMessage";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthContext } from "../providers/AuthProvider";
import UserAvatar from "./UserAvatar";
import httpService from "../services/httpService";

const { width } = Dimensions.get("window");

type Props = {
  jobId: number;
  refreshKey?: number; // optional if you want a default
};

const JobCommentsPreview: React.FC<Props> = ({ jobId, refreshKey }) => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const inputRef = useRef<PaperTextInput>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);

  const [isPublic, setIsPublic] = useState(false);

  const [showNotificationMessage, setShowNotificationMessage] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // "success" | "error" | "info"

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [jobId, refreshKey]);

  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isModalVisible]);

  const fetchComments = async () => {
    try {
      const response = await httpService.get(`/job-comments/${jobId}/`);

      if (response.results && response.results.length > 0) {
        response.results.reverse();
      }

      setComments(response.results || []);
      setTotalComments(response.count || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const saveComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);

    try {
      await httpService.post(`/job-comments/${jobId}/`, {
        comment: newComment,
        isPublic: isPublic,
      });

      setNewComment("");
      setModalVisible(false);
      fetchComments();

      setShowNotificationMessage(true);
      setNotificationMessage("Comment posted!");
      setNotificationType("success");
      setTimeout(() => {
        setShowNotificationMessage(false);
        setNotificationMessage("");
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewComments = comments.slice(0, 5);

  const renderItem = ({ item }: { item: any }) => {
    const { comment, created, author } = item;
    const fullName = `${author?.first_name} ${author?.last_name}`;
    const avatar = author?.profile?.avatar;
    const timeAgo = formatDistanceToNow(new Date(created), { addSuffix: true });

    return (
      <View style={styles.card}>
        <Text style={styles.commentText}>{comment}</Text>
        <View style={styles.footerRow}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.author}>{fullName}</Text>
            <Text style={styles.date}>{timeAgo}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!currentUser) return null;

  return (
    <View>
      <SimpleMessage
        visible={showNotificationMessage}
        text={notificationMessage}
        type={notificationType}
        position="top" // or "bottom"
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
            Comments
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
            {totalComments}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setNewComment("");
            setTimeout(() => setModalVisible(true), 100);
          }}
          style={styles.addButton}
        >
          <Feather name="plus" size={16} color="#3B82F6" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {previewComments.length > 0 ? (
        <FlatList
          data={previewComments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 0 }}
          ItemSeparatorComponent={() => <View style={{ width: 4 }} />}
        />
      ) : (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySubtitle}>No comments found.</Text>
          </View>
        </View>
      )}

      {totalComments > 5 && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/job-details/${jobId}/comments`)}
        >
          <Text style={styles.buttonText}>
            See all {totalComments} comments
          </Text>
          <Feather name="chevron-right" size={18} color="#3B82F6" />
        </TouchableOpacity>
      )}

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Modal content */}
            <GestureHandlerRootView
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={styles.modalContainerWide}>
                {/* --- your existing content unchanged --- */}
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
                      label="Write your comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                      mode="outlined"
                      multiline
                      numberOfLines={5}
                      style={styles.textarea}
                      theme={{ colors: { outline: "#D1D5DB" } }}
                    />
                    {(currentUser.isAdmin ||
                      currentUser.isSuperUser ||
                      currentUser.isAccountManager) && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.toggleRow}
                        onPress={() => setIsPublic((p) => !p)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.toggleLabel}>
                            Make comment public
                          </Text>
                          <Text style={styles.toggleHelp}>
                            Public comments are visible to the customer.
                          </Text>
                        </View>
                        <PaperSwitch
                          value={isPublic}
                          onValueChange={setIsPublic}
                          color="#3B82F6"
                        />
                      </TouchableOpacity>
                    )}
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
                    disabled={!newComment.trim() || loading}
                    style={[
                      styles.postButton,
                      { opacity: !newComment.trim() ? 0.6 : 1 },
                    ]}
                    onPress={() => {
                      if (!newComment.trim()) return;
                      // ★ Ensure one-tap submit even with keyboard up
                      Keyboard.dismiss();
                      requestAnimationFrame(() => {
                        saveComment();
                      });
                    }}
                  >
                    <Text style={styles.postText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GestureHandlerRootView>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Math.min(width * 0.8, 320),
    maxWidth: 310,
    minHeight: 180,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  author: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 32,
  },
  toggleLabel: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  toggleHelp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  buttonText: {
    fontWeight: "500",
    marginRight: 6,
    fontSize: 14,
    color: "#3B82F6",
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
    backgroundColor: "white",
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
  emptyWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 10,
    paddingBottom: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  addButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
    marginLeft: 4,
  },
  modalContainerWide: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "92%", // NEW
    maxWidth: 520, // NEW
  },
});

export default JobCommentsPreview;
