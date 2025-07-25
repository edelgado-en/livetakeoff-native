import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
   TextInput as RNTextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { AuthContext } from '../providers/AuthProvider';

const { width } = Dimensions.get('window');

import UserAvatar from './UserAvatar';

type Comment = {
  id: number;
  comment: string;
  created: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile: {
      avatar: string;
    };
  };
};

type Props = {
  comments: Comment[];
  totalComments: number;
};

const JobCommentsPreview: React.FC<Props> = ({ comments, totalComments }) => {
    const { currentUser } = useContext(AuthContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const inputRef = useRef<PaperTextInput>(null);
  const [newComment, setNewComment] = useState('');
  const previewComments = comments.slice(0, 5);

  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250); // Slight delay ensures the modal is rendered
    }
  }, [isModalVisible]);

  const renderItem = ({ item }: { item: Comment }) => {
    const { comment, created, author } = item;
    const fullName = `${author?.first_name} ${author?.last_name}`;
    const avatar = author?.profile?.avatar;
    const timeAgo = formatDistanceToNow(new Date(created), { addSuffix: true });

    return (
        <View style={styles.card}>
        <Text style={styles.commentText}>
            {comment}
        </Text>

        <View style={styles.footerRow}>
            <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            />
            <View style={{ marginLeft: 10 }}>
            <Text style={styles.author}>{fullName}</Text>
            <Text style={styles.date}>{timeAgo}</Text>
            </View>
        </View>
        </View>
    );
    };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>Comments</Text>
        <TouchableOpacity
            onPress={() => {
                setNewComment('');
                setModalVisible(true);
            }}
            style={{
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#D1D5DB', // Tailwind gray-300
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: 'row', alignItems: 'center'
            }}
        >
                <Feather name="plus" size={16} color="#3B82F6" />
                <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500', marginLeft: 4 }}>
                    Add
                </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={previewComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 0 }}
        ItemSeparatorComponent={() => <View style={{ width: 4 }} />}
        ListEmptyComponent={() => (
            <View style={styles.emptyWrapper}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No comments found.</Text>
                    <Text style={styles.emptySubtitle}>Be the first to comment!</Text>
                </View>
            </View>
        )}
      />
      
      {totalComments > 5 && (
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>See all {totalComments} comments</Text>
            <Feather name="chevron-right" size={18} color="#3B82F6" />
        </TouchableOpacity>
        )}

       <Modal
        isVisible={isModalVisible}
         backdropOpacity={0.5}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        >
        <View style={styles.modalContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <UserAvatar avatar={currentUser.avatar} initials={currentUser.initials} />
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
                        theme={{ colors: { outline: '#D1D5DB' } }} // Tailwind's gray-300
                    />
                </View>
            </View>
            <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.postButton}
                    onPress={() => {
                    console.log('Post comment:', newComment);
                    setNewComment('');
                    setModalVisible(false);
                    }}
                >
                    <Text style={styles.postText}>Post</Text>
                </TouchableOpacity>
                </View>
            </View>
        </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Math.min(width * 0.8, 320), // limits to 320 on large screens
    maxWidth: 320,
    minHeight: 180,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flexShrink: 1,
  },
  footer: {
    marginTop: 12,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontWeight: '500',
    marginRight: 6,
    fontSize: 14,
    color: '#3B82F6',
  },
  modalContainer: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
  color: '#111827',
},
textarea: {
  marginBottom: 20,
  width: '100%',
  minHeight: 100
},
modalActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
},
cancelButton: {
  marginRight: 16,
  paddingVertical: 8,
  paddingHorizontal: 16,
},
cancelText: {
  color: '#6B7280',
  fontSize: 14,
},
postButton: {
  backgroundColor: '#3B82F6',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
},
postText: {
  color: 'white',
  fontSize: 14,
  fontWeight: '600',
},
emptyWrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
emptyContainer: {
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
},
emptyTitle: {
  fontSize: 16,
  fontWeight: '500',
  color: '#4B5563', // gray-600
},
emptySubtitle: {
  marginTop: 4,
  fontSize: 14,
  color: '#6B7280', // gray-400
  textAlign: 'center',
},
footerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
},
avatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#E5E7EB',
},
});

export default JobCommentsPreview;
