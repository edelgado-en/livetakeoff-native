import React, { useState } from 'react';
import {
  View,
  Platform,
  Text,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [show, setShow] = useState(false);

  const openPicker = () => {
    if (!onSiteValue) {
      setMode('date');
      setShow(true);
    }
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
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleToggleOnSite = (val: boolean) => {
    onToggleOnSite?.(val);
    if (val) {
      onChange(null); // Clear value when toggled ON
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {/* Date input with X icon inside */}
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
            <Pressable onPress={() => onChange(null)} style={styles.clearIcon}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* On Site Toggle to the right */}
        {showOnSiteToggle && (
          <View style={styles.toggleInline}>
            <Text style={styles.toggleLabel}>On site</Text>
            <Switch 
                value={onSiteValue}
                onValueChange={handleToggleOnSite}
                thumbColor={onSiteValue ? '#EF4444' : '#f4f3f4'} // red-500 when ON
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }} // gray-300 / red-300    
            />
          </View>
        )}
      </View>

      {show && !onSiteValue && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          accentColor={Platform.OS === 'ios' ? '#EF4444' : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 36, // leave space for the ❌ icon
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
