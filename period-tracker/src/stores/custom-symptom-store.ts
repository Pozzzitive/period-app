import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import { generateId } from '../utils/ids';

export interface CustomSymptom {
  id: string;
  label: string;
  icon: string;
  category: 'custom';
  createdAt: string;
}

const MAX_CUSTOM_SYMPTOMS = 50;

interface CustomSymptomState {
  customSymptoms: CustomSymptom[];

  addCustomSymptom: (label: string, icon: string) => CustomSymptom | null;
  updateCustomSymptom: (id: string, updates: Partial<Pick<CustomSymptom, 'label' | 'icon'>>) => void;
  deleteCustomSymptom: (id: string) => void;
  clearAll: () => void;
}

export const useCustomSymptomStore = create<CustomSymptomState>()(
  persist(
    (set, get) => ({
      customSymptoms: [],

      addCustomSymptom: (label, icon) => {
        let result: CustomSymptom | null = null;

        // Use set() with callback to atomically check limit + append
        set((state) => {
          if (state.customSymptoms.length >= MAX_CUSTOM_SYMPTOMS) return state;

          const symptom: CustomSymptom = {
            id: `custom_${generateId()}`,
            label,
            icon,
            category: 'custom',
            createdAt: new Date().toISOString(),
          };
          result = symptom;
          return { customSymptoms: [...state.customSymptoms, symptom] };
        });
        return result;
      },

      updateCustomSymptom: (id, updates) => {
        set((state) => ({
          customSymptoms: state.customSymptoms.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteCustomSymptom: (id) => {
        set((state) => ({
          customSymptoms: state.customSymptoms.filter((s) => s.id !== id),
        }));
      },

      clearAll: () => set({ customSymptoms: [] }),
    }),
    {
      name: 'custom-symptom-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
