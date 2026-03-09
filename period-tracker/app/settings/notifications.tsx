import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSettingsStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { CollapsibleSection } from '@/src/components/common/CollapsibleSection';
import { useTheme } from '@/src/theme';
import type { FertilityIntent, MedicationReminder } from '@/src/models';

const INTENT_OPTIONS: { value: FertilityIntent; label: string; desc: string }[] = [
  { value: 'none', label: 'Not tracking', desc: 'No fertility notifications' },
  { value: 'conceive', label: 'Trying to conceive', desc: 'Encouraging reminders about fertile window and peak days' },
  { value: 'avoid', label: 'Avoiding pregnancy', desc: 'Cautionary reminders when fertile window opens' },
];

export default function NotificationsSettingsScreen() {
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const addMedication = useSettingsStore((s) => s.addMedication);
  const updateMedication = useSettingsStore((s) => s.updateMedication);
  const deleteMedication = useSettingsStore((s) => s.deleteMedication);
  const { colors } = useTheme();

  const medications = notifications.medications ?? [];
  const currentIntent = notifications.fertilityIntent ?? 'none';

  // Period section: derive master toggle and subtitle
  const periodFlags = [
    notifications.periodReminder,
    notifications.periodStarting,
    notifications.premenstrualPhase,
    notifications.cycleSummary,
  ];
  const periodEnabledCount = periodFlags.filter(Boolean).length;
  const periodMasterEnabled = periodEnabledCount > 0;

  const handlePeriodMasterToggle = (val: boolean) => {
    updateNotifications({
      periodReminder: val,
      periodStarting: val,
      premenstrualPhase: val,
      cycleSummary: val,
    });
  };

  // Daily reminders section: derive master toggle and subtitle
  const dailyFlags = [
    notifications.dailyLogReminder,
    notifications.contraceptionReminder,
  ];
  const dailyEnabledCount = dailyFlags.filter(Boolean).length;
  const dailyMasterEnabled = dailyEnabledCount > 0;

  const handleDailyMasterToggle = (val: boolean) => {
    updateNotifications({
      dailyLogReminder: val,
      contraceptionReminder: val,
    });
  };

  // Fertility subtitle
  const fertilitySubtitle = INTENT_OPTIONS.find((o) => o.value === currentIntent)?.label ?? 'Not tracking';

  // Medications subtitle
  const medSubtitle = medications.length === 0
    ? 'None'
    : medications.length === 1
      ? '1 medication'
      : `${medications.length} medications`;

  // Daily reminders subtitle
  const dailyParts: string[] = [];
  if (notifications.dailyLogReminder) dailyParts.push('Log');
  if (notifications.contraceptionReminder) dailyParts.push('Contraception');
  const dailySubtitle = dailyParts.length > 0 ? dailyParts.join(', ') : 'All off';

  const handleIntentChange = (intent: FertilityIntent) => {
    const fertilityOn = intent !== 'none';
    updateNotifications({
      fertilityIntent: intent,
      fertileWindowOpen: fertilityOn,
      peakFertility: fertilityOn,
      lowFertility: fertilityOn,
    });
  };

  const handleAddMedication = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Add Medication',
        'Enter the medication name',
        (name) => {
          if (name?.trim()) {
            useSettingsStore.getState().addMedication(name.trim(), '09:00');
          }
        },
        'plain-text',
        '',
        'default'
      );
    } else {
      setShowAndroidMedInput(true);
    }
  };

  const [showAndroidMedInput, setShowAndroidMedInput] = useState(false);
  const [androidMedName, setAndroidMedName] = useState('');

  const submitAndroidMed = () => {
    if (androidMedName.trim()) {
      addMedication(androidMedName.trim(), '09:00');
      setAndroidMedName('');
    }
    setShowAndroidMedInput(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: colors.textSecondary, backgroundColor: colors.infoLight }} className="text-sm p-3.5 rounded-[10px] mb-4">
        All notifications are local and processed on your device. Nothing is sent to any server.
      </Text>

      {/* -- Privacy -- */}
      <View style={{ backgroundColor: colors.surface }} className="rounded-xl mb-4">
        <View className="flex-row items-center p-4">
          <View className="flex-1 mr-3">
            <Text style={{ color: colors.text }} className="text-base font-medium">Discreet notifications</Text>
            <Text style={{ color: colors.textTertiary }} className="text-[13px] mt-0.5">
              {notifications.discreetNotifications !== false
                ? 'Generic text — no health details visible on lock screen'
                : 'Detailed — notification text includes health information'}
            </Text>
          </View>
          <Switch
            value={notifications.discreetNotifications !== false}
            onValueChange={(val) => updateNotifications({ discreetNotifications: val })}
            trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          />
        </View>
      </View>

      {/* -- Period section -- */}
      <CollapsibleSection
        title="Period"
        subtitle={`${periodEnabledCount} of 4 enabled`}
        enabled={periodMasterEnabled}
        onToggle={handlePeriodMasterToggle}
      >
        <TimePickerRow
          label="Notification time"
          value={notifications.cycleNotificationTime ?? '09:00'}
          onChange={(time) => updateNotifications({ cycleNotificationTime: time })}
        />
        <NotifRow
          label="Period reminder"
          desc="5 days before predicted start"
          value={notifications.periodReminder}
          onChange={(val) => updateNotifications({ periodReminder: val })}
        />
        <NotifRow
          label="Period starting"
          desc="On predicted start day"
          value={notifications.periodStarting}
          onChange={(val) => updateNotifications({ periodStarting: val })}
        />
        <NotifRow
          label="Premenstrual phase"
          desc="When you enter PMS window"
          value={notifications.premenstrualPhase}
          onChange={(val) => updateNotifications({ premenstrualPhase: val })}
        />
        <NotifRow
          label="Cycle summary"
          desc="Summary after period ends"
          value={notifications.cycleSummary}
          onChange={(val) => updateNotifications({ cycleSummary: val })}
        />
      </CollapsibleSection>

      {/* -- Fertility section -- */}
      <TeenagerGate>
        <CollapsibleSection
          title="Fertility"
          subtitle={fertilitySubtitle}
        >
          <FertilityIntentChooser
            selected={currentIntent}
            onSelect={handleIntentChange}
          />
        </CollapsibleSection>
      </TeenagerGate>

      {/* -- Daily Reminders section -- */}
      <CollapsibleSection
        title="Daily Reminders"
        subtitle={dailySubtitle}
        enabled={dailyMasterEnabled}
        onToggle={handleDailyMasterToggle}
      >
        <NotifRow
          label="Daily log reminder"
          desc="Remind to log symptoms"
          value={notifications.dailyLogReminder}
          onChange={(val) => updateNotifications({ dailyLogReminder: val })}
          time={notifications.dailyLogReminderTime ?? '21:00'}
          onTimeChange={(time) => updateNotifications({ dailyLogReminderTime: time })}
        />
        <NotifRow
          label="Contraception reminder"
          desc="Patch, ring, or injection"
          value={notifications.contraceptionReminder}
          onChange={(val) => updateNotifications({ contraceptionReminder: val })}
          time={notifications.contraceptionReminderTime ?? '09:00'}
          onTimeChange={(time) => updateNotifications({ contraceptionReminderTime: time })}
        />
      </CollapsibleSection>

      {/* -- Medications section -- */}
      <CollapsibleSection
        title="Medications"
        subtitle={medSubtitle}
        defaultExpanded
      >
        {medications.map((med) => (
          <MedicationRow
            key={med.id}
            medication={med}
            onToggle={(enabled) => updateMedication(med.id, { enabled })}
            onTimeChange={(time) => updateMedication(med.id, { time })}
            onDelete={() => {
              Alert.alert(
                'Delete Medication',
                `Remove "${med.name}" reminder?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMedication(med.id) },
                ]
              );
            }}
          />
        ))}

        {/* Android inline medication input */}
        {showAndroidMedInput && (
          <View style={{ backgroundColor: colors.surface }} className="flex-row items-center p-3 rounded-xl mb-1.5">
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
              }}
              placeholder="Medication name"
              placeholderTextColor={colors.textMuted}
              value={androidMedName}
              onChangeText={setAndroidMedName}
              onSubmitEditing={submitAndroidMed}
              autoFocus
              returnKeyType="done"
            />
            <TouchableOpacity onPress={submitAndroidMed}>
              <Text style={{ color: colors.primary }} className="font-semibold text-base">Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAndroidMedInput(false)} className="ml-3">
              <Text style={{ color: colors.textTertiary }} className="text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={{ backgroundColor: colors.surface }}
          className="flex-row items-center justify-center p-4 rounded-xl mt-1.5"
          onPress={handleAddMedication}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.primary }} className="font-semibold text-base">+ Add Medication</Text>
        </TouchableOpacity>
      </CollapsibleSection>
    </ScrollView>
  );
}

// -- Sub-components --

function FertilityIntentChooser({
  selected,
  onSelect,
}: {
  selected: FertilityIntent;
  onSelect: (intent: FertilityIntent) => void;
}) {
  const { colors } = useTheme();

  return (
    <View>
      {INTENT_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={{
              backgroundColor: isSelected ? colors.selectedBackground : colors.surface,
              borderColor: isSelected ? colors.primary : 'transparent',
            }}
            className={`flex-row items-center p-4 rounded-xl mb-1.5 border-2`}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={{ borderColor: colors.border }} className={`w-[22px] h-[22px] rounded-full border-2 items-center justify-center mr-3.5`}>
              {isSelected && <View style={{ backgroundColor: colors.primary }} className="w-3 h-3 rounded-full" />}
            </View>
            <View className="flex-1">
              <Text style={{ color: isSelected ? colors.primary : colors.text }} className={`text-base font-medium ${isSelected ? 'font-semibold' : ''}`}>
                {option.label}
              </Text>
              <Text style={{ color: colors.textTertiary }} className="text-[13px] mt-0.5">{option.desc}</Text>
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
  time,
  onTimeChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
  time?: string;        // HH:mm -- if provided, shows inline time picker when enabled
  onTimeChange?: (time: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const showTime = value && time != null && onTimeChange != null;

  const dateValue = React.useMemo(() => {
    if (!time) return new Date();
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [time]);

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate && onTimeChange) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      onTimeChange(`${h}:${m}`);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={{ backgroundColor: colors.surface }} className="rounded-xl mb-1.5">
      <View className="flex-row items-center p-4">
        <View className="flex-1 mr-3">
          <Text style={{ color: colors.text }} className="text-base font-medium">{label}</Text>
          <Text style={{ color: colors.textTertiary }} className="text-[13px] mt-0.5">{desc}</Text>
        </View>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }} thumbColor={value ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'} />
      </View>
      {showTime && (
        <View className="px-4 pb-3 flex-row items-center">
          <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">Time</Text>
          {Platform.OS === 'android' ? (
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={{ color: colors.primary }} className="font-semibold text-sm">{formatTime(time!)}</Text>
            </TouchableOpacity>
          ) : (
            <DateTimePicker
              value={dateValue}
              mode="time"
              display="compact"
              onChange={handleTimeChange}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={dateValue}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
        </View>
      )}
    </View>
  );
}

function TimePickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string; // HH:mm
  onChange: (time: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const [hours, minutes] = value.split(':').map(Number);
  const dateValue = new Date();
  dateValue.setHours(hours, minutes, 0, 0);

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${h}:${m}`);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={{ backgroundColor: colors.surface }} className="px-4 py-3 rounded-xl mb-1.5">
      <View className="flex-row items-center justify-between">
        <Text style={{ color: colors.textSecondary }} className="text-sm">{label}</Text>
        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={{ color: colors.primary }} className="font-semibold text-sm">{formatTime(value)}</Text>
          </TouchableOpacity>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          onChange={handleChange}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      )}
    </View>
  );
}

function MedicationRow({
  medication,
  onToggle,
  onTimeChange,
  onDelete,
}: {
  medication: MedicationReminder;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  onDelete: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  const [hours, minutes] = medication.time.split(':').map(Number);
  const dateValue = new Date();
  dateValue.setHours(hours, minutes, 0, 0);

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      onTimeChange(`${h}:${m}`);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={{ backgroundColor: colors.surface }} className="rounded-xl mb-1.5 overflow-hidden">
      <View className="flex-row items-center p-4">
        <View className="flex-1 mr-3">
          <Text style={{ color: colors.text }} className="text-base font-medium">{medication.name}</Text>
          {Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={{ color: colors.primary }} className="text-sm mt-0.5">{formatTime(medication.time)}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onDelete} className="mr-3">
          <Text style={{ color: colors.destructive }} className="text-sm font-medium">Delete</Text>
        </TouchableOpacity>
        <Switch
          value={medication.enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={medication.enabled ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>
      {medication.enabled && showTimePicker && (
        <View className="px-4 pb-3">
          <DateTimePicker
            value={dateValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={handleTimeChange}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        </View>
      )}
    </View>
  );
}
