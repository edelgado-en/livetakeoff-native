import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function ExteriorServiceRecommendationNotice({ flightCount }: { flightCount?: number }) {
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <MaterialIcons name="error-outline" size={20} color="#ef4444" style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.title}>Exterior Service Recommendation</Text>
        <Text style={styles.message}>
          This aircraft has completed <Text style={styles.count}>{flightCount}</Text>{' '}
          flight(s) since its last Exterior Detail.
        </Text>
      </View>
    </View>
  );
}

// Match the web's service labels, including its case-sensitive Basic Exterior name match.
export function ExteriorServiceRecommendationPills({ service }: {
  service: { name: string; is_exterior_detail_level_2?: boolean };
}) {
  return (
    <>
      {service.name.includes('Basic Exterior') && (
        <View style={[styles.pill, styles.notRecommended]}>
          <Text style={[styles.pillText, styles.notRecommendedText]}>NOT RECOMMENDED</Text>
        </View>
      )}
      {service.is_exterior_detail_level_2 && (
        <View style={[styles.pill, styles.recommended]}>
          <Text style={[styles.pillText, styles.recommendedText]}>RECOMMENDED</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    marginTop: 12, marginBottom: 16,
  },
  icon: { marginTop: 2, flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  title: { color: '#991b1b', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  message: { color: '#b91c1c', fontSize: 14, lineHeight: 20, marginTop: 4 },
  count: { fontWeight: '600' },
  pill: {
    alignSelf: 'center', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.275 },
  notRecommended: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  notRecommendedText: { color: '#b91c1c' },
  recommended: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  recommendedText: { color: '#047857' },
});
