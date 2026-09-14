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
      <b-col>
        <UIComponentCard id="basic" title="Daftar Program Shows">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/program-show/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Program Show
            </b-button>
          </div>

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
import { hasPermission } from "@/helpers/permission";
import { PROGRAM_SHOW_TYPES } from "@/services/programShowService";
import router from "@/router";

// NOTE: sesuaikan key permission ini dengan yang terdaftar di sistem permission-mu
// (contoh di halaman Image pakai "setting:image")
const isCanCreate = hasPermission("setting:showing");

const activeTab = ref(0);

// Mengikuti AllProgramShowTypes di internal/module/setting/dto/program_show.go
const tabs = [
  ...PROGRAM_SHOW_TYPES.map((t) => ({
    id: `tab-${t.value}`,
    label: t.label,
    type: t.value,
  })),
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

// Set filter ke tab pertama saat halaman pertama kali dibuka,
// supaya data yang tampil konsisten dengan pill yang aktif.
onTabChange(activeTab.value);

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

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/program-show/${id}/edit`);
  }
  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>