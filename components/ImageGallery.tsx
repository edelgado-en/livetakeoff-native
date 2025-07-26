import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

interface ImageObject {
  id: number;
  image: string;
  name: string;
  created_at: string;
  interior: boolean;
  size: number;
  customer_uploaded: boolean;
}

interface Props {
  images: ImageObject[];
}

const ImageGallery: React.FC<Props> = ({ images }) => {
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages = useMemo(
    () => images.map((img) => ({ uri: img.image })),
    [images]
  );

  const openViewer = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pictures found.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 4 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => openViewer(index)}>
            <Image
              source={{ uri: item.image }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      <ImageViewing
        images={galleryImages}
        imageIndex={selectedIndex}
        visible={isViewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        FooterComponent={({ imageIndex }) => (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {imageIndex + 1} / {galleryImages.length}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    width: 180,
    height: 160,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ImageGallery;
