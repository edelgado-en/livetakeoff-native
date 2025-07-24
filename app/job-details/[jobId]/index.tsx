// app/(tabs)/job-details/[jobId]/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import httpService from '../../../services/httpService';

import JobCommentsPreview from '../../../components/JobCommentsPreview';
import InfoTable from '../../job-info';

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([])
  const [totalComments, setTotalComments] = useState(0);

  const getStatusStyle = (status: string) => {
  switch (status) {
    case 'A':
      return { backgroundColor: '#60a5fa' }; // bg-blue-400
    case 'S':
      return { backgroundColor: '#f59e0b' }; // bg-yellow-500
    case 'U':
      return { backgroundColor: '#6366f1' }; // bg-indigo-500
    case 'W':
    case 'C':
      return { backgroundColor: '#10B981' }; // bg-green-500
    case 'T':
      return { backgroundColor: '#4b5563' }; // bg-gray-600
    case 'R':
      return { backgroundColor: '#8b5cf6' }; // bg-purple-500
    case 'I':
      return { backgroundColor: '#3b82f6' }; // bg-blue-500
    default:
      return { backgroundColor: '#6b7280' }; // default gray
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'A':
      return 'Confirmed';
    case 'S':
      return 'Assigned';
    case 'U':
      return 'Submitted';
    case 'W':
      return 'In Progress';
    case 'C':
      return 'Completed';
    case 'T':
      return 'Canceled';
    case 'R':
      return 'Review';
    case 'I':
      return 'Invoiced';
    default:
      return 'Unknown';
  }
};

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await httpService.get(`/jobs/${jobId}/`);
        setJob(response);
      } catch (err) {
        console.error('Failed to fetch job', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    fetchComments();

  }, [jobId])

  const fetchComments = async () => {
    try {
        const response = await httpService.get(`/job-comments/${jobId}/`)

        setComments(response.results || []);
        setTotalComments(response.count || 0);

    } catch (err) {
        console.error('Failed to fetch comments', err);
    }
  }

  if (loading || !job) {
    return <Text style={styles.loading}>Loading job...</Text>;
  }

  return (
    <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
        {/* Header Row */}
        <View style={styles.header}>
            <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            >
            <Ionicons name="arrow-back" size={20} color="#4B5563" />
            </TouchableOpacity>

            <View style={styles.jobTitleContainer}>
            <Text style={styles.tailNumber}>{job.tailNumber}</Text>
            <Text style={styles.customerName}>{job.customer.name}</Text>
            </View>

            <Text style={[styles.statusPill, getStatusStyle(job.status)]}>
                {getStatusLabel(job.status)}
            </Text>
        </View>

        <JobCommentsPreview comments={comments} totalComments={totalComments} />

        {/* Job Info */}
        <View
            style={styles.card}
            /* onPress={() => router.push(`/job-details/${jobId}/${routeSuffix}`)} */
        >
            <View style={{flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>Job Info</Text>
                <Text >{job.purchase_order}</Text>
            </View>
            <InfoTable />

        </View>

        {/* Services */}
        <TouchableOpacity
            style={styles.card}
            /* onPress={() => router.push(`/job-details/${jobId}/${routeSuffix}`)} */
        >
            <Text style={styles.cardTitle}>Services</Text>
            {/* <Text style={styles.cardAction}>{action}</Text> */}

        </TouchableOpacity>

        {/* Pictures */}
        <TouchableOpacity
            style={styles.card}
        >
            <Text style={styles.cardTitle}>Pictures</Text>
            {/* <Text style={styles.cardAction}>{action}</Text> */}

        </TouchableOpacity>
        
        </ScrollView>
    </SafeAreaView>
  );
}

const sections = [
  { title: 'Job Info', routeSuffix: 'info', action: 'See more' },
  { title: 'Services', routeSuffix: 'services', action: undefined },
  { title: 'Pictures', routeSuffix: 'pictures', action: undefined },
  { title: 'Price Breakdown', routeSuffix: 'price', action: undefined },
  { title: 'Attachments', routeSuffix: 'attachments', action: undefined },
  { title: 'Activity', routeSuffix: 'activity', action: undefined },
];

const infoData = [
  { label: 'Airport', value: 'KTYR/TYR Tyler Pounds Regional Airport' },
  { label: 'FBO', value: 'Jet Center of Tyler TYR' },
  { label: 'Arrival', value: '07/24/25 15:30 LT' },
  { label: 'Departure', value: '07/25/25 17:00 LT' },
];

const styles = StyleSheet.create({
    safe: {
    flex: 1,
  },
    statusPill: {
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    top: 12,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    borderRadius: 9999,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 8,
    marginRight: 10,
  },
  jobTitleContainer: {
    flex: 1,
  },
  tailNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444', // Tailwind's red-500
  },
  customerName: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  cardAction: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  infoContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    padding: 16,
    margin: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    width: 100,
    fontWeight: '600',
    fontSize: 14,
    color: '#374151', // Tailwind gray-700
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563', // Tailwind gray-600
  },
});
