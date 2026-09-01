<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">
              <i class="bx bx-filter-alt me-1"></i>
              Filter
            </h5>
          </div>

          <b-button
            v-if="hasActiveFilters"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>
            Reset Filter
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
              placeholder="Cari nama kategori..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Is Utama Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Utama</label>
          <b-form-select v-model="selectedIsUtama" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua</b-form-select-option>
            </template>
            <b-form-select-option value="1">Ya</b-form-select-option>
            <b-form-select-option value="0">Tidak</b-form-select-option>
          </b-form-select>
        </b-col>

        <!-- Is Active Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsActive" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua</b-form-select-option>
            </template>
            <b-form-select-option value="1">Aktif</b-form-select-option>
            <b-form-select-option value="0">Nonaktif</b-form-select-option>
          </b-form-select>
        </b-col>

        <!-- Sort Direction -->
        <!-- <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Direction</label>
          <b-form-select
            v-model="sortDir"
            :options="sortDirOptions"
            @change="resetPage"
          />
        </b-col> -->
      </b-row>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="mb-3 d-flex flex-wrap gap-2 align-items-center"
      >
        <span class="text-muted small">Active filters:</span>

        <b-badge
          v-if="selectedIsUtama !== ''"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Utama: {{ selectedIsUtama === "1" ? "Ya" : "Tidak" }}
          <i class="bx bx-x cursor-pointer" @click="selectedIsUtama = ''"></i>
        </b-badge>

        <b-badge
          v-if="selectedIsActive !== ''"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Status: {{ selectedIsActive === "1" ? "Aktif" : "Nonaktif" }}
          <i class="bx bx-x cursor-pointer" @click="selectedIsActive = ''"></i>
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
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Kategori Program">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/category/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Kategori
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data kategori...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data kategori: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }} kategori)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
                align="right"
              />
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted">
                <b-spinner small class="me-1" />Memperbarui...
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
import { useCategoryTable } from "./data";
import router from "@/router";
import { hasPermission } from "@/helpers/permission";

const isCanCreate = hasPermission("program:create");

const sortDirOptions = [
  { value: "asc", text: "Ascending" },
  { value: "desc", text: "Descending" },
];

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedIsActive,
  selectedIsUtama,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  // sortDir,
  resetPage,
  handleDelete,
} = useCategoryTable();

const hasActiveFilters = computed(
  () =>
    !!(
      selectedIsActive.value !== "" ||
      selectedIsUtama.value !== "" ||
      searchQuery.value
    ),
);

const clearFilters = () => {
  selectedIsActive.value = "";
  selectedIsUtama.value = "";
  searchQuery.value = "";
  // sortDir.value = "asc";
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
    if (id) router.push(`/category/${id}/edit`);
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
