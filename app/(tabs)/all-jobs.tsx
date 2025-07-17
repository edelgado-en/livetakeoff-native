import { View, Text, StyleSheet } from 'react-native';

export default function AllJobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Jobs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});