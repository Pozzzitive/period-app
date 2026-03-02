import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';

export default function HealthConditionsScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Health Conditions</Text>
        <Text style={styles.subtitle}>
          Do you have any diagnosed conditions that affect your cycle? This helps
          us show relevant insights. You can change this anytime in settings.
        </Text>

        {HEALTH_CONDITIONS.map((condition) => {
          const selected = profile.healthConditions.includes(condition.id);
          return (
            <TouchableOpacity
              key={condition.id}
              style={[styles.conditionCard, selected && styles.conditionSelected]}
              onPress={() => toggleCondition(condition.id)}
            >
              <View style={styles.conditionHeader}>
                <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>
                  {condition.label}
                </Text>
                <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <Text style={styles.conditionDesc}>{condition.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/(onboarding)/notifications-setup')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(onboarding)/notifications-setup')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: 24,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  conditionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  conditionSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF0F0',
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  conditionLabelSelected: {
    color: '#E74C3C',
  },
  conditionDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  skipText: {
    color: '#E74C3C',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
