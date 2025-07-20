import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

interface ServiceItem {
  id: number;
  name: string;
  selected?: boolean;
}

interface Props {
  interiorServices: ServiceItem[];
  exteriorServices: ServiceItem[];
  otherServices: ServiceItem[];
  onToggleService: (item: ServiceItem) => void;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ServicesSection: React.FC<Props> = ({
  interiorServices,
  exteriorServices,
  otherServices,
  onToggleService,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderServiceCard = (item: ServiceItem, section: string) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.card,
        item.selected && styles.cardSelected,
      ]}
      onPress={() => onToggleService(item)}
    >
      <Text style={[styles.cardText, item.selected && styles.cardTextSelected]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.title}>Services</Text>

      {/* Interior */}
      <TouchableOpacity onPress={() => toggleSection('interior')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Interior</Text>
        <Text style={styles.chevron}>{expandedSection === 'interior' ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expandedSection === 'interior' && (
        <View style={styles.cardContainer}>
          {interiorServices.map((item) => renderServiceCard(item, 'interior'))}
        </View>
      )}

      {/* Exterior */}
      <TouchableOpacity onPress={() => toggleSection('exterior')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Exterior</Text>
        <Text style={styles.chevron}>{expandedSection === 'exterior' ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expandedSection === 'exterior' && (
        <View style={styles.cardContainer}>
          {exteriorServices.map((item) => renderServiceCard(item, 'exterior'))}
        </View>
      )}

      {/* Add-ons */}
      <TouchableOpacity onPress={() => toggleSection('addons')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Add-ons</Text>
        <Text style={styles.chevron}>{expandedSection === 'addons' ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expandedSection === 'addons' && (
        <View style={styles.cardContainer}>
          {otherServices.map((item) => renderServiceCard(item, 'addons'))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#374151',
  },
  chevron: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  card: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  cardSelected: {
    backgroundColor: '#ef4444',
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
  },
  cardTextSelected: {
    color: '#ffffff',
  },
});

export default ServicesSection;
