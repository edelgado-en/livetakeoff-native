import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  showOnSiteToggle?: boolean;
  onSiteValue?: boolean;
  onToggleOnSite?: (val: boolean) => void;
};

// ---- Local-time helpers (avoid UTC shifts) ----
const toLocalYMD = (dt: Date) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fromLocalYMDHM = (ymd: string, hour: number, minute: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m as number) - 1, d as number, hour, minute, 0, 0); // LOCAL
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
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const openPicker = () => {
    if (onSiteValue) return;

    setPickerVisible(true);

    if (value) {
      // Use LOCAL date parts from the current value
      setSelectedDate(toLocalYMD(value));
      setSelectedHour(value.getHours());
      setSelectedMinute(value.getMinutes());
    } else {
      const now = new Date();
      setSelectedDate(toLocalYMD(now));
      setSelectedHour(12);
      setSelectedMinute(0);
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      // Build a LOCAL date/time to avoid off-by-one day
      const date = fromLocalYMDHM(selectedDate, selectedHour, selectedMinute);
      onChange(date);
    }
    setPickerVisible(false);
  };

  const handleToggleOnSite = (val: boolean) => {
    onToggleOnSite?.(val);
    if (val) onChange(null);
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24h format
    });
  };

  // Build markedDates only when we have a selectedDate
  const markedDates =
    selectedDate != null
      ? {
          [selectedDate]: {
            selected: true,
            selectedColor: "#EF4444",
          },
        }
      : {};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Pressable
            onPress={openPicker}
            style={[
              styles.input,
              onSiteValue && { backgroundColor: "#F3F4F6" },
            ]}
          >
            <Text style={value ? styles.inputText : styles.placeholder}>
              {onSiteValue
                ? "On site — no time required"
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
              thumbColor={onSiteValue ? "#EF4444" : "#f4f3f4"}
              trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
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
              onDayPress={(day) => setSelectedDate(day.dateString)} // dateString is Y-M-D
              markedDates={markedDates}
              theme={{
                backgroundColor: "#1F2937",
                calendarBackground: "#1F2937",
                dayTextColor: "#FFFFFF",
                monthTextColor: "#FFFFFF",
                selectedDayBackgroundColor: "#EF4444",
                selectedDayTextColor: "#FFFFFF",
              }}
            />

            <View style={{ marginTop: 16 }}>
              <Text style={styles.modalLabel}>Select Time (24-hour)</Text>
              <View style={styles.hmRow}>
                <View style={styles.headerColumn}>
                  <Text style={styles.hmText}>Hour</Text>
                </View>
                <View style={styles.headerColumn}>
                  <Text style={styles.hmText}>Minute</Text>
                </View>
              </View>
              <View style={styles.hmRow}>
                {/* Hours 00–23 */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  style={styles.hmColumn}
                >
                  {[...Array(24).keys()].map((h) => (
                    <Pressable
                      key={`h-${h}`}
                      onPress={() => setSelectedHour(h)}
                      style={[
                        styles.hmItem,
                        selectedHour === h && styles.hmItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hmText,
                          selectedHour === h && styles.hmTextSelected,
                        ]}
                      >
                        {String(h).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Minutes 00–59 */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  style={styles.hmColumn}
                >
                  {[...Array(60).keys()].map((m) => (
                    <Pressable
                      key={`m-${m}`}
                      onPress={() => setSelectedMinute(m)}
                      style={[
                        styles.hmItem,
                        selectedMinute === m && styles.hmItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hmText,
                          selectedMinute === m && styles.hmTextSelected,
                        ]}
                      >
                        {String(m).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
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
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "white",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#6B7280",
    zIndex: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  inputWrapper: { flex: 1, position: "relative" },
  input: {
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 36,
    justifyContent: "center",
    backgroundColor: "white",
  },
  inputText: {
    fontSize: 16,
    color: "#111827",
  },
  placeholder: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  clearIcon: {
    position: "absolute",
    right: 10,
    top: 14,
    zIndex: 2,
  },
  toggleInline: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  toggleLabel: {
    marginRight: 6,
    fontSize: 14,
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  hmRow: {
    flexDirection: "row",
    gap: 12,
  },
  hmColumn: {
    flex: 1,
    maxHeight: 200,
    backgroundColor: "#1F2937",
    borderRadius: 8,
  },
  headerColumn: {
    flex: 1,
    maxHeight: 200,
    alignItems: "center",
    marginBottom: 4,
  },
  hmItem: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  hmItemSelected: {
    backgroundColor: "#EF4444",
  },
  hmText: {
    color: "#D1D5DB",
    fontSize: 16,
  },
  hmTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  cancel: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  confirm: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DatePicker;
