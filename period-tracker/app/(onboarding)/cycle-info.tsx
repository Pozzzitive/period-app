import React, { useState, useMemo } from 'react';
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
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function CycleInfoScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={lastPeriodDate}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (date) setLastPeriodDate(date);
              }}
              style={styles.datePickerInline}
              accentColor={colors.primary}
            />
          ) : (
            <>
              <Text style={styles.dateSelected}>
                {format(lastPeriodDate, 'MMMM d, yyyy')}
              </Text>
              <TouchableOpacity
                style={styles.dateChangeBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateChangeBtnText}>Change date</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={lastPeriodDate}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setLastPeriodDate(date);
                  }}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s(24),
  },
  content: {
    paddingTop: s(40),
    paddingBottom: s(24),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(15),
    color: colors.textSecondary,
    marginBottom: s(32),
  },
  section: {
    marginBottom: s(28),
  },
  label: {
    fontSize: fs(17),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(4),
  },
  hint: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginBottom: s(12),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(20),
  },
  stepperBtn: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    color: colors.onPrimary,
    fontSize: fs(22),
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: fs(20),
    fontWeight: '600',
    color: colors.text,
    minWidth: s(90),
    textAlign: 'center',
  },
  dateSelected: {
    fontSize: fs(20),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: s(8),
  },
  dateChangeBtn: {
    alignSelf: 'center',
    paddingVertical: s(8),
    paddingHorizontal: s(16),
  },
  dateChangeBtnText: {
    fontSize: fs(15),
    color: colors.primary,
    fontWeight: '500',
  },
  datePickerInline: {
    marginTop: s(8),
    alignSelf: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    marginBottom: s(16),
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
