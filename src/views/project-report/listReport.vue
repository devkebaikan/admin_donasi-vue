<template>
  <VerticalLayout>
    <!-- Detail Offcanvas -->
    <b-offcanvas
      v-model="showDetailOffcanvas"
      placement="end"
      :bodyScrolling="true"
      :backdrop="true"
      style="--bs-offcanvas-width: 720px"
      @hide="selectedId = 0"
    >
      <template #header="{ hide }">
        <div
          class="d-flex align-items-center justify-content-between w-100 gap-2"
        >
          <h5 class="mb-0 fw-semibold text-truncate">
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Laporan
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
      <div v-else-if="reportDetail" class="pb-4">
        <!-- Thumbnail Preview -->
        <div v-if="reportDetail.thumbnail_url" class="mb-3">
          <img
            :src="reportDetail.thumbnail_url"
            alt="thumbnail"
            class="img-fluid rounded"
            style="max-width: 100%; max-height: 400px; object-fit: cover"
          />
        </div>

        <!-- Badges -->
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            :class="[
              'badge',
              reportDetail.type === 'Final' ? 'bg-success' : 'bg-info',
            ]"
          >
            {{ reportDetail.type }}
          </span>
          <!-- <span v-if="reportDetail.project" class="badge bg-primary">
            {{ reportDetail.project.name }}
          </span> -->
        </div>

        <h5 class="fw-bold mb-2">{{ reportDetail.kegiatan?.nama ?? "-" }}</h5>
        <h6 class="mb-2">Project : {{ reportDetail.project?.name ?? "-" }}</h6>

        <hr class="my-3" />

        <!-- Project & Kegiatan Info -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-folder me-1"></i>Project & Kegiatan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Project</small>
              <span class="fw-semibold small">{{
                reportDetail.project?.name ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Kegiatan</small>
              <span class="fw-semibold small">{{
                reportDetail.kegiatan?.nama ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Tipe</small>
              <span class="fw-semibold small">{{ reportDetail.type }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Mitra IDs</small>
              <span class="fw-semibold small">{{
                reportDetail.mitra_ids || "-"
              }}</span>
            </div>
          </b-col>
        </b-row>

        <!-- Social Media -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-share me-1"></i>Sosial Media
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Instagram Link</small>
              <span v-if="reportDetail.link_ig" class="fw-semibold small">
                <a :href="reportDetail.link_ig" target="_blank" rel="noopener">
                  {{ reportDetail.link_ig }}
                  <i class="bx bx-link-external"></i>
                </a>
              </span>
              <span v-else class="text-muted small">-</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">WhatsApp Caption</small>
              <span class="fw-semibold small" v-if="reportDetail.wa_caption">
                {{ reportDetail.wa_caption.substring(0, 100)
                }}{{ reportDetail.wa_caption.length > 100 ? "..." : "" }}
              </span>
              <span v-else class="text-muted small">-</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />
        <div class="d-flex gap-3 text-muted small">
          <div>
            <span class="d-block">ID</span
            ><span class="fw-semibold">{{ reportDetail.id }}</span>
          </div>
          <div>
            <span class="d-block">Dibuat</span
            ><span class="fw-semibold">{{
              formatDate(reportDetail.created_at)
            }}</span>
          </div>
          <div>
            <span class="d-block">Diperbarui</span
            ><span class="fw-semibold">{{
              formatDate(reportDetail.updated_at)
            }}</span>
          </div>
        </div>
      </div>
    </b-offcanvas>

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
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari link IG atau caption WA..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Project</label>
          <ChoicesSelect
            id="filter-project"
            :modelValue="String(selectedProjectId || 0)"
            @update:modelValue="
              (val) => {
                selectedProjectId = val === '0' ? '' : Number(val);
                resetPage();
              }
            "
            :options="projectOptions"
            :isLoading="isProjectLoading"
            :key="projectOptions.length"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Kegiatan</label>
          <ChoicesSelect
            id="filter-kegiatan"
            :modelValue="String(selectedKegiatanId || 0)"
            @update:modelValue="
              (val) => {
                selectedKegiatanId = val === '0' ? '' : Number(val);
                resetPage();
              }
            "
            :options="kegiatanOptions"
            :isLoading="isKegiatanLoading"
            :key="kegiatanOptions.length"
          />
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Tipe</b-form-select-option>
            </template>
            <b-form-select-option value="Progress"
              >Progress</b-form-select-option
            >
            <b-form-select-option value="Final">Final</b-form-select-option>
          </b-form-select>
        </b-col>
      </b-row>

      <!-- Active Filters -->
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
          v-if="selectedProjectId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Project: {{ selectedProjectLabel }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedProjectId = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedKegiatanId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Kegiatan: {{ selectedKegiatanLabel }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedKegiatanId = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedType"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Tipe: {{ selectedType }}
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
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Laporan Project">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              v-if="selectedProjectId"
              variant="primary"
              @click="handleAddReport"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Laporan
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data...</p>
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
                {{ totalRows }})
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
              <small class="text-muted"
                ><b-spinner small class="me-1" />Memperbarui...</small
              >
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { formatDate } from "@/helpers/format";
import { useReportTable } from "./components/data";
import { getReportById } from "@/services/reportService";
import { getProjects } from "@/services/projectService";
import { getAllKegiatan } from "@/services/kegiatanService";
import router from "@/router";
import { useRoute } from "vue-router";

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
  selectedProjectId,
  selectedKegiatanId,
  selectedType,
} = useReportTable();

const route = useRoute();
watch(
  () => route.query.project_id,
  (id) => {
    selectedProjectId.value = id ? Number(id) : "";
  },
  { immediate: true },
);

const handleAddReport = () => {
  if (selectedProjectId.value) {
    router.push(`/project-report/create?project_id=${selectedProjectId.value}`);
  } else {
    router.push("/project-report/create");
  }
};

// ── Project & Kegiatan dropdowns ──────────────────────────────────────────
const { data: projectData, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getProjects({ mode: "list" }),
});
const projectOptions = computed(() => {
  const list = Array.isArray(projectData.value) ? projectData.value : [];
  return [
    { value: 0, text: "Semua Project" },
    ...list.map((p: any) => ({ value: p.id, text: p.judul })),
  ];
});
const selectedProjectLabel = computed(
  () =>
    projectOptions.value.find((o) => o.value === selectedProjectId.value)
      ?.text ?? "",
);

const { data: kegiatanData, isLoading: isKegiatanLoading } = useQuery({
  queryKey: ["kegiatans-list"],
  queryFn: () => getAllKegiatan({ mode: "list" }),
});
const kegiatanOptions = computed(() => {
  const list = Array.isArray(kegiatanData.value) ? kegiatanData.value : [];
  return [
    { value: 0, text: "Semua Kegiatan" },
    ...list.map((k: any) => ({ value: k.id, text: k.judul })),
  ];
});
const selectedKegiatanLabel = computed(
  () =>
    kegiatanOptions.value.find((o) => o.value === selectedKegiatanId.value)
      ?.text ?? "",
);

// ── Filter helpers ────────────────────────────────────────────────────────

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedProjectId.value ||
      selectedKegiatanId.value ||
      selectedType.value
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedProjectId.value = "";
  selectedKegiatanId.value = "";
  selectedType.value = "";
  resetPage();
};

// ── Detail Offcanvas ──────────────────────────────────────────────────────

const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: reportDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["report-detail", selectedId.value]),
  queryFn: () => getReportById(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetailOffcanvas.value = true;
};

// ── Global click handler ──────────────────────────────────────────────────

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
    router.push(`/project-report/${editBtn.getAttribute("data-id")}/edit`);
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
