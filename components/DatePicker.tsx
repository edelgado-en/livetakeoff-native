import React, { useState } from 'react';
import {
  View,
  Platform,
  Text,
  Pressable,
  StyleSheet,
  I18nManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
};

const DateTimePickerField: React.FC<Props> = ({ label, value, onChange }) => {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const openPicker = () => {
    setMode('date');
    setShow(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }

    if (selectedDate) {
      if (mode === 'date') {
        onChange(selectedDate);
        setMode('time');
        setShow(true);
      } else {
        const fullDate = new Date(value || new Date());
        fullDate.setHours(selectedDate.getHours());
        fullDate.setMinutes(selectedDate.getMinutes());
        onChange(fullDate);
        setShow(false);
        setMode('date');
      }
    }
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return '';
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Floating Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input field */}
      <View style={styles.inputContainer}>
        <Pressable onPress={openPicker} style={styles.input}>
          <Text style={value ? styles.inputText : styles.placeholder}>
            {value ? formatDateTime(value) : 'Select date & time'}
          </Text>
        </Pressable>

        {/* Clear (X) icon */}
        {value && (
          <Pressable onPress={() => onChange(null)} style={styles.clearIcon}>
            <MaterialIcons name="close" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {/* Native Date/Time Picker */}
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant="light"
          accentColor="#EF4444" // red-500 (iOS only)
          textColor={Platform.OS === 'ios' ? '#EF4444' : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#6B7280',
    zIndex: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderColor: '#9CA3AF',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  clearIcon: {
    position: 'absolute',
    right: 10,
    top: 14,
  },
});

export default DateTimePickerField;
