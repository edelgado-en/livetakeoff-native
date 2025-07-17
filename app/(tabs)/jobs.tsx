import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../hooks/useAuth';

export default function JobsScreen() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('https://api-livetakeoff.herokuapp.com/api/jobs?page=1&size=50', {
          method: 'POST',
          headers: {
            Authorization: `JWT ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchText: "",
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  if (loading) {
    return <ActivityIndicator className="flex-1 justify-center items-center" />;
  }

  return (
     <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Jobs</Text>
        <FlatList
            data={jobs}
            keyExtractor={(job) => job.id.toString()}
            renderItem={({ item }) => (
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{item.tailNumber}</Text>
                    <Text>{item.purchase_order}</Text>
                </View>
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
            </View>
            )}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
});