<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter</h5>
          <b-button
            v-if="searchQuery"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>Reset Filter
          </b-button>
        </div>
      </template>

      <b-row>
        <b-col cols="12" md="5" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan image path atau link..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>
      </b-row>

      <div v-if="searchQuery" class="d-flex flex-wrap gap-2 align-items-center">
        <span class="text-muted small">Active filters:</span>
        <b-badge variant="primary" class="d-flex align-items-center gap-1">
          Search: "{{ searchQuery }}"
          <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Banner">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/banners/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Banner
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data banner...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: {{ error?.message || "Coba lagi." }}
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
                {{ totalRows }} banner)
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
import { onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useSettingBannerTable } from "./components/data";
import { hasPermission } from "@/helpers/permission";
import router from "@/router";

const isCanCreate = hasPermission("setting:banner");

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useSettingBannerTable();

const clearFilters = () => {
  searchQuery.value = "";
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
    if (id) router.push(`/banners/${id}/edit`);
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
