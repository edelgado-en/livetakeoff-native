import React from 'react';
import { View, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, IconButton, Text } from 'react-native-paper';

interface Props {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImagePickerSection: React.FC<Props> = ({ images, setImages }) => {
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (uri: string) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setImages(prev => prev.filter(img => img !== uri)),
      },
    ]);
  };

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.title}>Photos</Text>
      <Button
        mode="outlined"
        icon="image"
        onPress={pickImages}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Select from Gallery
      </Button>
      <Button
        mode="outlined"
        icon="camera"
        onPress={takePhoto}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Take Photo
      </Button>

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
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
    borderColor: '#D1D5DB',
  },
  buttonLabel: {
    fontSize: 14,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 9999,
    zIndex: 1,
  },
});

export default ImagePickerSection;
