import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Use as a substitute for ExclamationCircleIcon

const HoursOfOperationAlert = ({ hours_of_operation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialIcons name="error-outline" size={20} color="#f87171" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Hours of operation</Text>
          <View style={styles.hoursList}>
              <View  style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{hours_of_operation}</Text>
              </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2', // Tailwind red-50
    borderRadius: 6,
    padding: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#991b1b', // Tailwind red-800
  },
  hoursList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#b91c1c', // Tailwind red-700
    marginRight: 6,
  },
  bulletText: {
    fontSize: 14,
    color: '#b91c1c',
    flex: 1,
  },
});

export default HoursOfOperationAlert;
