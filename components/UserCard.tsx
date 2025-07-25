import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

interface Props {
  currentUser: {
    first_name: string;
    last_name: string;
    email?: string;
    avatar: string;
    is_staff?: boolean;
    is_super_user?: boolean;
    is_account_manager?: boolean;
    is_project_manager?: boolean;
    is_internal_coordinator?: boolean;
    customer_name?: string;
  } | null;
}

const UserCard: React.FC<Props> = ({ currentUser }) => {
  const { width } = useWindowDimensions();

  const getBadgeStyle = () => {
    if (currentUser.is_staff || currentUser.is_super_user) {
      return [styles.badge, styles.admin];
    } else if (currentUser.is_account_manager) {
      return [styles.badge, styles.accountManager];
    } else if (currentUser.is_project_manager) {
      return [styles.badge, styles.projectManager];
    } else if (currentUser.is_internal_coordinator) {
      return [styles.badge, styles.coordinator];
    } else if (currentUser.customer_name) {
      return [styles.badge, styles.customer];
    }
    return styles.badge;
  };

  const getRole = () => {
    if (currentUser.is_staff || currentUser.is_super_user) return 'Admin';
    if (currentUser.is_project_manager) return 'P. Manager';
    if (currentUser.is_account_manager) return 'A. Manager';
    if (currentUser.is_internal_coordinator) return 'Coordinator';
    if (currentUser.customer_name) return 'Customer';
    return '';
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {currentUser.first_name} {currentUser.last_name}
        </Text>
        <Text style={styles.email}>
          {currentUser.email || 'No email specified'}
        </Text>
      </View>
      {!!getRole() && (
        <View style={getBadgeStyle()}>
            <Text style={styles.badgeText}>{getRole()}</Text>
        </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom:16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    fontSize: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  admin: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  accountManager: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  projectManager: {
    backgroundColor: '#EDE9FE',
    color: '#5B21B6',
  },
  coordinator: {
    backgroundColor: '#FFEDD5',
    color: '#9A3412',
  },
  customer: {
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
  },
  badgeText: {
  fontSize: 12,
  fontWeight: '500',
},
});

export default UserCard;