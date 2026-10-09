import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RunHistoryEntry } from "@/types/workflow";

const MAX_ENTRIES = 20;

type HistoryState = {
  entries: RunHistoryEntry[];
  add: (entry: RunHistoryEntry) => void;
  clear: () => void;
};

/** The most recent finished runs, newest first, persisted to localStorage. */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) => set((s) => ({ entries: [entry, ...s.entries].slice(0, MAX_ENTRIES) })),
      clear: () => set({ entries: [] }),
    }),
    { name: "ai-decision-flow:history", version: 1, partialize: ({ entries }) => ({ entries }) },
  ),
);
