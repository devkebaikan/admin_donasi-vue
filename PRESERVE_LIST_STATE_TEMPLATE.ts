/**
 * TEMPLATE: Cara menambah useListStatePreserve ke list page
 *
 * Copy-paste template di bawah dan sesuaikan:
 * 1. Ganti "x-list" dengan unique key untuk halaman
 * 2. Ganti { searchQuery, currentPage, perPageItem } dengan refs dari composable Anda
 * 3. Tambahkan filter lain yang ada di page
 */

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Import di atas dengan import lainnya
// ─────────────────────────────────────────────────────────────────────────────
import { useListStatePreserve } from "@/composables/useListStatePreserve";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Tambahkan di script setup, setelah destructuring dari useXTable()
// ─────────────────────────────────────────────────────────────────────────────

// Contoh 1: List dengan 1 filter (selectedStatus)
const { searchQuery, currentPage, perPageItem, selectedStatus, ... } = useXTable();

useListStatePreserve("x-list", {
  searchQuery,
  currentPage,
  perPageItem,
  extraFilters: computed(() => ({
    selectedStatus: selectedStatus.value,
  })),
});

// ─────────────────────────────────────────────────────────────────────────────

// Contoh 2: List dengan 2+ filter (selectedStatus + selectedType)
const {
  searchQuery,
  currentPage,
  perPageItem,
  selectedStatus,
  selectedType,
  ...
} = useXTable();

useListStatePreserve("x-list", {
  searchQuery,
  currentPage,
  perPageItem,
  extraFilters: computed(() => ({
    selectedStatus: selectedStatus.value,
    selectedType: selectedType.value,
  })),
});

// ─────────────────────────────────────────────────────────────────────────────

// Contoh 3: List dengan nested/advanced filter
const {
  searchQuery,
  currentPage,
  perPageItem,
  selectedStatus,
  dateRange,
  ...
} = useXTable();

useListStatePreserve("x-list", {
  searchQuery,
  currentPage,
  perPageItem,
  extraFilters: computed(() => ({
    selectedStatus: selectedStatus.value,
    dateStart: dateRange.value?.[0],
    dateEnd: dateRange.value?.[1],
  })),
});

// ─────────────────────────────────────────────────────────────────────────────
// UNIQUE KEYS REFERENCE
// ─────────────────────────────────────────────────────────────────────────────

/*
List Program              → "programs-list"
List Mitra               → "mitra-list"
List Payment Methods     → "payment-methods-list"
List Transactions        → "transactions-list"
List Projects            → "projects-list"
List Menus               → "menus-list"
List [Your Entity]       → "[entity]-list"
*/
