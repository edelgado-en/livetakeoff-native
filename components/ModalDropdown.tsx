import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput as RNTextInput,
} from 'react-native';
import { Portal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Item {
  id: number;
  name: string;
}

interface Props {
  label: string;
  data: Item[];
  value: number | null;
  onChange: (item: Item) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const ModalDropdown: React.FC<Props> = ({
  label,
  data,
  value,
  onChange,
  searchTerm,
  onSearchTermChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = data.find((item) => item.id === value);

  const handleSelect = (item: Item) => {
    setModalVisible(false);
    onChange(item);
  };

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.floatingLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <Text style={selectedItem ? styles.selectedText : styles.placeholderText}>
          {selectedItem ? selectedItem.name : `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" style={{ position: 'absolute', right: 10, top: 15 }} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <RNTextInput
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchTerm}
            onChangeText={onSearchTermChange}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />

          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: '#9CA3AF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  selectedText: {
    color: '#111827',
    fontSize: 16,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#6B7280',
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  searchInput: {
    height: 44,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
  },
  closeButton: {
  padding: 8,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
},
});

export default ModalDropdown;
