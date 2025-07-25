import { View, Text, StyleSheet } from 'react-native';
import { cropTextForDevice } from '../utils/textUtils';

export default function InfoTable({ job }: any) {
   
    return (
    <View style={styles.container}>
        <View  style={styles.row}>
          <Text style={styles.label}>Airport</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{cropTextForDevice(job.airport?.name)}</Text>
          </View>
        </View>
        <View  style={styles.row}>
          <Text style={styles.label}>FBO</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{job.fbo?.name}</Text>
          </View>
        </View>
        <View  style={styles.row}>
          <Text style={styles.label}>Arrival</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{job.arrival_formatted_date ? job.arrival_formatted_date : 'Not specified'}</Text>
          </View>
        </View>
        <View  style={styles.row}>
          <Text style={styles.label}>Departure</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{job.departure_formatted_date ? job.departure_formatted_date : 'Not specified'}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', width: '100%' }}>
            <Text style={{ color: '#3B82F6', fontWeight: '500' }}>
                Show more
            </Text>
        </View>
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
    width: 90, // ✅ fixed width based on longest label
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
});