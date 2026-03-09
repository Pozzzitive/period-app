import { useMemo } from 'react';
import { useCycleStore, useLogStore, useSettingsStore } from '../stores';
import { SYMPTOMS } from '../constants/symptoms';
import { MOODS } from '../constants/moods';
import { useCustomSymptomStore } from '../stores/custom-symptom-store';
import { computeAnalytics } from '../engine/analytics-engine';
import type { CycleAnalytics } from '../engine/analytics-engine';

type CycleCountOption = 3 | 6 | 12 | 'all';

export function useAnalytics(cycleCount: CycleCountOption = 'all'): CycleAnalytics | null {
  const cycles = useCycleStore((s) => s.cycles);
  const logs = useLogStore((s) => s.logs);
  const customSymptoms = useCustomSymptomStore((s) => s.customSymptoms);
  const symptomsConsent = useSettingsStore((s) => s.settings.dataCategories.symptoms);

  return useMemo(() => {
    const allSymptomDefs = symptomsConsent
      ? [
          ...SYMPTOMS.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
          ...customSymptoms.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
        ]
      : [];
    const moodDefs = symptomsConsent
      ? MOODS.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))
      : [];

    return computeAnalytics(
      logs,
      cycles,
      allSymptomDefs,
      moodDefs,
      cycleCount === 'all' ? undefined : cycleCount,
    );
  }, [logs, cycles, customSymptoms, cycleCount, symptomsConsent]);
}
