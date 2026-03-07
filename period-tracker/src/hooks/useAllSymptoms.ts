import { useMemo } from 'react';
import { SYMPTOMS } from '../constants/symptoms';
import type { SymptomDefinition } from '../constants/symptoms';
import { useCustomSymptomStore } from '../stores/custom-symptom-store';

export function useAllSymptoms(): SymptomDefinition[] {
  const customSymptoms = useCustomSymptomStore((s) => s.customSymptoms);

  return useMemo(() => {
    const customAsDefs: SymptomDefinition[] = customSymptoms.map((cs) => ({
      id: cs.id,
      label: cs.label,
      icon: cs.icon,
      category: 'custom' as const,
    }));
    return [...SYMPTOMS, ...customAsDefs];
  }, [customSymptoms]);
}
