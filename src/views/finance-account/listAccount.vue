<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bx bx-filter-alt me-1"></i>Filter
          </h5>
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
        <b-col cols="12" md="5" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama akun..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Type Filter -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Type</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <option value="">Semua Type</option>
            <option value="D">Debit</option>
            <option value="K">Kredit</option>
          </b-form-select>
        </b-col>

        <!-- Have Child Filter -->
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Have Child</label>
          <b-form-select v-model="selectedHaveChild" @change="resetPage">
            <option value="">Semua</option>
            <option value="Y">Ya (punya sub-akun)</option>
            <option value="N">Tidak</option>
          </b-form-select>
        </b-col>
      </b-row>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="d-flex flex-wrap gap-2 align-items-center"
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
          v-if="selectedType"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Type: {{ selectedType === "D" ? "Debit" : "Kredit" }}
          <i class="bx bx-x cursor-pointer" @click="selectedType = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedHaveChild"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Have Child: {{ selectedHaveChild === "Y" ? "Ya" : "Tidak" }}
          <i class="bx bx-x cursor-pointer" @click="selectedHaveChild = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Akun Keuangan">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/finance-account/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Akun
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading akun keuangan...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading data: {{ error?.message || "Please try again." }}
          </div>

          <div v-else>
            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Showing page {{ currentPage }} of {{ totalPages }} (Total:
                {{ totalRows }} akun)
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
import { useFinanceAccountsTable } from "./components/data";
import { hasPermission } from "@/helpers/permission";
import router from "@/router";

const isCanCreate = hasPermission("finance_akun:create");

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedType,
  selectedHaveChild,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useFinanceAccountsTable();

const hasActiveFilters = computed(
  () => !!(selectedType.value || selectedHaveChild.value || searchQuery.value),
);

const clearFilters = () => {
  selectedType.value = "";
  selectedHaveChild.value = "";
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
    if (id) router.push(`/finance-account/${id}/edit`);
    return;
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
