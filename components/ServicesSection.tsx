import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  const rotationMap = useRef<Record<string, Animated.Value>>({
        interior: new Animated.Value(0),
        exterior: new Animated.Value(0),
        addons: new Animated.Value(0),
    }).current;

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const isExpanding = expandedSection !== section;
    setExpandedSection(isExpanding ? section : null);

    Animated.timing(rotationMap[section], {
        toValue: isExpanding ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
    }).start();
    };

  const renderServiceCard = (item: ServiceItem, section: string) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.card, item.selected && styles.cardSelected]}
      onPress={() => onToggleService(item)}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.cardText, item.selected && styles.cardTextSelected]}>{item.name}</Text>
        {/* {item.selected && <MaterialIcons name="check" size={18} color="#10B981" style={styles.checkIcon} />} */}
        {item.selected && (
            <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={14} color="white" />
            </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const countSelected = (list: ServiceItem[]) => list.filter(s => s.selected).length;

  const renderSectionTitle = (title: string, count: number) => (
    <Text style={styles.sectionTitle}>
      {title}
      {count > 0 && (
        <Text style={styles.selectedCount}> {count} selected</Text>
      )}
    </Text>
  );

  const getChevronRotation = (section: string) => ({
    transform: [
        {
        rotate: rotationMap[section].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        }),
        },
    ],
    });

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.title}>Services</Text>

      {/* Interior */}
      <TouchableOpacity onPress={() => toggleSection('interior')} style={styles.sectionHeader}>
        {renderSectionTitle('Interior', countSelected(interiorServices))}
        <Animated.View style={getChevronRotation('interior')}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color="#9CA3AF"
          />
        </Animated.View>
      </TouchableOpacity>
      {expandedSection === 'interior' && (
        <View style={styles.cardContainer}>
          {interiorServices.map((item) => renderServiceCard(item, 'interior'))}
        </View>
      )}

      {/* Exterior */}
      <TouchableOpacity onPress={() => toggleSection('exterior')} style={styles.sectionHeader}>
        {renderSectionTitle('Exterior', countSelected(exteriorServices))}
        <Animated.View style={getChevronRotation('exterior')}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color="#9CA3AF"
          />
        </Animated.View>
      </TouchableOpacity>
      {expandedSection === 'exterior' && (
        <View style={styles.cardContainer}>
          {exteriorServices.map((item) => renderServiceCard(item, 'exterior'))}
        </View>
      )}

      {/* Add-ons */}
      <TouchableOpacity onPress={() => toggleSection('addons')} style={styles.sectionHeader}>
        {renderSectionTitle('Add-ons', countSelected(otherServices))}
        <Animated.View style={getChevronRotation('addons')}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color="#9CA3AF"
          />
        </Animated.View>
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
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderColor: '#9CA3AF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
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
    width: '100%',
  },
  cardSelected: {
    borderColor: '#10B981', // green-500
    borderWidth: 2,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    flexWrap: 'wrap',
    flexShrink: 1,                 // allow wrapping
    textAlign: 'center',          // center text inside available width
  },
  cardTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  checkIcon: {
    marginLeft: 8,
  },
  checkCircle: {
  backgroundColor: '#10B981',
  borderRadius: 9999,
  padding: 4,
  justifyContent: 'center',
  alignItems: 'center',
}
});

export default ServicesSection;
