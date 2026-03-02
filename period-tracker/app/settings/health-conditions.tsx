import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';

export default function HealthConditionsSettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const addCondition = useUserStore((s) => s.addHealthCondition);
  const removeCondition = useUserStore((s) => s.removeHealthCondition);

  const toggleCondition = (id: string) => {
    if (profile.healthConditions.includes(id)) {
      removeCondition(id);
    } else {
      addCondition(id);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        Tag diagnosed conditions that affect your cycle. This helps show relevant
        symptoms and insights. This data stays on your device.
      </Text>

      {HEALTH_CONDITIONS.map((condition) => {
        const selected = profile.healthConditions.includes(condition.id);
        return (
          <TouchableOpacity
            key={condition.id}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => toggleCondition(condition.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                {condition.label}
              </Text>
              <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
            <Text style={styles.cardDesc}>{condition.description}</Text>
            {selected && (
              <Text style={styles.insight}>{condition.insight}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  info: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardLabelSelected: {
    color: '#E74C3C',
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
  },
  insight: {
    fontSize: 13,
    color: '#2E7D32',
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxChecked: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
