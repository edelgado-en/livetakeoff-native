import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface Priority {
  id: string;
  title: string;
  description: string;
}

interface Props {
  requestPriorities: Priority[];
  selectedPriority: Priority | null;
  onChange: (priority: any) => void;
}

const PriorityRadioGroup: React.FC<Props> = ({
  requestPriorities,
  selectedPriority,
  onChange,
}) => {
    const { width } = useWindowDimensions();
    const numColumns = width < 600 ? 1 : 2;
  
    return (
    <View>
      <Text style={styles.label}>Priority</Text>

      <FlatList
        data={requestPriorities}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        renderItem={({ item, index }) => {
            const checked = selectedPriority?.id === item.id;

            return (
                <TouchableOpacity
                onPress={() => onChange(item)}
                style={[
                    styles.card,
                    checked && styles.cardSelected,
                    numColumns === 1 && index > 0 && { marginTop: 12 }, // vertical space
                ]}
                >
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
                {checked && (
                    <MaterialIcons name="check-circle" size={24} color="#DC2626" />
                )}
                </TouchableOpacity>
            );
            }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#4B5563', // gray-600
    marginBottom: 5,
    marginTop: 18,
    marginLeft: 6
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom:10
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#DC2626', // red-600
    shadowOpacity: 0.2,
    shadowColor: '#DC2626',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default PriorityRadioGroup;