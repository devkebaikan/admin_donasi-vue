<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <b-row>
        <!-- Search -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-form-input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama persentase..."
            debounce="500"
            @update:model-value="resetPage"
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
        <UIComponentCard id="basic" title="Daftar Program Persentase">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/percentage/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Persentase
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data persentase...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="searchQuery"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
            >
              <span class="text-muted small">Active filters:</span>
              <b-badge
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
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }} persentase)
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
import { usePercentageTable } from "./data";
import router from "@/router";

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
} = usePercentageTable();

const clearFilters = () => {
  searchQuery.value = "";
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
