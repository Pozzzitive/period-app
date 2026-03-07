import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { InlineDatePicker } from '@/src/components/common/InlineDatePicker';
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
import { useTheme } from '@/src/theme';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';

export default function CycleInfoScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const { colors } = useTheme();

  const [cycleLength, setCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
  const [periodLength, setPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);
  const [lastPeriodDate, setLastPeriodDate] = useState(subDays(new Date(), 14));


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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}>
        <OnboardingProgress step={0} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>About Your Cycle</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 32 }}>
          This helps us make accurate predictions. You can always adjust later.
        </Text>

        {/* Cycle Length */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Typical cycle length</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 12 }}>
            From the first day of one period to the first day of the next
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <TouchableOpacity
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setCycleLength(Math.max(MIN_CYCLE_LENGTH, cycleLength - 1))}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 22, fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, minWidth: 90, textAlign: 'center' }}>{cycleLength} days</Text>
            <TouchableOpacity
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setCycleLength(Math.min(MAX_CYCLE_LENGTH, cycleLength + 1))}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 22, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Length */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Typical period length</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 12 }}>How many days you usually bleed</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <TouchableOpacity
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setPeriodLength(Math.max(MIN_PERIOD_LENGTH, periodLength - 1))}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 22, fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, minWidth: 90, textAlign: 'center' }}>{periodLength} days</Text>
            <TouchableOpacity
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setPeriodLength(Math.min(MAX_PERIOD_LENGTH, periodLength + 1))}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 22, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Period Date */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 }}>When did your last period start?</Text>
          <InlineDatePicker
            value={lastPeriodDate}
            onChange={setLastPeriodDate}
            maximumDate={new Date()}
            minimumDate={subDays(new Date(), 90)}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        onPress={handleNext}
      >
        <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
