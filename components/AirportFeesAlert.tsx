import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Fee = {
  type: 'A' | 'B';
  is_percentage: boolean;
  fee: number;
};

type Props = {
  airportFees: Fee[];
};

const AirportFeesAlert: React.FC<Props> = ({ airportFees }) => {
  return (
    <View style={styles.alertContainer}>
      <View style={styles.row}>
        <MaterialIcons name="error-outline" size={20} color="#f87171" style={styles.icon} />
        <View style={styles.content}>
          <Text style={styles.title}>
            Additional fees may apply for services at this airport, including travel fees and commissions.
          </Text>
          <View style={styles.listContainer}>
            {airportFees.map((fee, index) => (
              <Text key={index} style={styles.listItem}>
                {fee.type === 'A' ? 'Travel Fees:' : 'Vendor Price Difference:'}{' '}
                {!fee.is_percentage && '$'}
                {fee.fee}
                {fee.is_percentage && '%'}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: '#fef2f2', // Tailwind red-50
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#991b1b', // Tailwind red-800
  },
  listContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#b91c1c', // Tailwind red-700
    marginBottom: 4,
  },
});

export default AirportFeesAlert;
