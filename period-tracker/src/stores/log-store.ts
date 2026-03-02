import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import type { DailyLog, FlowIntensity, SymptomEntry, IntercourseEntry } from '../models';

interface LogState {
  logs: Record<string, DailyLog>; // keyed by date string YYYY-MM-DD

  // Actions
  getLog: (date: string) => DailyLog | undefined;
  setFlow: (date: string, flow: FlowIntensity | undefined) => void;
  setSymptoms: (date: string, symptoms: SymptomEntry[]) => void;
  setMoods: (date: string, moods: string[]) => void;
  setIntercourse: (date: string, intercourse: IntercourseEntry | undefined) => void;
  setNotes: (date: string, notes: string) => void;
  updateLog: (date: string, updates: Partial<DailyLog>) => void;
  deleteLog: (date: string) => void;
  clearAll: () => void;
}

function ensureLog(logs: Record<string, DailyLog>, date: string): DailyLog {
  return (
    logs[date] ?? {
      date,
      symptoms: [],
      moods: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: {},

      getLog: (date) => get().logs[date],

      setFlow: (date, flow) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, flow, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      setSymptoms: (date, symptoms) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, symptoms, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      setMoods: (date, moods) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, moods, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      setIntercourse: (date, intercourse) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, intercourse, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      setNotes: (date, notes) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, notes, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      updateLog: (date, updates) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, ...updates, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      deleteLog: (date) => {
        set((state) => {
          const { [date]: _, ...rest } = state.logs;
          return { logs: rest };
        });
      },

      clearAll: () => set({ logs: {} }),
    }),
    {
      name: 'log-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
