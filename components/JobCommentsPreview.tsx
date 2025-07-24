import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Comment = {
  id: number;
  comment: string;
  created_by: string;
  created_on: string;
};

type Props = {
  comments: Comment[];
  totalComments: number;
};

const JobCommentsPreview: React.FC<Props> = ({ comments, totalComments }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');

    const previewComments = comments.slice(0, 5);

  const renderItem = ({ item }: { item: Comment }) => (
    <View style={styles.card}>
      <Text style={styles.commentText} numberOfLines={5}>
        {item.comment}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.author}>{item.created_by}</Text>
        <Text style={styles.date}>{item.created_on}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Comments</Text>
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
            }}
        >
            <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                Add comment
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
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
      
      {totalComments > 5 && (
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>See all {totalComments} comments</Text>
            <Feather name="chevron-right" size={18} color="#3B82F6" />
        </TouchableOpacity>
        )}

       <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        >
        <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TextInput
                label="Write your comment..."
                value={newComment}
                onChangeText={setNewComment}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={styles.textarea}
            />
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
    marginBottom: 32
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
});

export default JobCommentsPreview;
