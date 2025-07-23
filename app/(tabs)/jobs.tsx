import { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList,
          Image, TouchableOpacity,
         TextInput, RefreshControl } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { AuthContext } from '../../providers/AuthProvider';

import httpService from '../../services/httpService';

export default function JobsScreen() {
  const { token } = useAuth();
  const { currentUser } = useContext(AuthContext);
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
        const response = await httpService.post('/jobs?page=1&size=50', {
            searchText: searchText,
            status: "All",
            sortField: "requestDate",
            customer: "All",
            airport: "All",
            vendor: "All",
            project_manager: "All",
            tags: [],
            airport_type: "All",
        });
        
        setJobs(response.results || []);
        
        setTotalJobs(response.count || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const onRefresh = useCallback(async () => {
        await fetchJobs();
    }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.title}>LiveTakeoff</Text>
            
            {(currentUser.isAdmin ||
                currentUser.isSuperUser ||
                currentUser.isAccountManager ||
                currentUser.isCustomer ||
                currentUser.isInternalCoordinator) && (
                    <TouchableOpacity style={styles.button} onPress={handleCreateJob}>
                        <Text style={styles.buttonText}>+ New Job</Text>
                    </TouchableOpacity>
                )}
        </View>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Search tails..."
                placeholderTextColor="#9ca3af"
                value={searchText}
                onChangeText={setSearchText}
            />
        </View>

        <View style={{ marginBottom: 10 }}>
            <Text>Open Jobs: {totalJobs}</Text>
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
                    
                    <View style={{ marginTop: 2, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.infoText}>{item.airport.initials}</Text>
                        <Text style={styles.dot}> • </Text>
                        <Text style={styles.infoText}>{item.fbo.name}</Text>
                        <Text style={styles.dot}> • </Text>
                        <Text style={styles.infoText}>{item.aircraftType.name}</Text>
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

                    <View style={styles.section}>
                    <Text style={styles.label}>Arrival</Text>
                        {item.on_site ? (
                            <View style={styles.pillRow}>
                            <View style={[styles.pill, styles.pillGreen]}>
                                <Text style={styles.pillText}>On Site</Text>
                            </View>
                            </View>
                        ) : item.estimatedETA == null ? (
                            <View style={styles.pillRow}>
                            <View style={[styles.pill, styles.pillGray]}>
                                <Text style={styles.pillText}>TBD</Text>
                            </View>
                            </View>
                        ) : (
                            <Text style={styles.dateText}>{item.arrival_formatted_date}</Text>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Departure</Text>
                        {item.estimatedETD == null ? (
                            <View style={styles.pillRow}>
                            <View style={[styles.pill, styles.pillGray]}>
                                <Text style={styles.pillText}>TBD</Text>
                            </View>
                            </View>
                        ) : (
                            <Text style={styles.dateText}>{item.departure_formatted_date}</Text>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Completion</Text>
                        {item.status === 'C' || item.status === 'I' ? (
                            <Text style={styles.dateText}>{item.completion_date}</Text>
                        ) : item.completeBy ? (
                            <Text style={styles.dateText}>{item.complete_before_formatted_date}</Text>
                        ) : (
                            <View style={styles.pillRow}>
                            <View style={[styles.pill, styles.pillGray]}>
                                <Text style={styles.pillText}>TBD</Text>
                            </View>
                            </View>
                        )}
                    </View>

                </View>
            )}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
            ListFooterComponent={
                <View style={{ paddingVertical: 20 }}>
                </View>
            }
            ListEmptyComponent={
                !loading ? (
                    () => (
                        <View style={styles.emptyContainer}>
                        <MaterialIcons name="info-outline" size={32} color="#9CA3AF" />
                        <Text style={styles.emptyTextTitle}>No jobs found</Text>
                        <Text style={styles.emptyText}>Get started by creating a new job.</Text>
                        </View>
                    )
                ) : null
            }
        />
       
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
    fontSize: 28,
    fontWeight: '900', // extra-bold, if available on device
    color: '#DC2626', // Tailwind's red-600
  },
  newJobButton: {
    fontSize: 14,
    color: '#ef4444', // Tailwind's red-500
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderColor: '#9CA3AF',
    borderWidth: 1,
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
    fontSize: 16,
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
    fontSize: 14,
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
row: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 12,
},
emptyContainer: {
  flexGrow: 1, // allows the empty component to fill available space
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 40,
  gap: 12,
  minHeight: 300, // optional, to avoid being too small on some tablets
},
emptyTextTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827', // Tailwind's gray-800
    marginBottom: 4,
},
emptyText: {
  fontSize: 18,
  color: '#6B7280', // gray-500
},
infoText: {
    fontSize: 16,
    color: '#374151', // Tailwind gray-700
    flexShrink: 1,     // Allow text to wrap if needed
  },
  dot: {
    fontSize: 16,
    color: '#9CA3AF', // Tailwind gray-400
    paddingHorizontal: 4,
  },
pillRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

pill: {
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 9999,
  alignSelf: 'flex-start',
  marginLeft: 6
},

pillText: {
  fontSize: 12,
  color: 'white',
  fontWeight: '500',
},

pillGreen: {
  backgroundColor: '#10B981', // Tailwind green-500
},

pillGray: {
  backgroundColor: '#9CA3AF', // Tailwind gray-400
},
});