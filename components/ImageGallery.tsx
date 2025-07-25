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

const imageUrls = [
  'https://res.cloudinary.com/datidxeqm/image/upload/v1/media/images/thumbnail_processed-FE0B8961-CF6C-43BF-9127-9958BF0BF32B_igoxfz',
  'https://res.cloudinary.com/datidxeqm/image/upload/v1/media/images/thumbnail_processed-C2E5399E-2844-4135-93E2-766F9970C8D2_zweliv',
  'https://res.cloudinary.com/datidxeqm/image/upload/v1/media/images/thumbnail_processed-D4DC4411-FB4A-4B76-A4F3-9608D3E27C34_yjtf2d',
];

const ImageGallery = () => {
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

 // ✅ Only computed once, avoids triggering re-renders in <ImageViewing />
  const galleryImages = useMemo(
    () => imageUrls.map((url) => ({ uri: url })),
    []
  );

  const openViewer = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };

  return (
    <View>
      {/* Horizontal Thumbnail List */}
      <FlatList
        data={imageUrls}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => openViewer(index)}>
            <Image
              source={{ uri: item }}
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
    borderRadius: 10,
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
});

export default ImageGallery;