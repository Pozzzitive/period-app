import { useMemo } from 'react';
import { useCycleStore, useLogStore } from '../stores';
import { useAllSymptoms } from './useAllSymptoms';
import { analyzeSymptomPatterns } from '../engine/pattern-analyzer';
import type { SymptomPattern } from '../engine/pattern-analyzer';

export function useSymptomPatterns(): SymptomPattern[] {
  const cycles = useCycleStore((s) => s.cycles);
  const logs = useLogStore((s) => s.logs);
  const allSymptoms = useAllSymptoms();

  return useMemo(() => {
    const defs = allSymptoms.map((s) => ({ id: s.id, label: s.label, icon: s.icon }));
    return analyzeSymptomPatterns(logs, cycles, defs);
  }, [logs, cycles, allSymptoms]);
}
