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
              placeholder="Cari judul atau link..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Category Filter -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Category</label>
          <b-form-select v-model="selectedCategory" :options="categoryOptions">
            <template #first>
              <b-form-select-option value=""
                >All Categories</b-form-select-option
              >
            </template>
          </b-form-select>
        </b-col>

        <!-- Sort Order -->
        <!-- <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Sort By</label>
          <b-form-select
            v-model="sortOrder"
            :options="sortOrderOptions"
            @change="resetPage"
          />
        </b-col> -->

        <!-- Sort Direction -->
        <!-- <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Direction</label>
          <b-form-select
            v-model="sortDir"
            :options="sortDirOptions"
            @change="resetPage"
          />
        </b-col> -->
      </b-row>
      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="mb-3 d-flex flex-wrap gap-2 align-items-center"
      >
        <span class="text-muted small">Active filters:</span>

        <b-badge
          v-if="selectedCategory"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Category: {{ getCategoryName(selectedCategory) }}
          <i class="bx bx-x cursor-pointer" @click="selectedCategory = ''"></i>
        </b-badge>

        <b-badge
          v-if="searchQuery"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Search: "{{ searchQuery }}"
          <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- ------------------------------------------ Detail Offcanvas ------------------------------------------ -->
    <b-offcanvas
      v-model="showDetailOffcanvas"
      placement="end"
      :bodyScrolling="true"
      :backdrop="true"
      style="--bs-offcanvas-width: 680px"
      @hide="selectedProgramLink = ''"
    >
      <template #header="{ hide }">
        <div
          class="d-flex align-items-center justify-content-between w-100 gap-2"
        >
          <h5 class="mb-0 fw-semibold text-truncate">
            <i class="bx bx-info-circle me-1 text-primary"></i>
            Detail Program
          </h5>
          <b-button size="sm" variant="outline-secondary" @click="hide">
            <i class="bx bx-x fs-18"></i>
          </b-button>
        </div>
      </template>

      <div v-if="isDetailLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2 text-muted">Memuat detail program...</p>
      </div>

      <div v-else-if="isDetailError" class="alert alert-danger m-0">
        Gagal memuat detail program. Silakan coba lagi.
      </div>

      <div v-else-if="programDetail" class="pb-4">
        <!-- Image -->
        <div v-if="programDetail.image" class="mb-3">
          <img
            :src="programDetail.image"
            :alt="programDetail.title"
            class="w-100 rounded"
            style="max-height: 240px; object-fit: cover"
          />
        </div>

        <!-- Title + Badges -->
        <h5 class="fw-bold mb-2">{{ programDetail.title }}</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            :class="[
              'badge',
              programDetail.status === 'PUBLISH'
                ? 'bg-success'
                : 'bg-secondary',
            ]"
            >{{ programDetail.status }}</span
          >
          <span v-if="programDetail.category" class="badge bg-info text-dark">
            {{ programDetail.category.name }}
          </span>
          <span v-if="programDetail.tipe" class="badge bg-warning text-dark">
            {{ programDetail.tipe.name }}
          </span>
          <span v-if="programDetail.is_rutin" class="badge bg-primary"
            >Rutin</span
          >
          <span v-if="programDetail.is_favorit" class="badge bg-danger">
            <i class="bx bx-heart me-1"></i>Favorit
          </span>
        </div>

        <!-- Description -->
        <p v-if="programDetail.description" class="text-muted small mb-3">
          {{ programDetail.description }}
        </p>

        <hr class="my-3" />

        <!-- Mitra -->
        <div
          v-if="programDetail.mitra"
          class="d-flex align-items-center gap-3 mb-3"
        >
          <img
            v-if="programDetail.mitra.image"
            :src="programDetail.mitra.image"
            :alt="programDetail.mitra.name"
            class="rounded-circle"
            style="width: 48px; height: 48px; object-fit: cover"
          />
          <div>
            <div class="fw-semibold">{{ programDetail.mitra.name }}</div>
            <small class="text-muted">{{ programDetail.mitra.location }}</small>
          </div>
        </div>

        <hr class="my-3" />

        <!-- Financial Info -->
        <h6
          class="fw-semibold text-muted mb-3 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Informasi Keuangan
        </h6>

        <!-- Progress bar -->
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1">
            <small class="text-muted">Progress Pencapaian</small>
            <small class="fw-semibold"
              >{{ programDetail.progress_achieved }}%</small
            >
          </div>
          <div class="progress" style="height: 8px">
            <div
              class="progress-bar bg-success"
              role="progressbar"
              :style="{
                width:
                  Math.min(Number(programDetail.progress_achieved), 100) + '%',
              }"
            ></div>
          </div>
        </div>

        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Target</small>
              <span class="fw-semibold font-monospace small">
                {{ formatCurrency(programDetail.nominal_target) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Terkumpul</small>
              <span class="fw-semibold font-monospace small text-success">
                {{ formatCurrency(Number(programDetail.nominal_achieved)) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Digunakan</small>
              <span class="fw-semibold font-monospace small text-warning">
                {{ formatCurrency(Number(programDetail.nominal_used)) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Sisa Dana</small>
              <span class="fw-semibold font-monospace small text-info">
                {{ formatCurrency(Number(programDetail.remaining_nominal)) }}
              </span>
            </div>
          </b-col>
        </b-row>

        <b-row class="g-2 mb-3">
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">{{ programDetail.total_donors }}</div>
              <small class="text-muted">Donatur</small>
            </div>
          </b-col>
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">
                {{ programDetail.total_beneficiery }}
              </div>
              <small class="text-muted">Penerima</small>
            </div>
          </b-col>
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">
                {{
                  programDetail.remaining_days !== null
                    ? programDetail.remaining_days
                    : "∞"
                }}
              </div>
              <small class="text-muted">Sisa Hari</small>
            </div>
          </b-col>
        </b-row>

        <!-- Project Info -->
        <h6
          class="fw-semibold text-muted mb-3 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Informasi Project
        </h6>
        <!-- 
        <b-row class="g-2 mb-3">
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">{{ programDetail.total_donors }}</div>
              <small class="text-muted">Donatur</small>
            </div>
          </b-col>
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">
                {{ programDetail.total_beneficiery }}
              </div>
              <small class="text-muted">Penerima</small>
            </div>
          </b-col>
          <b-col cols="4">
            <div class="text-center bg-light rounded p-2">
              <div class="fw-bold fs-5">
                {{
                  programDetail.remaining_days !== null
                    ? programDetail.remaining_days
                    : "∞"
                }}
              </div>
              <small class="text-muted">Sisa Hari</small>
            </div>
          </b-col>
        </b-row> -->

        <hr class="my-3" />

        <!-- Dates -->
        <div class="d-flex gap-3 mb-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(programDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(programDetail.updated_at)
            }}</small>
          </div>
        </div>

        <!-- Link -->
        <div class="mb-3">
          <small class="text-muted d-block mb-1">URL Program</small>
          <a
            :href="`https://don.aksiberbagi.com/donasi/${programDetail.link}`"
            target="_blank"
            rel="noopener noreferrer"
            class="small text-break"
          >
            don.aksiberbagi.com/donasi/{{ programDetail.link }}
            <i class="bx bx-link-external ms-1"></i>
          </a>
        </div>

        <hr class="my-3" />

        <!-- Last Two Projects -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-folder-open me-1"></i>Project Terbaru
          <span class="ms-1 badge bg-secondary">{{
            programDetail.last_two_projects?.length ?? 0
          }}</span>
        </h6>

        <div
          v-if="programDetail.last_two_projects?.length"
          class="d-flex flex-column gap-2"
        >
          <div
            v-for="project in programDetail.last_two_projects"
            :key="project.id"
            class="border rounded p-2"
          >
            <!-- Image + Title row -->
            <div class="d-flex gap-2 mb-2">
              <img
                v-if="project.image"
                :src="project.image"
                :alt="project.title"
                class="rounded"
                style="
                  width: 64px;
                  height: 48px;
                  object-fit: cover;
                  flex-shrink: 0;
                "
              />
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold small text-wrap">
                  {{ project.title }}
                </div>
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span
                    :class="['badge', projectStatusBadge(project.status)]"
                    >{{ project.status }}</span
                  >
                  <span
                    :class="['badge', projectActivityBadge(project.activity)]"
                    >{{ project.activity }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Nominal info -->
            <b-row class="g-1">
              <b-col cols="4">
                <div class="bg-light rounded p-1 text-center">
                  <small class="text-muted d-block" style="font-size: 10px"
                    >Target</small
                  >
                  <span class="fw-semibold" style="font-size: 11px">{{
                    formatCurrency(Number(project.nominal_target))
                  }}</span>
                </div>
              </b-col>
              <b-col cols="4">
                <div class="bg-light rounded p-1 text-center">
                  <small class="text-muted d-block" style="font-size: 10px"
                    >Terkumpul</small
                  >
                  <span
                    class="fw-semibold text-success"
                    style="font-size: 11px"
                    >{{
                      formatCurrency(Number(project.nominal_achieved))
                    }}</span
                  >
                </div>
              </b-col>
              <b-col cols="4">
                <div class="bg-light rounded p-1 text-center">
                  <small class="text-muted d-block" style="font-size: 10px"
                    >Penerima</small
                  >
                  <span class="fw-semibold" style="font-size: 11px">{{
                    project.beneficiary ?? "-"
                  }}</span>
                </div>
              </b-col>
            </b-row>

            <!-- Execution time + location -->
            <div class="d-flex gap-3 mt-2">
              <small class="text-muted" v-if="project.excecution_time">
                <i class="bx bx-calendar me-1"></i
                >{{ formatDate(project.excecution_time) }}
              </small>
              <small class="text-muted" v-if="project.location">
                <i class="bx bx-map me-1"></i>{{ project.location }}
              </small>
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Belum ada project terbaru.
        </p>
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Programs List">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/programs/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Create New Program
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading programs...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading programs: {{ error?.message || "Please try again." }}
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
                {{ totalRows }} programs)
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
import { useProgramsTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import {
  getProgramCategories,
  getProgramBylink,
} from "@/services/programService";
import { formatCurrency, formatDate, formatDateTime } from "@/helpers/format";

// const sortOrderOptions = [
//   { value: "id", text: "ID" },
//   { value: "judul", text: "Title" },
//   { value: "created_at", text: "Created At" },
//   { value: "saldo", text: "Saldo" },
// ];

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedCategory,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useProgramsTable();

const hasActiveFilters = computed(
  () => !!(selectedCategory.value || searchQuery.value),
);

const { data: dataCategories } = useQuery({
  queryKey: ["programCategories"],
  queryFn: getProgramCategories,
});

const categoryOptions = computed(() => {
  if (!dataCategories.value) return [];
  return dataCategories.value.map((category: any) => ({
    value: category.id,
    text: category.name,
  }));
});

const clearFilters = () => {
  selectedCategory.value = "";
  searchQuery.value = "";
  resetPage();
};

const getCategoryName = (value: string | number) =>
  categoryOptions.value.find(
    (c: { value: any; text: string }) => c.value === value,
  )?.text ?? String(value);

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedProgramLink = ref("");

const {
  data: programDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["program-detail", selectedProgramLink.value]),
  queryFn: () => getProgramBylink(selectedProgramLink.value),
  enabled: computed(() => !!selectedProgramLink.value),
});

const openDetail = (link: string) => {
  selectedProgramLink.value = link;
  showDetailOffcanvas.value = true;
};

const PROJECT_STATUS_BADGE: Record<string, string> = {
  draft: "bg-secondary",
  diajukan: "bg-warning text-dark",
  diterima: "bg-success",
  ditolak: "bg-danger",
};

const PROJECT_ACTIVITY_BADGE: Record<string, string> = {
  inactive: "bg-secondary",
  "active open": "bg-success",
  "active close": "bg-secondary",
  selesai: "bg-primary",
};

const projectStatusBadge = (status: string) =>
  PROJECT_STATUS_BADGE[status] ?? "bg-secondary";
const projectActivityBadge = (activity: string) =>
  PROJECT_ACTIVITY_BADGE[activity] ?? "bg-secondary";

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );

  const projectsBtn = target.closest<HTMLElement>(
    '#table-gridjs .projects-btn[data-action="projects"]',
  );

  const newsBtn = target.closest<HTMLElement>(
    '#table-gridjs .news-btn[data-action="news"]',
  );

  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (detailBtn) {
    event.preventDefault();
    const link = detailBtn.getAttribute("data-link");
    if (link) openDetail(link);
    return;
  }

  if (editBtn) {
    event.preventDefault();
    const link = editBtn.getAttribute("data-link");
    if (link) router.push(`/programs/${link}/edit`);
    return;
  }

  if (projectsBtn) {
    event.preventDefault();
    const id = projectsBtn.getAttribute("data-id");
    if (id) router.push(`/programs/${id}/projects`);
    return;
  }

  if (newsBtn) {
    event.preventDefault();
    const id = newsBtn.getAttribute("data-id");
    if (id) router.push(`/programs/${id}/news`);
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
