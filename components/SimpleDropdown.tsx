import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function SimpleDropdown({
  options = [], // [{ label: 'Florida', value: 'FL' }, ...]
  selectedValue = null,
  onChange = () => {},
  placeholder = "Select...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === selectedValue);
    return found ? found.label : "";
  }, [options, selectedValue]);

  return (
    <>
      {/* Anchor */}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.input, disabled && styles.inputDisabled]}
      >
        <Text style={[styles.inputText, !selectedLabel && styles.placeholder]}>
          {selectedLabel || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {/* Modal dropdown */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select an option</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item, i) => String(item.value ?? i)}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => {
              const isSelected = item.value === selectedValue;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.row, isSelected && styles.rowSelected]}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      isSelected && styles.rowLabelSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {isSelected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  chevron: {
    marginLeft: 8,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "20%",
    bottom: "20%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  close: {
    color: "#2563EB",
    fontWeight: "600",
  },

  sep: { height: 1, backgroundColor: "#F3F4F6" },

  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  rowSelected: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  rowLabelSelected: {
    fontWeight: "600",
  },
  check: { marginLeft: 8, color: "#10B981", fontWeight: "700" },
});
