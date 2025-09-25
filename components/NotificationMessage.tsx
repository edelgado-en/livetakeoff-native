// SimpleMessage.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SimpleMessage({
  visible,
  text,
  type = "success",
  position = "top",
}) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  const bg =
    type === "error"
      ? "#EF4444"
      : type === "warning"
      ? "#F59E0B"
      : type === "info"
      ? "#0EA5E9"
      : "#10B981";

  const containerPos =
    position === "top"
      ? { top: (insets.top || 0) + 12 }
      : { bottom: (insets.bottom || 0) + 12 };

  const content = (
    <View pointerEvents="none" style={[styles.msgWrap, containerPos]}>
      <View style={[styles.msg, { backgroundColor: bg }]}>
        <Text style={styles.msgText}>{text}</Text>
      </View>
    </View>
  );

  // Portal renders above your whole app (PaperProvider must be at the root)
  return <Portal>{content}</Portal>;
}

const styles = StyleSheet.create({
  msgWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  msg: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  msgText: { color: "white", fontWeight: "700", fontSize: 14 },
});
