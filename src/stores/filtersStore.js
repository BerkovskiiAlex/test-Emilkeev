/** @format */

import { defineStore } from "pinia";

const today = new Date().toISOString().slice(0, 10);

export const useFiltersStore = defineStore("filters", {
  state: () => ({
    filters: {
      selectedDate: "",
      nm_id: "",
      oblast: "",
      category: "",
      brand: "",
      dateFrom: "",
      dateTo: "",
      nmId: "",
      comparePeriod: "day",
    },
  }),

  actions: {
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },
    resetFilters() {
      this.filters = {
        selectedDate: "",
        nm_id: "",
        oblast: "",
        category: "",
        brand: "",
        dateFrom: "2024-01-01",
        dateTo: today,
        nmId: "",
        comparePeriod: "day",
      };
    },
  },
});
