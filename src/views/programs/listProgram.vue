<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <b-row>
        <!-- Search -->
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-form-input
            v-model="searchQuery"
            type="text"
            placeholder="Cari judul atau link..."
            debounce="500"
            @update:model-value="handleSearchChange"
          />
        </b-col>

        <!-- Category Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Category</label>
          <b-form-select
            v-model="selectedCategory"
            :options="categoryOptions"
            @change="handleCategoryChange"
          >
            <template #first>
              <b-form-select-option value=""
                >All Categories</b-form-select-option
              >
            </template>
          </b-form-select>
        </b-col>

        <!-- Sort Order -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Sort By</label>
          <b-form-select
            v-model="sortOrder"
            :options="sortOrderOptions"
            @change="resetPage"
          />
        </b-col>

        <!-- Sort Direction -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Direction</label>
          <b-form-select
            v-model="sortDir"
            :options="sortDirOptions"
            @change="resetPage"
          />
        </b-col>

        <!-- Clear Filters -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold d-block">&nbsp;</label>
          <b-button
            variant="outline-secondary"
            class="w-100"
            @click="clearFilters"
          >
            <i class="bx bx-x me-1"></i>Clear Filters
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Programs List">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/programs/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Create New Program
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading programs...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading programs: {{ error?.message || "Please try again." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="hasActiveFilters"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
            >
              <span class="text-muted small">Active filters:</span>

              <b-badge
                v-if="selectedCategory"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Category: {{ getCategoryName(selectedCategory) }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="
                    selectedCategory = '';
                    resetPage();
                  "
                ></i>
              </b-badge>

              <b-badge
                v-if="searchQuery"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Search: "{{ searchQuery }}"
                <i
                  class="bx bx-x cursor-pointer"
                  @click="
                    searchQuery = '';
                    resetPage();
                  "
                ></i>
              </b-badge>
            </div>

            <GridJsTable
              id="table-gridjs"
              :key="`${selectedCategory}-${searchQuery}-${currentPage}-${sortOrder}-${sortDir}-${tableKey}`"
              :options="basicTableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Showing page {{ currentPage }} of {{ totalPages }} (Total:
                {{ totalRows }} programs)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Previous"
                next-text="Next"
                align="right"
              />
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted">
                <b-spinner small class="me-1" />Updating...
              </small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useBasicTableOptions } from "./components/data";
import router from "@/router";

const categoryOptions = [
  { value: "1", text: "Masjid & Pondok" },
  { value: "6", text: "Bencana Alam" },
  { value: "8", text: "Sosial & Kemanusiaan" },
];

const sortOrderOptions = [
  { value: "id", text: "ID" },
  { value: "judul", text: "Title" },
  { value: "created_at", text: "Created At" },
  { value: "saldo", text: "Saldo" },
];

const sortDirOptions = [
  { value: "desc", text: "Descending" },
  { value: "asc", text: "Ascending" },
];

const {
  basicTableOptions,
  isLoading,
  isError,
  error,
  isFetching,
  selectedCategory,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  sortOrder,
  sortDir,
  resetPage,
  handleDelete,
  tableKey,
} = useBasicTableOptions();

const hasActiveFilters = computed(
  () => !!(selectedCategory.value || searchQuery.value),
);

const handleCategoryChange = () => resetPage();
const handleSearchChange = () => resetPage();

const clearFilters = () => {
  selectedCategory.value = "";
  searchQuery.value = "";
  sortOrder.value = "id";
  sortDir.value = "desc";
  resetPage();
};

const getCategoryName = (value: string) => {
  return categoryOptions.find((c) => c.value === value)?.text || value;
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );
  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
