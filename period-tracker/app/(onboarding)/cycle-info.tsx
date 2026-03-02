import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserStore, useCycleStore } from '@/src/stores';
import { format, subDays } from 'date-fns';
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  MIN_CYCLE_LENGTH,
  MAX_CYCLE_LENGTH,
  MIN_PERIOD_LENGTH,
  MAX_PERIOD_LENGTH,
} from '@/src/constants/phases';

export default function CycleInfoScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const addPeriod = useCycleStore((s) => s.addPeriod);

  const [cycleLength, setCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
  const [periodLength, setPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);
  const [lastPeriodDate, setLastPeriodDate] = useState(subDays(new Date(), 14));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = () => {
    const dateStr = format(lastPeriodDate, 'yyyy-MM-dd');
    const endDateStr = format(
      subDays(lastPeriodDate, -periodLength + 1),
      'yyyy-MM-dd'
    );

    updateProfile({
      typicalCycleLength: cycleLength,
      typicalPeriodLength: periodLength,
      lastPeriodStartDate: dateStr,
    });

    addPeriod(dateStr, endDateStr);
    router.push('/(onboarding)/age-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About Your Cycle</Text>
        <Text style={styles.subtitle}>
          This helps us make accurate predictions. You can always adjust later.
        </Text>

        {/* Cycle Length */}
        <View style={styles.section}>
          <Text style={styles.label}>Typical cycle length</Text>
          <Text style={styles.hint}>
            From the first day of one period to the first day of the next
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setCycleLength(Math.max(MIN_CYCLE_LENGTH, cycleLength - 1))}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{cycleLength} days</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setCycleLength(Math.min(MAX_CYCLE_LENGTH, cycleLength + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Length */}
        <View style={styles.section}>
          <Text style={styles.label}>Typical period length</Text>
          <Text style={styles.hint}>How many days you usually bleed</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setPeriodLength(Math.max(MIN_PERIOD_LENGTH, periodLength - 1))}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{periodLength} days</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setPeriodLength(Math.min(MAX_PERIOD_LENGTH, periodLength + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Period Date */}
        <View style={styles.section}>
          <Text style={styles.label}>When did your last period start?</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {format(lastPeriodDate, 'MMMM d, yyyy')}
            </Text>
          </TouchableOpacity>
          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={lastPeriodDate}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setLastPeriodDate(date);
              }}
              style={styles.datePicker}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    minWidth: 90,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  datePicker: {
    marginTop: 8,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
