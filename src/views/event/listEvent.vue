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

      <b-row class="g-3">
        <!-- Search -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul, summary, deskripsi..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Status -->
        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedStatus" @change="resetPage">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </b-form-select>
        </b-col>

        <!-- Mode -->
        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Mode</label>
          <b-form-select v-model="selectedMode" @change="resetPage">
            <option value="">Semua Mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </b-form-select>
        </b-col>
      </b-row>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="d-flex flex-wrap gap-2 align-items-center mt-3"
      >
        <span class="text-muted small">Active filters:</span>
        <b-badge
          v-if="searchQuery"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Search: "{{ searchQuery }}"
          <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedStatus"
          variant="info"
          class="d-flex align-items-center gap-1"
        >
          Status: {{ selectedStatus }}
          <i class="bx bx-x cursor-pointer" @click="selectedStatus = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedMode"
          variant="warning"
          class="d-flex align-items-center gap-1"
        >
          Mode: {{ selectedMode }}
          <i class="bx bx-x cursor-pointer" @click="selectedMode = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Event">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/events/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Event
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data event...</p>
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
                {{ totalRows }} event)
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
import { useEventTable } from "./components/data";
import { hasPermission } from "@/helpers/permission";
import router from "@/router";

const isCanCreate = hasPermission("event:create");

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
  selectedStatus,
  selectedMode,
} = useEventTable();

const hasActiveFilters = computed(
  () => !!(searchQuery.value || selectedStatus.value || selectedMode.value),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedMode.value = "";
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
    if (id) router.push(`/events/${id}/edit`);
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
