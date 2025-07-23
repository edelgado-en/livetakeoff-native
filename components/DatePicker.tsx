import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  Platform
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  showOnSiteToggle?: boolean;
  onSiteValue?: boolean;
  onToggleOnSite?: (val: boolean) => void;
};

const DatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  showOnSiteToggle = false,
  onSiteValue = false,
  onToggleOnSite = () => {},
}) => {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const defaultDate = value || new Date(Date.now() + 3600000); // now + 1 hour

  const openPicker = () => {
    if (!onSiteValue) {
      setMode('date');
      setTempDate(defaultDate);
      setPickerVisible(true);
    }
  };

  const handleConfirm = (selected: Date) => {
    if (mode === 'date') {
      setTempDate(selected);
      setMode('time');
    } else if (tempDate) {
      const updated = new Date(tempDate);
      updated.setHours(selected.getHours());
      updated.setMinutes(selected.getMinutes());
      onChange(updated);
      setPickerVisible(false);
      setMode('date');
    }
  };

  const handleCancel = () => {
    setPickerVisible(false);
    setMode('date');
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 🔧 expands tap area
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

      <DateTimePickerModal
  isVisible={pickerVisible}
  mode={mode}
  date={tempDate || new Date()}
  is24Hour
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  display={Platform.OS === 'ios' ? 'default' : 'calendar'} // ✅ ensures readable text
  confirmTextIOS="Confirm"
  cancelTextIOS="Cancel"
  pickerContainerStyleIOS={{ backgroundColor: '#fff', borderRadius: 16 }}
  modalStyleIOS={{ justifyContent: 'flex-end', margin: 0 }}
/>
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
});

export default DatePicker;