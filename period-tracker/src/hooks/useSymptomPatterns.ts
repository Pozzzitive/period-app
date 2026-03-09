import { useMemo } from 'react';
import { useCycleStore, useLogStore, useSettingsStore } from '../stores';
import { useAllSymptoms } from './useAllSymptoms';
import { analyzeSymptomPatterns } from '../engine/pattern-analyzer';
import type { SymptomPattern } from '../engine/pattern-analyzer';

export function useSymptomPatterns(): SymptomPattern[] {
  const cycles = useCycleStore((s) => s.cycles);
  const logs = useLogStore((s) => s.logs);
  const allSymptoms = useAllSymptoms();
  const symptomsConsent = useSettingsStore((s) => s.settings.dataCategories.symptoms);

  return useMemo(() => {
    // Do not process symptom data if consent has been withdrawn
    if (!symptomsConsent) return [];
    const defs = allSymptoms.map((s) => ({ id: s.id, label: s.label, icon: s.icon }));
    return analyzeSymptomPatterns(logs, cycles, defs);
  }, [logs, cycles, allSymptoms, symptomsConsent]);
}
