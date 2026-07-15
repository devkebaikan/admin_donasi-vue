import { defineStore } from "pinia";

interface ListState {
  searchQuery: string;
  currentPage: number;
  perPageItem: number;
  extraFilters: Record<string, any>;
  scrollPos: number;
}

export const useListStateStore = defineStore("listState", {
  state: () => ({
    states: {} as Record<string, ListState>,
  }),

  actions: {
    saveState(key: string, state: ListState) {
      this.states[key] = state;
      sessionStorage.setItem(`list-state-${key}`, JSON.stringify(state));
    },

    getState(key: string): ListState | null {
      // Check Pinia store first
      if (this.states[key]) return this.states[key];

      // Check sessionStorage
      const stored = sessionStorage.getItem(`list-state-${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.states[key] = parsed;
        return parsed;
      }
      return null;
    },

    clearState(key: string) {
      delete this.states[key];
      sessionStorage.removeItem(`list-state-${key}`);
    },
  },
});
