import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import { generateId } from '../utils/ids';
import type { DailyLog, FlowIntensity, SymptomEntry, IntercourseEntry } from '../models';

interface LogState {
  logs: Record<string, DailyLog>; // keyed by date string YYYY-MM-DD

  // Actions
  getLog: (date: string) => DailyLog | undefined;
  setFlow: (date: string, flow: FlowIntensity | undefined) => void;
  setSymptoms: (date: string, symptoms: SymptomEntry[]) => void;
  setMoods: (date: string, moods: string[]) => void;
  addIntercourseEntry: (date: string, entry: Omit<IntercourseEntry, 'id' | 'createdAt'>) => void;
  updateIntercourseEntry: (date: string, entryId: string, updates: Partial<IntercourseEntry>) => void;
  removeIntercourseEntry: (date: string, entryId: string) => void;
  clearIntercourseEntries: (date: string) => void;
  setNotes: (date: string, notes: string) => void;
  updateLog: (date: string, updates: Partial<DailyLog>) => void;
  deleteLog: (date: string) => void;
  restoreAll: (logs: Record<string, DailyLog>) => void;
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

      addIntercourseEntry: (date, entry) => {
        set((state) => {
          const log = ensureLog(state.logs, date);
          const newEntry: IntercourseEntry = {
            ...entry,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          const existing = log.intercourse ?? [];
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...log,
                intercourse: [...existing, newEntry],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateIntercourseEntry: (date, entryId, updates) => {
        set((state) => {
          const log = state.logs[date];
          if (!log?.intercourse) return state;
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...log,
                intercourse: log.intercourse.map((e) =>
                  e.id === entryId ? { ...e, ...updates } : e
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeIntercourseEntry: (date, entryId) => {
        set((state) => {
          const log = state.logs[date];
          if (!log?.intercourse) return state;
          const filtered = log.intercourse.filter((e) => e.id !== entryId);
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...log,
                intercourse: filtered.length > 0 ? filtered : undefined,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      clearIntercourseEntries: (date) => {
        set((state) => {
          const log = state.logs[date];
          if (!log) return state;
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...log,
                intercourse: undefined,
                updatedAt: new Date().toISOString(),
              },
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

      restoreAll: (logs) => set({ logs }),

      clearAll: () => set({ logs: {} }),
    }),
    {
      name: 'log-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          const logs = persisted.logs ?? {};
          for (const date of Object.keys(logs)) {
            const old = logs[date].intercourse;
            if (old && typeof old === 'object' && 'logged' in old && old.logged) {
              logs[date].intercourse = [{
                id: generateId(),
                protected: old.protected,
                notes: old.notes,
                createdAt: new Date().toISOString(),
              }];
            } else {
              logs[date].intercourse = undefined;
            }
          }
        }
        return persisted as LogState;
      },
    }
  )
);
