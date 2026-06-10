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
            placeholder="Cari nama, kode, atau tipe..."
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <!-- Tipe Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Tipe</b-form-select-option>
            </template>
            <b-form-select-option value="bank">Bank</b-form-select-option>
            <b-form-select-option value="e_wallet"
              >E-Wallet</b-form-select-option
            >
          </b-form-select>
        </b-col>

        <!-- Status Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsActive" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Status</b-form-select-option>
            </template>
            <b-form-select-option value="true">Aktif</b-form-select-option>
            <b-form-select-option value="false">Nonaktif</b-form-select-option>
          </b-form-select>
        </b-col>

        <!-- Clear Filters -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold d-block">&nbsp;</label>
          <b-button
            variant="outline-secondary"
            class="w-100"
            @click="clearFilters"
          >
            <i class="bx bx-x me-1"></i>Clear
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Bank Reference">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/bank-reference/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Bank Reference
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data bank reference...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="hasActiveFilters"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
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
                Tipe: {{ selectedType === "e_wallet" ? "E-Wallet" : "Bank" }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="selectedType = ''"
                ></i>
              </b-badge>

              <b-badge
                v-if="selectedIsActive !== ''"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Status: {{ selectedIsActive === "true" ? "Aktif" : "Nonaktif" }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="selectedIsActive = ''"
                ></i>
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
                {{ totalRows }} bank reference)
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
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useBankReferenceTable } from "./components/data";
import { toggleBankReferenceStatus } from "@/services/bankReferenceService";
import router from "@/router";

const queryClient = useQueryClient();

const {
  tableOptions,
  tableKeyString,
  tableKey,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedType,
  selectedIsActive,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useBankReferenceTable();

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedType.value ||
      selectedIsActive.value !== ""
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  selectedIsActive.value = "";
  resetPage();
};

const { mutate: doToggle } = useMutation({
  mutationFn: (id: number) => toggleBankReferenceStatus(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["bank-references"] });
    tableKey.value++;
  },
  onError: () => {
    Swal.fire({
      title: "Gagal",
      text: "Terjadi kesalahan saat mengubah status.",
      icon: "error",
      confirmButtonColor: "#ff6c2f",
    });
  },
});

const handleToggle = (id: number, currentlyActive: boolean) => {
  const willActivate = !currentlyActive;
  Swal.fire({
    title: willActivate
      ? "Aktifkan bank reference?"
      : "Nonaktifkan bank reference?",
    text: willActivate
      ? "Bank reference ini akan ditampilkan sebagai opsi pembayaran."
      : "Bank reference ini akan disembunyikan dari opsi pembayaran.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: willActivate ? "Ya, aktifkan!" : "Ya, nonaktifkan!",
    cancelButtonText: "Batal",
    confirmButtonColor: willActivate ? "#0acf97" : "#6c757d",
    cancelButtonColor: "#ef5f5f",
  }).then((result: any) => {
    if (result.isConfirmed) doToggle(id);
  });
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
    if (id) router.push(`/bank-reference/${id}/edit`);
  }
  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
    return;
  }

  const toggleEl = target.closest<HTMLElement>("#table-gridjs .toggle-status");
  if (toggleEl) {
    event.preventDefault();
    const id = toggleEl.getAttribute("data-id");
    const active = toggleEl.getAttribute("data-active");
    if (id) handleToggle(Number(id), active === "true");
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
