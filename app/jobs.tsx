import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

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
        console.log(data);
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
    <FlatList
      className="flex-1 bg-white px-4 pt-6"
      data={jobs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="p-4 mb-4 border border-gray-200 rounded-lg">
          <Text className="text-lg font-semibold">{item.tailNumber}</Text>
          <Text className="text-sm text-gray-600">{item.tailNumber}</Text>
        </View>
      )}
    />
  );
}