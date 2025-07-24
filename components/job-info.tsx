import { View, Text, StyleSheet, Dimensions } from 'react-native';

const data = [
  { label: 'Airport', value: 'KTYR/TYR Tyler Pounds Regional Airport' },
  { label: 'FBO', value: 'Jet Center of Tyler TYR' },
  { label: 'Arrival', value: '07/24/25 15:30 LT' },
  { label: 'Departure', value: '07/25/25 17:00 LT' },
];

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768; // Tailwind's md breakpoint

export default function InfoTable({ job }: any) {
   
    return (
    <View style={styles.container}>
        <View  style={styles.row}>
          <Text style={styles.label}>Airport</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{job.airport?.name}</Text>
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
            <Text style={{ marginTop: 15, color: '#3B82F6', fontWeight: 600 }}>Show more</Text>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 4,
    alignSelf: 'center',
    width: '100%',
    maxWidth: isTablet ? 500 : '100%', // ✅ constrain width on tablets
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
    maxWidth: '50%',
    paddingVertical: 4,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  value: {
  fontSize: 14,
  color: '#4B5563',
  textAlign: 'right',
  backgroundColor: '#EFF6FF', // Tailwind's blue-50
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#EFF6FF', // Tailwind's blue-50
},
});