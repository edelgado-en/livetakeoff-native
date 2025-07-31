import { View, Text, StyleSheet, TouchableOpacity,
     ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useContext, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { formatDistanceToNow } from 'date-fns';
import { TextInput } from 'react-native-paper';

import { AuthContext } from '../../../providers/AuthProvider';
import UserAvatar from '../../../components/UserAvatar';
import httpService from '../../../services/httpService';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function JobCommentsScreen() {
  const { jobId } = useLocalSearchParams();
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const scrollViewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [jobId])
  );

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(`/job-comments/${jobId}/`);
      setComments(response.results || []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load comments',
        text2: 'Please try again.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await httpService.post(`/job-comments/${jobId}/`, {
        comment: newComment,
      });
      setComments((prev) => [...prev, response]);
      setNewComment('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to post comment',
        text2: 'Please try again.',
        position: 'top',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../../assets/animations/progress-bar.json')}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { marginLeft: isTablet ? 0 : 7 }]}
              onPress={() => router.push(`/job-details/${jobId}/`)}
            >
              <Ionicons name="arrow-back" size={20} color="#4B5563" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Comments</Text>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.commentsContainer, { paddingBottom: 100 }]}
            keyboardShouldPersistTaps="handled"
          >
            {comments.length === 0 ? (
              <Text style={styles.emptyText}>No comments found. Be the first to comment!</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <UserAvatar avatar={comment.author.profile.avatar} initials={'U'} size={isTablet ? 50 : 40} />
                  <View style={styles.commentContent}>
                    <Text style={styles.author}>{comment.author?.first_name} {comment.author?.last_name}</Text>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                    <Text style={styles.timestamp}>
                      {formatDistanceToNow(new Date(comment.created), { addSuffix: true })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputContainerStatic}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment..."
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
            {newComment.trim().length > 0 && (
              <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: isTablet ? 8 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    borderRadius: 9999,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 8,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsContainer: {
    paddingTop: 16,
    paddingHorizontal: isTablet ? 16 : 8,
    backgroundColor: '#fff',
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  commentContent: {
    marginLeft: 6,
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  commentText: {
    fontSize: 15,
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 16,
  },
  inputContainerStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'white',
  },
  postButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
