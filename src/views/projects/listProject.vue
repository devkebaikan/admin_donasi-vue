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
              placeholder="Cari judul, deskripsi, atau pengaju..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Status Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedStatus" @change="resetPage">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="diajukan">Diajukan</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
          </b-form-select>
        </b-col>

        <!-- Activity Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Activity</label>
          <b-form-select v-model="selectedActivity" @change="resetPage">
            <option value="">Semua Activity</option>
            <option value="inactive">Inactive</option>
            <option value="active open">Active Open</option>
            <option value="active close">Active Close</option>
            <option value="selesai">Selesai</option>
          </b-form-select>
        </b-col>

        <!-- Program Filter -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold"> Program </label>

          <ChoicesSelect
            id="program"
            :modelValue="selectedProgramId"
            @update:modelValue="
              (val: number) => {
                selectedProgramId = val;
                resetPage();
              }
            "
            :options="programOptions"
            :key="programOptions.length"
          />
        </b-col>

        <!-- <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Program</label>
          <b-form-select v-model="selectedProgramId" @change="resetPage">
            <option value="">Semua Program</option>
            <option v-for="p in programOptions" :key="p.id" :value="p.id">
              {{ p.title }}
            </option>
          </b-form-select>
        </b-col> -->
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
          v-if="selectedStatus"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Status: {{ selectedStatus }}
          <i class="bx bx-x cursor-pointer" @click="selectedStatus = ''"></i>
        </b-badge>

        <b-badge
          v-if="selectedActivity"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Activity: {{ selectedActivity }}
          <i class="bx bx-x cursor-pointer" @click="selectedActivity = ''"></i>
        </b-badge>

        <b-badge
          v-if="selectedProgramId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Program: {{ getProgramName(selectedProgramId) }}
          <i class="bx bx-x cursor-pointer" @click="selectedProgramId = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- ---------------------------------------------------------- Detail Offcanvas ---------------------------------------------------------- -->
    <b-offcanvas
      v-model="showDetailOffcanvas"
      placement="end"
      :bodyScrolling="true"
      :backdrop="true"
      style="--bs-offcanvas-width: 680px"
      @hide="selectedProjectId = 0"
    >
      <template #header="{ hide }">
        <div
          class="d-flex align-items-center justify-content-between w-100 gap-2"
        >
          <h5 class="mb-0 fw-semibold text-truncate">
            <i class="bx bx-folder-open me-1 text-primary"></i>
            Detail Project
          </h5>
          <b-button size="sm" variant="outline-secondary" @click="hide">
            <i class="bx bx-x fs-18"></i>
          </b-button>
        </div>
      </template>

      <div v-if="isDetailLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2 text-muted">Memuat detail project...</p>
      </div>

      <div v-else-if="isDetailError" class="alert alert-danger m-0">
        Gagal memuat detail project. Silakan coba lagi.
      </div>

      <div v-else-if="projectDetail" class="pb-4">
        <!-- Banner Image -->
        <div v-if="projectDetail.image_url" class="mb-3">
          <img
            :src="projectDetail.image_url"
            :alt="projectDetail.judul"
            class="w-100 rounded"
            style="max-height: 220px; object-fit: cover"
          />
        </div>

        <!-- Title -->
        <h5 class="fw-bold mb-2">{{ projectDetail.judul }}</h5>

        <!-- Status + Activity + Request Badges -->
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span :class="['badge', statusBadgeClass(projectDetail.status)]">
            {{ projectDetail.status }}
          </span>
          <span :class="['badge', activityBadgeClass(projectDetail.activity)]">
            {{ projectDetail.activity }}
          </span>
          <span
            v-if="projectDetail.request && projectDetail.request !== 'nothing'"
            class="badge bg-info text-dark"
          >
            {{ projectDetail.request }}
          </span>
        </div>

        <hr class="my-3" />

        <!-- Info Grid -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi Project
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Alasan</small>
              <span class="fw-semibold small">{{
                projectDetail.reason || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Jumlah PM</small>
              <span class="fw-semibold small">{{
                projectDetail.jumlah_pm || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Waktu Pelaksanaan</small>
              <span class="fw-semibold small">{{
                formatDate(projectDetail.waktu_pelaksanaan)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Lokasi</small>
              <a
                v-if="projectDetail.lat && projectDetail.lng"
                :href="`https://maps.google.com/?q=${projectDetail.lat},${projectDetail.lng}`"
                target="_blank"
                rel="noopener noreferrer"
                class="fw-semibold small"
              >
                {{ projectDetail.lat }}, {{ projectDetail.lng }}
                <i class="bx bx-map ms-1"></i>
              </a>
              <span v-else class="small text-muted">-</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Financial -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Informasi Keuangan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nominal Diajukan</small>
              <span class="fw-semibold font-monospace small">
                {{ formatCurrency(projectDetail.nominal_ajuan) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nominal Disetujui</small>
              <span class="fw-semibold font-monospace small text-success">
                {{ formatCurrency(projectDetail.nominal_acc) }}
              </span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Pengaju -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-user me-1"></i>Pengaju
        </h6>
        <div
          v-if="projectDetail.user"
          class="d-flex align-items-center gap-3 mb-3"
        >
          <div
            class="avatar-sm bg-primary bg-soft rounded-circle d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px; flex-shrink: 0"
          >
            <i class="bx bx-user fs-20 text-white"></i>
          </div>
          <div>
            <div class="fw-semibold">{{ projectDetail.user.name }}</div>
            <small class="text-muted">
              <i class="bx bx-phone me-1"></i>
              <a
                :href="`https://wa.me/${projectDetail.user.phone}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ projectDetail.user.phone }}
              </a>
            </small>
          </div>
        </div>

        <hr class="my-3" />

        <!-- Mitras -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-buildings me-1"></i>Mitra ({{
            projectDetail.mitras?.length ?? 0
          }})
        </h6>
        <div
          v-if="projectDetail.mitras?.length"
          class="d-flex flex-column gap-2 mb-3"
        >
          <div
            v-for="mitra in projectDetail.mitras"
            :key="mitra.id"
            class="d-flex align-items-center gap-3 bg-light rounded p-2"
          >
            <img
              v-if="mitra.image_url"
              :src="mitra.image_url"
              :alt="mitra.nama"
              class="rounded-circle"
              style="
                width: 40px;
                height: 40px;
                object-fit: cover;
                flex-shrink: 0;
              "
            />
            <div
              class="avatar-sm bg-secondary bg-soft rounded-circle d-flex align-items-center justify-content-center"
              v-else
              style="width: 40px; height: 40px; flex-shrink: 0"
            >
              <i class="bx bx-buildings fs-18 text-secondary"></i>
            </div>
            <div>
              <div class="fw-semibold small">{{ mitra.nama }}</div>
              <small class="text-muted">
                <a
                  :href="`https://wa.me/${mitra.wa}`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i class="bx bxl-whatsapp text-success me-1"></i
                  >{{ mitra.wa }}
                </a>
              </small>
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic mb-3">
          Tidak ada mitra terkait.
        </p>

        <hr class="my-3" />

        <!-- Programs -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-heart me-1"></i>Program Terkait ({{
            projectDetail.programs?.length ?? 0
          }})
        </h6>
        <div
          v-if="projectDetail.programs?.length"
          class="d-flex flex-column gap-2 mb-3"
        >
          <div
            v-for="program in projectDetail.programs"
            :key="program.id"
            class="d-flex align-items-start gap-3 bg-light rounded p-2"
          >
            <img
              v-if="program.name"
              :src="`https://cdn.aksiberbagi.com/programs/${program.name}`"
              :alt="program.description"
              class="rounded"
              style="
                width: 56px;
                height: 42px;
                object-fit: cover;
                flex-shrink: 0;
              "
            />
            <div>
              <div class="fw-semibold small">{{ program.description }}</div>
              <small class="text-muted">
                <a
                  :href="`https://don.aksiberbagi.com/donasi/${program.slug}`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /{{ program.slug }}
                  <i class="bx bx-link-external ms-1"></i>
                </a>
              </small>
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic mb-3">
          Tidak ada program terkait.
        </p>

        <hr class="my-3" />

        <!-- Dates -->
        <div class="d-flex gap-3 mb-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(projectDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(projectDetail.updated_at)
            }}</small>
          </div>
        </div>

        <hr class="my-3" />

        <!-- Deskripsi HTML -->
        <!-- <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-file-blank me-1"></i>Deskripsi
        </h6>
        <div
          v-if="projectDetail.deskripsi"
          class="project-content small"
          v-html="projectDetail.deskripsi"
        ></div>
        <p v-else class="text-muted small fst-italic">Tidak ada deskripsi.</p> -->
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Projects List">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/projects/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Buat Project Baru
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading projects...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading projects: {{ error?.message || "Please try again." }}
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
                {{ totalRows }} projects)
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
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useProjectsTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { getAllPrograms } from "@/services/programService";
import { getProjectById } from "@/services/projectService";
import { formatCurrency, formatDate, formatDateTime } from "@/helpers/format";

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedStatus,
  selectedActivity,
  selectedProgramId,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useProjectsTable();

const hasActiveFilters = computed(
  () =>
    !!(
      selectedStatus.value ||
      selectedActivity.value ||
      selectedProgramId.value ||
      searchQuery.value
    ),
);

const { data: programData } = useQuery({
  queryKey: ["programs-all"],
  queryFn: () => getAllPrograms({ mode: "list" }),
});

const programOptions = computed(() => {
  if (!programData.value) return [{ value: "", text: "Semua program" }];
  return [
    { value: "", text: "Semua program" },
    ...programData.value?.map((item: any) => ({
      value: item.id,
      text: item.title,
    })),
  ];
});

const clearFilters = () => {
  selectedStatus.value = "";
  selectedActivity.value = "";
  selectedProgramId.value = "";
  searchQuery.value = "";
  resetPage();
};

const getProgramName = (id: string | number) =>
  programOptions.value.find((p: any) => p.id === Number(id))?.title ??
  String(id);

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedProjectId = ref(0);

const {
  data: projectDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["project-detail", selectedProjectId.value]),
  queryFn: () => getProjectById(selectedProjectId.value),
  enabled: computed(() => selectedProjectId.value > 0),
});

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-secondary",
  diajukan: "bg-warning text-dark",
  diterima: "bg-success",
  ditolak: "bg-danger",
};

const ACTIVITY_BADGE: Record<string, string> = {
  inactive: "bg-secondary",
  "active open": "bg-success",
  "active close": "bg-secondary",
  selesai: "bg-primary",
};

const statusBadgeClass = (status: string) =>
  STATUS_BADGE[status] ?? "bg-secondary";
const activityBadgeClass = (activity: string) =>
  ACTIVITY_BADGE[activity] ?? "bg-secondary";

const openDetail = (id: number) => {
  selectedProjectId.value = id;
  showDetailOffcanvas.value = true;
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  const kegiatanBtn = target.closest<HTMLElement>(
    '#table-gridjs .kegiatan-btn[data-action="kegiatan"]',
  );
  const manageBtn = target.closest<HTMLElement>(
    '#table-gridjs .manage-btn[data-action="manage"]',
  );
  const fundingBtn = target.closest<HTMLElement>(
    '#table-gridjs .funding-btn[data-action="funding"]',
  );
  const reportBtn = target.closest<HTMLElement>(
    '#table-gridjs .report-btn[data-action="report"]',
  );
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (detailBtn) {
    event.preventDefault();
    const id = detailBtn.getAttribute("data-id");
    if (id) openDetail(Number(id));
    return;
  }

  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/projects/${id}/edit`);
    return;
  }

  if (kegiatanBtn) {
    event.preventDefault();
    const id = kegiatanBtn.getAttribute("data-id");
    if (id) router.push(`/projects/kegiatan/${id}`);
    return;
  }

  if (manageBtn) {
    event.preventDefault();
    const id = manageBtn.getAttribute("data-id");
    if (id) router.push(`/projects/manage/${id}`);
    return;
  }

  if (fundingBtn) {
    event.preventDefault();
    const id = fundingBtn.getAttribute("data-id");
    if (id) router.push(`/projects/funding/${id}`);
    return;
  }

  if (reportBtn) {
    event.preventDefault();
    const id = reportBtn.getAttribute("data-id");
    if (id) router.push(`/projects/report/${id}`);
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
