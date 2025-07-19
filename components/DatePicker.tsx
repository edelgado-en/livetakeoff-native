import React, { useState } from 'react';
import { View, Button, Platform, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
};

const DatePicker: React.FC<Props> = ({ label, value, onChange }) => {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }

    if (selectedDate) {
      if (mode === 'date') {
        // Show time picker next
        onChange(selectedDate);
        setMode('time');
        setShow(true);
      } else {
        const fullDate = new Date(
          value || new Date()
        );
        fullDate.setHours(selectedDate.getHours());
        fullDate.setMinutes(selectedDate.getMinutes());
        onChange(fullDate);
        setShow(false);
        setMode('date');
      }
    }
  };

  const openPicker = () => {
    setMode('date');
    setShow(true);
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return 'Select date & time';
    return date.toLocaleString(); // You can format this further
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={styles.input}>
        <Text style={styles.inputText}>{formatDateTime(value)}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  input: {
    height: 50,
    borderColor: '#D1D5DB',
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
});

export default DatePicker;