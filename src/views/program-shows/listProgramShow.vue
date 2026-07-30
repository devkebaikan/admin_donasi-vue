<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter</h5>
          <b-button
            v-if="hasActiveFilters"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>Reset Filter
          </b-button>
        </div>
      </template>

      <b-row>
        <!-- Search -->
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari program..."
              debounce="500"
              @update:model-value="resetPage"
          /></b-input-group>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <!-- breadcrumb -->
      <!-- <nav aria-label="breadcrumb" class="d-flex justify-content-end">
        <ol class="breadcrumb mb-0 py-0">
          <li class="breadcrumb-item">
            <a href="javascript:void(0);">Home</a>
          </li>
          <li class="breadcrumb-item">
            <a href="javascript:void(0);">Settings</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Program Shows
          </li>
        </ol>
      </nav> -->
      <b-col>
        <UIComponentCard id="basic" title="Daftar Program Shows">
          <!-- <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/programs/show/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Create New Show
            </b-button>
          </div> -->

          <!-- Type Tabs -->
          <b-tabs
            v-model="activeTab"
            content-class="pt-0 mb-3"
            class="mt-1"
            pills
            @update:model-value="onTabChange"
            nav-wrapper-class="d-flex flex-wrap gap-2"
            justified
          >
            <b-tab v-for="tab in tabs" :key="tab.id" :id="tab.id">
              <template #title>
                <span class="d-none d-sm-block">
                  {{ tab.label }}
                </span>
              </template>
            </b-tab>
          </b-tabs>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading data...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading data: {{ error?.message || "Please try again." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="hasActiveFilters"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
            >
              <span class="text-muted small">Active filters:</span>

              <b-badge
                v-if="selectedType"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Type: {{ selectedType }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="selectedType = ''"
                ></i>
              </b-badge>

              <b-badge
                v-if="searchQuery"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Search: "{{ searchQuery }}"
                <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
              </b-badge>
            </div>

            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Showing page {{ currentPage }} of {{ totalPages }} (Total:
                {{ totalRows }} items)
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
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useProgramShowsTable } from "./components/data";
import router from "@/router";

const activeTab = ref(0);

const tabs = [
  { id: "tab-all", label: "All", type: "" },
  { id: "tab-featured", label: "Featured", type: "featured" },
  { id: "tab-latest", label: "Latest", type: "latest" },
  { id: "tab-popular", label: "Popular", type: "popular" },
  { id: "tab-recommend", label: "Recommend", type: "recommend" },
  { id: "tab-trending", label: "Trending", type: "trending" },
  { id: "tab-special", label: "Special", type: "special" },
  { id: "tab-darurat", label: "Darurat", type: "darurat" },
  { id: "tab-home", label: "Home", type: "home" },
];

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedType,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useProgramShowsTable();

const onTabChange = (index: number) => {
  selectedType.value = tabs[index]?.type ?? "";
  resetPage();
};
const resetTypeTab = () => {
  activeTab.value = 0;
  onTabChange(0);
};

const hasActiveFilters = computed(
  () => !!(selectedType.value || searchQuery.value),
);

const clearFilters = () => {
  selectedType.value = "";
  searchQuery.value = "";
  resetTypeTab();
  resetPage();
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
