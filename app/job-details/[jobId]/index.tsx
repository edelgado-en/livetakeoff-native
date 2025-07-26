// app/(tabs)/job-details/[jobId]/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useContext, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Feather } from '@expo/vector-icons';

import httpService from '../../../services/httpService';

import JobCommentsPreview from '../../../components/JobCommentsPreview';
import InfoTable from '../../../components/job-info';
import ImageGallery from '../../../components/ImageGallery';
import ServiceGallery from '../../../components/ServiceGallery';

import { AuthContext } from '../../../providers/AuthProvider';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768; // Tailwind's md breakpoint

import { cropTextForDevice } from '../../../utils/textUtils';

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([])
  const [totalComments, setTotalComments] = useState(0);

  const [photos, setPhotos] = useState([]);

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

  useEffect(() => {
    if (!jobId) return;
    fetchPhotos();

  }, [jobId])

  const fetchComments = async () => {
    try {
        const response = await httpService.get(`/job-comments/${jobId}/`)

        if (response.results && response.results.length > 0) {
            response.results.reverse();
        }

        setComments(response.results || []);
        setTotalComments(response.count || 0);

    } catch (err) {
        console.error('Failed to fetch comments', err);
    }
  }

  const fetchPhotos = async () => {
    try {
      const response = await httpService.get(`/job-photos/${jobId}/`);
      console.log('Fetched photos:', response);
      // Handle photos if needed
      setPhotos(response.results || []);
    } catch (err) {
      console.error('Failed to fetch photos', err);
    }
  }

  if (loading || !job) {
    return (
        <View style={styles.loadingContainer}>
                <LottieView
                    source={require('../../../assets/animations/progress-bar.json')}
                    autoPlay
                    loop
                    style={{ width: 150, height: 150 }}
                />
            </View>
        );
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
                <Text style={styles.customerName}>{cropTextForDevice(job.customer.name)}</Text>
            </View>

            <Text style={[styles.statusPill, getStatusStyle(job.status)]}>
                {getStatusLabel(job.status)}
            </Text>
        </View>

        {!currentUser.isCustomer && (
            <View style={styles.tagContainer}>
                {job.tags?.map((tag) => {
                    const tagStyle = getTagStyle(tag.tag_color);
                    return (
                        <View
                            key={tag.id}
                            style={[
                            styles.tag,
                            { borderColor: tagStyle.borderColor },
                            ]}
                        >
                            <Text style={[styles.tagText, { color: tagStyle.color }]}>
                            {tag.tag_short_name}
                            </Text>
                        </View>
                    );
                })}
            </View>
        )}

        {/* Job Info */}
        <View
            style={[styles.card,
                     {alignSelf: 'center',
                      width: '100%',
                      maxWidth: isTablet ? 600 : '100%'}]}
        >
            <View style={{flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>Job Info</Text>
                <Text >{job.purchase_order}</Text>
            </View>
            <InfoTable job={job} />
        </View>

        {/* Services */}
        <View
            style={styles.card}
        >
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Services</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 6, position: 'relative', top:1 }}>3</Text>
                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#ffffff',
                            borderWidth: 1,
                            borderColor: '#D1D5DB', // Tailwind gray-300
                            borderRadius: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                            flexDirection: 'row', alignItems: 'center'
                        }}
                    >
                        <Feather name="plus" size={16} color="#3B82F6" />
                        <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500', marginLeft: 4 }}>
                            Add
                        </Text>
                    </TouchableOpacity>
                  </View>

            <ServiceGallery
             services={[
                { id: 1, short_name: 'Exterior Wash', short_description: 'Level 2. Full wash. Wet or dry.' },
                { id: 2, short_name: 'Interior Detail', short_description: 'Leve 2. VIP detail. Full cabin and cockpit' },
                { id: 3, short_name: 'Wax', short_description: 'By hand or machine. Shine on' },
            ]}
            showRemove={true}
            onRemove={(id) => console.log('Remove service with ID:', id)}
            />

        </View>

        <View style={styles.card}>
            <JobCommentsPreview comments={comments} totalComments={totalComments} />
        </View>

        {/* Pictures */}
        <View style={styles.card}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.cardTitle}>Pictures</Text>
            </View>
            <ImageGallery />
        </View>
        </ScrollView>
    </SafeAreaView>
  );
}
  const getTagStyle = (color: string) => {
    const colorStyles = {
      red: { borderColor: '#ef4444', color: '#ef4444' },
      orange: { borderColor: '#f97316', color: '#f97316' },
      amber: { borderColor: '#f59e0b', color: '#f59e0b' },
      indigo: { borderColor: '#6366f1', color: '#6366f1' },
      violet: { borderColor: '#8b5cf6', color: '#8b5cf6' },
      fuchsia: { borderColor: '#d946ef', color: '#d946ef' },
      pink: { borderColor: '#ec4899', color: '#ec4899' },
      slate: { borderColor: '#64748b', color: '#64748b' },
      lime: { borderColor: '#84cc16', color: '#84cc16' },
      emerald: { borderColor: '#10b981', color: '#10b981' },
      cyan: { borderColor: '#06b6d4', color: '#06b6d4' },
      blue: { borderColor: '#3b82f6', color: '#3b82f6' },
    };
    return colorStyles[color] || { borderColor: '#ccc', color: '#fff' };
  };

const styles = StyleSheet.create({
    safe: {
    flex: 1,
  },
    statusPill: {
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    top: 2,
    right: isTablet ? 0 : 4,
  },
  container: {
    paddingTop: 16,
    paddingHorizontal: isTablet ? 8 : 0,
    paddingBottom: 40,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 4
  },
  tag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 8,
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
    marginBottom: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // or 'rgba(255,255,255,0.9)' for overlay effect
  },
});
