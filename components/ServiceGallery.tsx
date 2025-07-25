import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

type Service = {
  id: number;
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
  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.name}>{item.short_name}</Text>
            <Text style={styles.description}>{item.short_description}</Text>
          </View>

          {showRemove && (
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => onRemove?.(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: 6,
  },
  card: {
    width: 270,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom:10
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 12,
    paddingTop: 12,
    alignItems: 'center',
  },
  removeText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ServiceGallery;