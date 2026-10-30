<template>
  <VerticalLayout>
    <!-- Drawer Detail & Social Accounts -->
    <InfluencerDetailOffcanvas
      v-model="showDetailOffcanvas"
      :influencer-id="selectedInfluencerId"
    />

    <!-- Section 1: Filter -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bx bx-filter-alt me-1"></i>Filter Influencer
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

      <b-row class="g-3">
        <!-- Search Input -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Pencarian</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, display name, email, no telepon..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Status Filter -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Status Profil</label>
          <b-form-select v-model="selectedStatus" @change="resetPage">
            <b-form-select-option value="">Semua Status</b-form-select-option>
            <b-form-select-option value="prospect">Prospect</b-form-select-option>
            <b-form-select-option value="active">Active</b-form-select-option>
            <b-form-select-option value="inactive">Inactive</b-form-select-option>
          </b-form-select>
        </b-col>

        <!-- Entity Type Filter -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Tipe Entitas</label>
          <b-form-select v-model="selectedEntityType" @change="resetPage">
            <b-form-select-option value="">Semua Tipe</b-form-select-option>
            <b-form-select-option value="individual">Individual</b-form-select-option>
            <b-form-select-option value="agency">Agency</b-form-select-option>
            <b-form-select-option value="brand">Brand</b-form-select-option>
            <b-form-select-option value="community">Community</b-form-select-option>
          </b-form-select>
        </b-col>
      </b-row>
    </b-card>

    <!-- Section 2: Tabel Card -->
    <b-row>
      <b-col>
        <UIComponentCard id="influencer-table-card" title="Daftar Influencer">
          <!-- Tombol Tambah -->
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/influencers/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Influencer
            </b-button>
          </div>

          <!-- Loading & Error State -->
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2 text-muted">Memuat data influencer...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: {{ error?.message || "Terjadi kesalahan." }}
          </div>

          <!-- Tabel Konten -->
          <div v-else>
            <!-- Badge Filter Aktif -->
            <div v-if="hasActiveFilters" class="mb-3 d-flex flex-wrap gap-2 align-items-center">
              <span class="text-muted small">Filter aktif:</span>
              <b-badge v-if="searchQuery" variant="primary">
                Cari: "{{ searchQuery }}"
                <i class="bx bx-x cursor-pointer ms-1" @click="searchQuery = ''"></i>
              </b-badge>
              <b-badge v-if="selectedStatus" variant="primary">
                Status: {{ selectedStatus }}
                <i class="bx bx-x cursor-pointer ms-1" @click="selectedStatus = ''"></i>
              </b-badge>
              <b-badge v-if="selectedEntityType" variant="primary">
                Tipe: {{ selectedEntityType }}
                <i class="bx bx-x cursor-pointer ms-1" @click="selectedEntityType = ''"></i>
              </b-badge>
            </div>

            <GridJsTable id="table-gridjs" :key="tableKeyString" :options="tableOptions" />

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted small">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total: {{ totalRows }} influencer)
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
                <b-spinner small class="me-1" />Memperbarui data...
              </small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import InfluencerDetailOffcanvas from "./components/InfluencerDetailOffcanvas.vue";
import { useInfluencerTable } from "./components/data";
import { useListStatePreserve } from "@/composables/useListStatePreserve";
import { useOffcanvasStatePreserve } from "@/composables/useOffcanvasStatePreserve";
// import { hasPermission } from "@/helpers/permission";
import router from "@/router";

const isCanCreate = true;

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedStatus,
  selectedEntityType,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useInfluencerTable();

// ── Preserve list state & scroll position ──────────────────────────────────
useListStatePreserve("influencers-list", {
  searchQuery,
  currentPage,
  perPageItem,
  extraFilters: computed(() => ({
    selectedStatus: selectedStatus.value,
    selectedEntityType: selectedEntityType.value,
  })),
});

// ── Offcanvas Detail State ─────────────────────────────────────────────────
const showDetailOffcanvas = ref(false);
const selectedInfluencerId = ref<number | null>(null);

useOffcanvasStatePreserve("influencers-detail", {
  showOffcanvas: showDetailOffcanvas,
  selectedId: selectedInfluencerId,
});

const hasActiveFilters = computed(
  () => !!(searchQuery.value || selectedStatus.value || selectedEntityType.value)
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedEntityType.value = "";
  resetPage();
};

// Event delegation untuk tombol aksi di GridJS
const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const detailBtn = target.closest<HTMLElement>('#table-gridjs .detail-btn[data-action="detail"]');
  const editBtn = target.closest<HTMLElement>('#table-gridjs .edit-btn[data-action="edit"]');
  const deleteBtn = target.closest<HTMLElement>('#table-gridjs .delete-btn[data-action="delete"]');

  if (detailBtn) {
    event.preventDefault();
    const id = detailBtn.getAttribute("data-id");
    if (id) {
      selectedInfluencerId.value = Number(id);
      showDetailOffcanvas.value = true;
    }
  }

  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/influencers/${id}/edit`);
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
