import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type UserAvatarProps = {
  avatar?: string | null;
  initials: string;
  size?: number; // Optional: to customize avatar size
};

const UserAvatar: React.FC<UserAvatarProps> = ({ avatar, initials, size = 40 }) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return avatar ? (
    <Image source={{ uri: avatar }} style={[styles.avatar, avatarStyle]} />
  ) : (
    <View style={[styles.initialsCircle, avatarStyle]}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E5E7EB', // fallback background while loading
  },
  initialsCircle: {
    backgroundColor: '#D1D5DB', // Tailwind's gray-300
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#374151', // Tailwind's gray-700
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserAvatar;