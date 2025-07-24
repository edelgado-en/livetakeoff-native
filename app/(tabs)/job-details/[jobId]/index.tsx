// app/(tabs)/job-details/[jobId]/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import httpService from '../../../../services/httpService';

import JobCommentsPreview from '../../../../components/JobCommentsPreview';

const comments = [
  {
    id: 1,
    comment: 'This aircraft has completed 26 flight(s) since its last Exterior Detail. The schedule might change. Please track on FlightAware.',
    created_by: 'Enrique Delgado',
    created_on: 'Mar 28, 2024',
  },
  {
    id: 2,
    comment: 'Checked and confirmed the task completion.',
    created_by: 'Jane Smith',
    created_on: 'Apr 2, 2024',
  },
  {
    id: 3,
    comment: 'Waiting on parts to proceed.',
    created_by: 'John Doe',
    created_on: 'Apr 4, 2024',
  },
  {
    id: 4,
    comment: 'Issue resolved. Ready for review.',
    created_by: 'Alex Johnson',
    created_on: 'Apr 5, 2024',
  },
  {
    id: 5,
    comment: 'Will return tomorrow to finish the job.',
    created_by: 'Maria Garcia',
    created_on: 'Apr 6, 2024',
  },
];

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        <JobCommentsPreview comments={comments} totalComments={23} />

        {/* Cards */}
        {sections.map(({ title, routeSuffix, action }) => (
            <TouchableOpacity
            key={title}
            style={styles.card}
            onPress={() => router.push(`/job-details/${jobId}/${routeSuffix}`)}
            >
            <Text style={styles.cardTitle}>{title}</Text>
            {action && <Text style={styles.cardAction}>{action}</Text>}
            </TouchableOpacity>
        ))}
        </ScrollView>
    </SafeAreaView>
  );
}

const sections = [
  { title: 'Job Info', routeSuffix: 'info', action: 'Edit' },
  { title: 'Services', routeSuffix: 'services', action: 'Edit' },
  { title: 'Pictures', routeSuffix: 'pictures', action: undefined },
  { title: 'Price Breakdown', routeSuffix: 'price', action: 'Edit' },
  { title: 'Attachments', routeSuffix: 'attachments', action: undefined },
  { title: 'Activity', routeSuffix: 'activity', action: 'See more' },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
