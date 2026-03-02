import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import type { FertilityIntent } from '@/src/models';
import { s, fs } from '@/src/utils/scale';

const INTENT_OPTIONS: { value: FertilityIntent; label: string; desc: string }[] = [
  { value: 'none', label: 'Not tracking', desc: 'No fertility notifications' },
  { value: 'conceive', label: 'Trying to conceive', desc: 'Encouraging reminders about fertile window and peak days' },
  { value: 'avoid', label: 'Avoiding pregnancy', desc: 'Cautionary reminders when fertile window opens' },
];

export default function NotificationsSettingsScreen() {
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currentIntent = notifications.fertilityIntent ?? 'none';

  const handleIntentChange = (intent: FertilityIntent) => {
    const fertilityOn = intent !== 'none';
    updateNotifications({
      fertilityIntent: intent,
      fertileWindowOpen: fertilityOn,
      peakFertility: fertilityOn,
      lowFertility: fertilityOn,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        All notifications are local and processed on your device. Nothing is sent to any server.
      </Text>

      <Text style={styles.sectionTitle}>Period</Text>
      <NotifRow
        label="Period reminder"
        desc="5 days before predicted start"
        value={notifications.periodReminder}
        onChange={(val) => updateNotifications({ periodReminder: val })}
        colors={colors}
        styles={styles}
      />
      <NotifRow
        label="Period starting"
        desc="On predicted start day"
        value={notifications.periodStarting}
        onChange={(val) => updateNotifications({ periodStarting: val })}
        colors={colors}
        styles={styles}
      />
      <NotifRow
        label="Premenstrual phase"
        desc="When you enter PMS window"
        value={notifications.premenstrualPhase}
        onChange={(val) => updateNotifications({ premenstrualPhase: val })}
        colors={colors}
        styles={styles}
      />
      <NotifRow
        label="Cycle summary"
        desc="Summary after period ends"
        value={notifications.cycleSummary}
        onChange={(val) => updateNotifications({ cycleSummary: val })}
        colors={colors}
        styles={styles}
      />

      <TeenagerGate>
        <Text style={styles.sectionTitle}>Fertility</Text>
        <FertilityIntentChooser
          selected={currentIntent}
          onSelect={handleIntentChange}
          colors={colors}
          styles={styles}
        />
      </TeenagerGate>

      <Text style={styles.sectionTitle}>Logging</Text>
      <NotifRow
        label="Daily log reminder"
        desc="Remind to log symptoms"
        value={notifications.dailyLogReminder}
        onChange={(val) => updateNotifications({ dailyLogReminder: val })}
        colors={colors}
        styles={styles}
      />

      <Text style={styles.sectionTitle}>Medication</Text>
      <NotifRow
        label="Pill reminder"
        desc="Daily medication reminder"
        value={notifications.pillReminder}
        onChange={(val) => updateNotifications({ pillReminder: val })}
        colors={colors}
        styles={styles}
      />
      <NotifRow
        label="Contraception reminder"
        desc="Patch, ring, or injection"
        value={notifications.contraceptionReminder}
        onChange={(val) => updateNotifications({ contraceptionReminder: val })}
        colors={colors}
        styles={styles}
      />
    </ScrollView>
  );
}

function FertilityIntentChooser({
  selected,
  onSelect,
  colors,
  styles,
}: {
  selected: FertilityIntent;
  onSelect: (intent: FertilityIntent) => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View>
      {INTENT_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.intentRow, isSelected && styles.intentRowSelected]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.intentRadio}>
              {isSelected && <View style={styles.intentRadioInner} />}
            </View>
            <View style={styles.intentText}>
              <Text style={[styles.intentLabel, isSelected && styles.intentLabelSelected]}>
                {option.label}
              </Text>
              <Text style={styles.intentDesc}>{option.desc}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NotifRow({
  label,
  desc,
  value,
  onChange,
  colors,
  styles,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.switchActive }} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  info: {
    fontSize: fs(14),
    color: colors.textSecondary,
    backgroundColor: colors.infoLight,
    padding: s(14),
    borderRadius: s(10),
    marginBottom: s(16),
  },
  sectionTitle: {
    fontSize: fs(13),
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: fs(1),
    marginTop: s(16),
    marginBottom: s(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(6),
  },
  rowText: {
    flex: 1,
    marginRight: s(12),
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.text,
  },
  rowDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
  intentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(6),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intentRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBackground,
  },
  intentRadio: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(14),
  },
  intentRadioInner: {
    width: s(12),
    height: s(12),
    borderRadius: s(6),
    backgroundColor: colors.primary,
  },
  intentText: {
    flex: 1,
  },
  intentLabel: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.text,
  },
  intentLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  intentDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
});
