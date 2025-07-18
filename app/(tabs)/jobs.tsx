import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList,
         ActivityIndicator, Image, TouchableOpacity, TextInput } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';

import DotLoader from '../../components/DotLoader';

export default function JobsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);

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
      return { backgroundColor: '#22c55e' }; // bg-green-500
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


  const handleCreateJob = () => {
    router.push('/create');
  };

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

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timeoutID);
    
  }, [token, searchText]);

  const fetchJobs = async () => {
    setLoading(true);
      try {
        const response = await fetch('https://api-livetakeoff.herokuapp.com/api/jobs?page=1&size=50', {
          method: 'POST',
          headers: {
            Authorization: `JWT ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchText: searchText,
            status: "All",
            sortField: "requestDate",
            customer: "All",
            airport: "All",
            vendor: "All",
            project_manager: "All",
            tags: [],
            airport_type: "All"
          })
        });
        const data = await response.json();
        setJobs(data.results || []);
        setTotalJobs(data.count || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Open Jobs</Text>
            <TouchableOpacity style={styles.button} onPress={handleCreateJob}>
                <Text style={styles.buttonText}>+ New Job</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Search jobs..."
                placeholderTextColor="#9ca3af"
                value={searchText}
                onChangeText={setSearchText}
            />
        </View>

        <FlatList
            data={jobs}
            keyExtractor={(job) => job.id.toString()}
            renderItem={({ item }) => (
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{item.tailNumber}</Text>
                    <Text>{item.purchase_order}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={styles.wrapper}>
                        <View style={styles.imageContainer}>
                            <Image
                            source={{ uri: item.customer.logo }}
                            style={styles.logo}
                            resizeMode="cover"
                            />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{item.customer.name}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.statusPill, getStatusStyle(item.status)]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
                
                <View style={{ marginTop: 2  }}>
                    <Text >
                        <Text>{item.airport.initials}</Text>
                        {'  —  '}
                        {item.fbo.name} — {item.aircraftType.name}
                    </Text>
                </View>
                <View style={styles.tagContainer}>
                    {item.tags?.map((tag) => {
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
                {/* Arrival */}
                <View style={styles.section}>
                    <Text style={styles.label}>Arrival</Text>
                    {item.on_site && (
                    <View style={styles.badge}>
                        <View style={styles.dotGreen} />
                        <Text style={styles.badgeText}>On Site</Text>
                    </View>
                    )}
                    {!item.on_site && item.estimatedETA == null && (
                    <View style={styles.badge}>
                        <View style={styles.dotRed} />
                        <Text style={styles.badgeText}>TBD</Text>
                    </View>
                    )}
                    {!item.on_site && item.estimatedETA != null && (
                    <Text style={styles.dateText}>{item.arrival_formatted_date}</Text>
                    )}
                </View>

                {/* Departure */}
                <View style={styles.section}>
                    <Text style={styles.label}>Departure</Text>
                    {item.estimatedETD == null ? (
                    <View style={styles.badge}>
                        <View style={styles.dotRed} />
                        <Text style={styles.badgeText}>TBD</Text>
                    </View>
                    ) : (
                    <Text style={styles.dateText}>{item.departure_formatted_date}</Text>
                    )}
                </View>

                {/* Completion */}
                <View style={styles.section}>
                    {item.status === 'C' || item.status === 'I' ? (
                    <Text style={styles.label}>
                        Completed on <Text style={styles.dateText}>{item.completion_date}</Text>
                    </Text>
                    ) : (
                    <Text style={styles.label}>
                        Complete before{' '}
                        {item.completeBy ? (
                        <Text style={styles.dateText}>{item.complete_before_formatted_date}</Text>
                        ) : (
                        <View style={styles.badge}>
                            <View style={styles.dotRed} />
                            <Text style={styles.badgeText}>TBD</Text>
                        </View>
                        )}
                    </Text>
                    )}
                </View>

            </View>
            )}
        />

        {loading && (
          <View style={styles.loaderOverlay}>
            <DotLoader />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newJobButton: {
    fontSize: 14,
    color: '#ef4444', // Tailwind's red-500
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // for Android shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444', // Tailwind's red-500
  },
  wrapper: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8, // use margin if gap not supported
    alignItems: 'flex-start',
  },
  imageContainer: {
    flexShrink: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameContainer: {
    position: 'relative',
    top: 8,
  },
  name: {
    fontSize: 14,
    color: '#1f2937', // Tailwind's gray-800
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginVertical: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
   button: {
    backgroundColor: '#ef4444', // Tailwind's red-500
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  statusPill: {
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    position: true,
    top: 12,
  },
    section: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    color: '#6b7280', // Tailwind's gray-500
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d5db', // gray-300
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151', // gray-700
    marginLeft: 6,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e', // green-500
  },
  dotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f43f5e', // rose-500
  },
  dateText: {
    fontSize: 14,
    color: '#374151', // gray-700
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Tailwind gray-100
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827', // Tailwind gray-900
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // optional
},
loaderOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255,255,255,0.7)', // optional translucent backdrop
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
});