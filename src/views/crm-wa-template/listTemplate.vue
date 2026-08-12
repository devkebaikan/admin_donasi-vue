<template>
  <div class="d-flex flex-column" style="min-height: 100vh">
    <b-row class="g-2 flex-grow-1" style="min-height: 0">
      <!-- Pipeline stage menu -->
      <b-col xxl="2" lg="3" class="d-flex flex-column" style="min-height: 0">
        <PipelineSidebar />
      </b-col>

      <!-- Konten modul -->
      <b-col xxl="10" lg="9" class="d-flex flex-column" style="min-height: 0">
        <b-card class="mb-2 flex-shrink-0" body-class="py-2">
          <h6 class="mb-0 fs-15 fw-semibold">WA Template</h6>
          <p class="text-muted mb-0 fs-11">Kelola template pesan WhatsApp</p>
        </b-card>

        <!-- Detail Offcanvas -->
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
                <i class="bx bx-info-circle me-1 text-primary"></i>Detail
                Template
              </h5>
              <b-button size="sm" variant="outline-secondary" @click="hide">
                <i class="bx bx-x fs-18"></i>
              </b-button>
            </div>
          </template>

          <div v-if="isDetailLoading" class="text-center py-5">
            <b-spinner />
            <p class="mt-2 text-muted">Memuat...</p>
          </div>
          <div v-else-if="isDetailError" class="alert alert-danger m-0">
            Gagal memuat detail.
          </div>
          <div v-else-if="templateDetail" class="pb-4">
            <h5 class="fw-bold mb-2">{{ templateDetail.name }}</h5>
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span :class="['badge', typeBadgeClass(templateDetail.type)]">{{
                typeLabel(templateDetail.type)
              }}</span>
              <span class="badge bg-light text-dark font-monospace">{{
                templateDetail.slug
              }}</span>
            </div>

            <hr class="my-3" />

            <h6
              class="fw-semibold text-muted mb-2 text-uppercase"
              style="font-size: 11px; letter-spacing: 0.5px"
            >
              <i class="bx bx-message-detail me-1"></i>Isi Pesan
            </h6>
            <div class="bg-light rounded p-3 mb-3">
              <pre
                class="mb-0 small"
                style="white-space: pre-wrap; font-family: inherit"
                >{{ templateDetail.isi }}</pre
              >
            </div>

            <template
              v-if="
                templateDetail.type === 'crm' &&
                templateDetail.pipeline_stages?.length
              "
            >
              <h6
                class="fw-semibold text-muted mb-2 text-uppercase"
                style="font-size: 11px; letter-spacing: 0.5px"
              >
                <i class="bx bx-git-branch me-1"></i>Stage Pipeline
              </h6>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span
                  v-for="stage in templateDetail.pipeline_stages"
                  :key="stage.id"
                  class="badge bg-info-subtle text-info-emphasis"
                >
                  {{ stage.label }}
                </span>
              </div>
            </template>

            <template
              v-if="templateDetail.type === 'system' && templateDetail.variable"
            >
              <h6
                class="fw-semibold text-muted mb-2 text-uppercase"
                style="font-size: 11px; letter-spacing: 0.5px"
              >
                <i class="bx bx-code-block me-1"></i>Variable
              </h6>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span
                  v-for="v in templateDetail.variable
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)"
                  :key="v"
                  class="badge bg-light text-dark font-monospace"
                >
                  {{ v }}
                </span>
              </div>
            </template>

            <div v-if="templateDetail.image" class="mb-3">
              <h6
                class="fw-semibold text-muted mb-2 text-uppercase"
                style="font-size: 11px; letter-spacing: 0.5px"
              >
                <i class="bx bx-image me-1"></i>Gambar
              </h6>
              <img
                :src="`${STORAGE_BASE}${templateDetail.image}`"
                alt="template"
                style="
                  max-height: 160px;
                  max-width: 100%;
                  border-radius: 4px;
                  border: 1px solid #dee2e6;
                "
              />
            </div>

            <hr class="my-3" />
            <div class="d-flex gap-3">
              <div v-if="templateDetail.created_at">
                <small class="text-muted d-block">Dibuat</small>
                <small class="fw-semibold">{{
                  formatDateTime(templateDetail.created_at)
                }}</small>
              </div>
              <div v-if="templateDetail.updated_at">
                <small class="text-muted d-block">Diperbarui</small>
                <small class="fw-semibold">{{
                  formatDateTime(templateDetail.updated_at)
                }}</small>
              </div>
            </div>
          </div>
        </b-offcanvas>

        <!-- Filter -->
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
            <b-col cols="12" md="4">
              <b-input-group>
                <span class="input-group-text"
                  ><i class="bx bx-search"></i
                ></span>
                <b-form-input
                  v-model="searchQuery"
                  placeholder="Cari nama, slug, atau isi template..."
                  debounce="500"
                  @update:model-value="resetPage"
                />
              </b-input-group>
            </b-col>
            <b-col cols="12" md="2">
              <b-form-select v-model="selectedType" @change="resetPage">
                <b-form-select-option value="">Semua Tipe</b-form-select-option>
                <b-form-select-option value="system"
                  >System</b-form-select-option
                >
                <b-form-select-option value="crm">CRM</b-form-select-option>
              </b-form-select>
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
              v-if="selectedType"
              variant="primary"
              class="d-flex align-items-center gap-1"
            >
              Tipe: {{ typeLabel(selectedType) }}
              <i
                class="bx bx-x cursor-pointer"
                @click="
                  selectedType = '';
                  resetPage();
                "
              ></i>
            </b-badge>
          </div>
        </b-card>

        <!-- Table -->
        <b-row class="flex-grow-1" style="min-height: 0">
          <b-col>
            <UIComponentCard id="basic" title="Daftar Template">
              <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
                <b-button
                  variant="primary"
                  :to="{ name: 'crm-wa-template.create' }"
                >
                  <i class="bx bx-plus fs-16 me-1"></i>Buat Template
                </b-button>
              </div>

              <div v-if="isLoading" class="text-center p-4">
                <b-spinner variant="primary" />
                <p class="mt-2">Memuat data template...</p>
              </div>
              <div v-else-if="isError" class="alert alert-danger">
                {{ error?.message || "Gagal memuat data." }}
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
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { formatDateTime } from "@/helpers/format";
import { getCrmChatTemplateDetail } from "@/services/crmService";
import {
  useCrmTemplateTable,
  typeBadgeClass,
  typeLabel,
} from "./components/data";
import { hasPermission } from "@/helpers/permission";
import router from "@/router";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const isCanCreate = hasPermission("crm:whatsapp_template");

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
  selectedType,
} = useCrmTemplateTable();

const hasActiveFilters = computed(
  () => !!(searchQuery.value || selectedType.value),
);
const clearFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  resetPage();
};

// Detail Offcanvas
const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: templateDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["crm-wa-template-detail", selectedId.value]),
  queryFn: () => getCrmChatTemplateDetail(selectedId.value),
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
      name: "crm-wa-template.edit",
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
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
