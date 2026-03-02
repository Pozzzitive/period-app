import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import type { Period, Cycle } from '../models';
import { generateId } from '../utils/ids';
import { differenceInDays, parseISO } from 'date-fns';

interface CycleState {
  periods: Period[];
  cycles: Cycle[];

  // Actions
  addPeriod: (startDate: string, endDate?: string) => void;
  updatePeriod: (id: string, updates: Partial<Pick<Period, 'startDate' | 'endDate'>>) => void;
  deletePeriod: (id: string) => void;
  endPeriod: (id: string, endDate: string) => void;
  recalculateCycles: () => void;
  clearAll: () => void;
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      periods: [],
      cycles: [],

      addPeriod: (startDate, endDate) => {
        const period: Period = {
          id: generateId(),
          startDate,
          endDate,
        };
        set((state) => ({
          periods: [...state.periods, period].sort(
            (a, b) => a.startDate.localeCompare(b.startDate)
          ),
        }));
        get().recalculateCycles();
      },

      updatePeriod: (id, updates) => {
        set((state) => ({
          periods: state.periods
            .map((p) => (p.id === id ? { ...p, ...updates } : p))
            .sort((a, b) => a.startDate.localeCompare(b.startDate)),
        }));
        get().recalculateCycles();
      },

      deletePeriod: (id) => {
        set((state) => ({
          periods: state.periods.filter((p) => p.id !== id),
        }));
        get().recalculateCycles();
      },

      endPeriod: (id, endDate) => {
        set((state) => ({
          periods: state.periods.map((p) =>
            p.id === id ? { ...p, endDate } : p
          ),
        }));
        get().recalculateCycles();
      },

      recalculateCycles: () => {
        const { periods } = get();
        if (periods.length === 0) {
          set({ cycles: [] });
          return;
        }

        const sorted = [...periods].sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        );

        const cycles: Cycle[] = sorted.map((period, index) => {
          const nextPeriod = sorted[index + 1];
          const periodLength = period.endDate
            ? differenceInDays(parseISO(period.endDate), parseISO(period.startDate)) + 1
            : 5; // default assumption for ongoing period

          const cycleLength = nextPeriod
            ? differenceInDays(parseISO(nextPeriod.startDate), parseISO(period.startDate))
            : undefined;

          const endDate = nextPeriod
            ? nextPeriod.startDate
            : undefined;

          return {
            id: `cycle-${period.id}`,
            startDate: period.startDate,
            endDate,
            periodLength,
            cycleLength,
          };
        });

        set({ cycles });
      },

      clearAll: () => set({ periods: [], cycles: [] }),
    }),
    {
      name: 'cycle-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
