<template>
  <PipelineLayout>
    <b-card class="mb-2 flex-shrink-0" body-class="py-2">
      <h6 class="mb-0 fs-15 fw-semibold">Benefit</h6>
      <p class="text-muted mb-0 fs-11">Kelola Benefit Donatur</p>
    </b-card>

    <b-offcanvas
      v-model="showDetailOffcanvas"
      placement="end"
      :bodyScrolling="true"
      :backdrop="true"
      style="--bs-offcanvas-width: 680px"
      @hide="selectedId = 0"
    >
      <template #header="{ hide }">
        <div
          class="d-flex align-items-center justify-content-between w-100 gap-2"
        >
          <h5 class="mb-0 fw-semibold text-truncate">
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Benefit
          </h5>
          <b-button size="sm" variant="outline-secondary" @click="hide">
            <i class="bx bx-x fs-18"></i>
          </b-button>
        </div>
      </template>

      <div v-if="isDetailLoading" class="text-center py-5">
        <b-spinner />
        <p class="mt-2 text-muted">Memuat detail benefit...</p>
      </div>
      <div v-else-if="isDetailError" class="alert alert-danger m-0">
        Gagal memuat detail benefit.
      </div>
      <div v-else-if="benefitDetail" class="pb-4">
        <div class="d-flex gap-3 align-items-start mb-3">
          <span class="fs-2">{{ benefitDetail.emoji }}</span>
          <div class="flex-grow-1">
            <h5 class="fw-bold mb-1">{{ benefitDetail.judul }}</h5>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-secondary text-uppercase">{{
                benefitDetail.jenis
              }}</span>
              <span class="badge bg-light text-dark">{{
                benefitDetail.periode
              }}</span>
              <span
                class="badge text-uppercase"
                :class="
                  benefitDetail.status === 'published'
                    ? 'bg-success'
                    : 'bg-warning text-dark'
                "
              >
                {{ benefitDetail.status }}
              </span>
            </div>
          </div>
        </div>

        <hr class="my-3" />

        <div class="mb-3">
          <h6
            class="fw-semibold text-muted mb-2 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            Deskripsi
          </h6>
          <p class="mb-0">{{ benefitDetail.deskripsi }}</p>
        </div>

        <div class="mb-3">
          <h6
            class="fw-semibold text-muted mb-2 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            Pesan Template
          </h6>
          <div class="bg-light rounded p-3">
            <pre
              class="mb-0 small"
              style="white-space: pre-wrap; font-family: inherit"
              >{{ benefitDetail.pesan_template }}
                </pre
            >
          </div>
        </div>

        <div class="mb-3">
          <h6
            class="fw-semibold text-muted mb-2 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            Link
          </h6>
          <a :href="benefitDetail.link" target="_blank" rel="noreferrer">{{
            benefitDetail.link
          }}</a>
        </div>

        <div class="mb-3">
          <h6
            class="fw-semibold text-muted mb-2 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            Target Levels
          </h6>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="level in benefitDetail.target_levels"
              :key="level"
              class="badge bg-info-subtle text-info-emphasis"
            >
              {{ level }}
            </span>
          </div>
        </div>

        <div class="d-flex gap-4 flex-wrap text-muted small">
          <div>
            <span class="d-block text-uppercase">Dipakai</span>
            <span class="fw-semibold">{{ benefitDetail.dipakai_count }}</span>
          </div>
        </div>
      </div>
    </b-offcanvas>

    <b-card class="mb-3 flex-shrink-0">
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
        <b-col cols="6" md="4">
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari judul, jenis, atau periode..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>
        <b-col cols="6" md="2">
          <b-form-group>
            <b-form-select
              id="filter-status"
              v-model="publishedOnly"
              :options="[
                { value: false, text: 'Semua Status' },
                { value: true, text: 'Hanya Published' },
              ]"
              @update:model-value="resetPage"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <div v-if="hasActiveFilters" class="d-flex flex-wrap gap-2 mt-3">
        <b-badge
          v-if="searchQuery"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Cari: "{{ searchQuery }}"
          <i
            class="bx bx-x cursor-pointer"
            @click="
              searchQuery = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="publishedOnly"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Hanya Published
          <i
            class="bx bx-x cursor-pointer"
            @click="
              publishedOnly = false;
              resetPage();
            "
          ></i>
        </b-badge>
      </div>
    </b-card>

    <b-row class="flex-grow-1" style="min-height: 0">
      <b-col>
        <UIComponentCard id="basic" title="Daftar Benefit">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push({ name: 'crm-benefit.create' })"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Buat Benefit
            </b-button>
          </div>
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data benefit...</p>
          </div>
          <div v-else-if="isError" class="alert alert-danger">
            {{ error?.message || "Gagal memuat data benefit." }}
          </div>
          <div v-else>
            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />
            <div class="d-flex justify-content-between mt-3">
              <div class="text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }})
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
              />
            </div>
            <div v-if="isFetching" class="text-center mt-2">
              <small><b-spinner small />Memperbarui...</small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </PipelineLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import PipelineLayout from "@/components/PipelineLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { getBenefitDetail } from "@/services/benefitService";
import { useBenefitTable } from "./components/data";
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
  publishedOnly,
} = useBenefitTable();

const hasActiveFilters = computed(
  () => !!(searchQuery.value || publishedOnly.value),
);

const clearFilters = () => {
  searchQuery.value = "";
  publishedOnly.value = false;
  resetPage();
};

const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: benefitDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["crm-benefit-detail", selectedId.value]),
  queryFn: () => getBenefitDetail(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetailOffcanvas.value = true;
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  if (detailBtn) {
    event.preventDefault();
    openDetail(Number(detailBtn.getAttribute("data-id")));
    return;
  }

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  if (editBtn) {
    event.preventDefault();
    router.push({
      name: "crm-benefit.edit",
      params: { id: editBtn.getAttribute("data-id") },
    });
    return;
  }

  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );
  if (deleteBtn) {
    event.preventDefault();
    handleDelete(Number(deleteBtn.getAttribute("data-id")));
    return;
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
