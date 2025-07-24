import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
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
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
        Comments 
      </Text>
      <FlatList
        data={previewComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 0 }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>See all {totalComments} comments</Text>
        <Feather name="chevron-right" size={18} color="#3B82F6" />
      </TouchableOpacity>
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
});

export default JobCommentsPreview;
