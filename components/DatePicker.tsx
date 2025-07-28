import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Switch,
  Platform,
  ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  showOnSiteToggle?: boolean;
  onSiteValue?: boolean;
  onToggleOnSite?: (val: boolean) => void;
};

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const label = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      options.push(label);
    }
  }
  return options;
};

const DatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  showOnSiteToggle = false,
  onSiteValue = false,
  onToggleOnSite = () => {},
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState('12:00');

  const openPicker = () => {
    if (!onSiteValue) {
      setPickerVisible(true);
      if (value) {
        const isoDate = value.toISOString().split('T')[0];
        const time = value.toTimeString().slice(0, 5);
        setSelectedDate(isoDate);
        setSelectedTime(time);
      } else {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedTime('12:00');
      }
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const date = new Date(selectedDate);
      date.setHours(hour);
      date.setMinutes(minute);
      onChange(date);
    }
    setPickerVisible(false);
  };

  const handleToggleOnSite = (val: boolean) => {
    onToggleOnSite?.(val);
    if (val) onChange(null);
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return '';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Pressable
            onPress={openPicker}
            style={[
              styles.input,
              onSiteValue && { backgroundColor: '#F3F4F6' },
            ]}
          >
            <Text style={value ? styles.inputText : styles.placeholder}>
              {onSiteValue
                ? 'On site — no time required'
                : formatDateTime(value)}
            </Text>
          </Pressable>

          {value && (
            <Pressable
              onPress={() => onChange(null)}
              style={styles.clearIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {showOnSiteToggle && (
          <View style={styles.toggleInline}>
            <Text style={styles.toggleLabel}>On site</Text>
            <Switch
              value={onSiteValue}
              onValueChange={handleToggleOnSite}
              thumbColor={onSiteValue ? '#EF4444' : '#f4f3f4'}
              trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
            />
          </View>
        )}
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate || '']: {
                  selected: true,
                  selectedColor: '#EF4444',
                },
              }}
              theme={{
                backgroundColor: '#1F2937',
                calendarBackground: '#1F2937',
                dayTextColor: '#FFFFFF',
                monthTextColor: '#FFFFFF',
                selectedDayBackgroundColor: '#EF4444',
                selectedDayTextColor: '#FFFFFF',
              }}
            />

            <View style={{ marginTop: 16 }}>
              <Text style={styles.modalLabel}>Select Time</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
              >
                {generateTimeOptions().map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeOption,
                      time === selectedTime && styles.timeOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        time === selectedTime && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleConfirm}>
                <Text style={styles.confirm}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 30 },
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
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrapper: { flex: 1, position: 'relative' },
  input: {
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 36,
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
    zIndex: 2,
  },
  toggleInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  toggleLabel: {
    marginRight: 6,
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#EF4444',
  },
  timeText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  timeTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  confirm: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DatePicker;
