import { View,
     Text,
      StyleSheet,
       TouchableOpacity,
 } from 'react-native';
import { cropTextForDevice } from '../utils/textUtils';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

import UserAvatar from './UserAvatar';

export default function InfoTable({ job }: any) {
    const [showMore, setShowMore] = useState(false);
    const { currentUser } = useContext(AuthContext);

      return (
    <View style={styles.container}>
      {/* Always-visible fields */}
      <View style={styles.row}>
        <Text style={styles.label}>Airport</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{cropTextForDevice(job.airport?.name, 30)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>FBO</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{cropTextForDevice(job.fbo?.name, 30)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Arrival</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {job.on_site
                        ? "On site"
                        : job.arrival_formatted_date}
        </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Departure</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{job.departure_formatted_date || 'Not specified'}</Text>
        </View>
      </View>

      {/* Conditionally visible fields */}
      {showMore && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Complete Before</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{job.complete_before_formatted_date || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aircraft</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{job.aircraftType?.name || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer PO</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{job.customer_purchase_order || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requested By</Text>
            <View style={[styles.valueContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                {job.requested_by ? (
                <Text style={styles.valueLight}>
                    {job.requested_by}
                </Text>
                ) : (
                <>
                    <UserAvatar
                        avatar={job.created_by.profile?.avatar}
                        initials={`${job.created_by.first_name[0] ?? ''}${job.created_by.last_name[0] ?? ''}`}
                        size={30}
                    />
                    <Text style={styles.valueLight}>
                        {job.created_by.first_name} {job.created_by.last_name}
                    </Text>
                </>
                )}
            </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Request Date</Text>
                <View style={styles.valueContainer}>
                <Text style={styles.valueLight}>{job.requestDate}</Text>
                </View>
            </View>

            {job.is_publicly_confirmed && (
                <View style={styles.row}>
                    <Text style={styles.label}>Confirmed By</Text>
                    <View style={styles.valueContainer}>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.value}>{job.confirmed_full_name}</Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.value}>{job.confirmed_email}</Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.value}>{job.confirmed_phone_number}</Text>
                        </View>
                    </View>
                </View>
            )}

            {job.follower_emails?.length > 0 &&
              (currentUser.isAdmin ||
                currentUser.isSuperUser ||
                currentUser.isAccountManager ||
                currentUser.isInternalCoordinator) && (
                <View style={styles.row}>
                    <Text style={styles.label}>Follower Emails</Text>
                    <View style={styles.valueContainer}>
                        {job.follower_emails?.map((follower: { id: number; email: string }) => (
                        <View key={follower.id} style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.valueLight}>{follower.email}</Text>
                        </View>
                        ))}
                    </View>
                </View>
                )}
        </>
      )}

      {/* Toggle button */}
        <TouchableOpacity
            onPress={() => setShowMore(!showMore)}
            style={styles.toggleButton}
            activeOpacity={0.7}
        >
            <Text style={styles.toggleText}>
                {showMore ? 'Show less' : 'Show more'}
            </Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 4,
    
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#111827',
    paddingVertical: 4,
    width: 100, // ✅ fixed width based on longest label
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'left',
    backgroundColor: '#EFF6FF', // Tailwind's blue-50
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFF6FF', // Tailwind's blue-50
},
valueLight: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'left',
    paddingVertical: 4,
    paddingHorizontal: 8,
},
bulletPoint: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 4,
},
bullet: {
  fontSize: 16,
  marginRight: 6,
  lineHeight: 20,
  color: '#4B5563',
},
toggleButton: {
  width: '100%',
  paddingVertical: 12,
  alignItems: 'flex-end',
},
toggleText: {
  color: '#3B82F6',
  fontWeight: '500',
  fontSize: 14,
},
});
