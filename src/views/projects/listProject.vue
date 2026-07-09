<template>
  <VerticalLayout>
    <!-- Components -->
    <ProjectDetailOffcanvas
      v-model="showDetailOffcanvas"
      :selected-id="selectedProjectId"
      @hide="selectedProjectId = 0"
    />
    <AjuanModal
      v-model="showAjaunModal"
      :project-id="selectedProjectId"
      @success="handleAjuanSuccess"
    />

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
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import ProjectDetailOffcanvas from "./components/ProjectDetailOffcanvas.vue";
import AjuanModal from "./components/AjuanModal.vue";
import { useProjectsTable } from "./components/data";
import router from "@/router";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getAllPrograms } from "@/services/programService";
import { useRoute } from "vue-router";

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
  // handleDelete,
} = useProjectsTable();

// state
const showAjaunModal = ref(false);
const showDetailOffcanvas = ref(false);
const selectedProjectId = ref(0);

const route = useRoute();
watch(
  () => route.query.program_id,
  (id) => {
    selectedProgramId.value = id ? String(id) : "";
  },
  { immediate: true },
);

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

const queryClient = useQueryClient();

const getProgramName = (id: string | number) =>
  programOptions.value.find((p: any) => p.id === Number(id))?.title ??
  String(id);

const openDetail = (id: number) => {
  selectedProjectId.value = id;
  showDetailOffcanvas.value = true;
};

const openAjuan = (id: number) => {
  selectedProjectId.value = id;
  showAjaunModal.value = true;
};

const handleAjuanSuccess = () => {
  showAjaunModal.value = false;
  selectedProjectId.value = 0;
  queryClient.invalidateQueries({ queryKey: ["projects"] });
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  const fundingBtn = target.closest<HTMLElement>(
    '#table-gridjs .funding-btn[data-action="funding"]',
  );
  const ajuanBtn = target.closest<HTMLElement>(
    '#table-gridjs .ajuan-btn[data-action="ajuan"]',
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

  if (fundingBtn) {
    event.preventDefault();
    const id = fundingBtn.getAttribute("data-id");
    if (id) router.push(`/projects/funding/${id}`);
    return;
  }

  if (ajuanBtn) {
    event.preventDefault();
    const id = ajuanBtn.getAttribute("data-id");
    if (id) openAjuan(Number(id));
    return;
  }

  // const kegiatanBtn = target.closest<HTMLElement>(
  //   '#table-gridjs .kegiatan-btn[data-action="kegiatan"]',
  // );
  // const manageBtn = target.closest<HTMLElement>(
  //   '#table-gridjs .manage-btn[data-action="manage"]',
  // );
  // const reportBtn = target.closest<HTMLElement>(
  //   '#table-gridjs .report-btn[data-action="report"]',
  // );
  // const deleteBtn = target.closest<HTMLElement>(
  //   '#table-gridjs .delete-btn[data-action="delete"]',
  // );

  // if (kegiatanBtn) {
  //   event.preventDefault();
  //   const id = kegiatanBtn.getAttribute("data-id");
  //   if (id) router.push(`/projects/kegiatan/${id}`);
  //   return;
  // }

  // if (manageBtn) {
  //   event.preventDefault();
  //   const id = manageBtn.getAttribute("data-id");
  //   if (id) router.push(`/projects/manage/${id}`);
  //   return;
  // }

  // if (reportBtn) {
  //   event.preventDefault();
  //   const id = reportBtn.getAttribute("data-id");
  //   if (id) router.push(`/projects/report/${id}`);
  //   return;
  // }

  // if (deleteBtn) {
  //   event.preventDefault();
  //   const id = deleteBtn.getAttribute("data-id");
  //   if (id) handleDelete(Number(id));
  // }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
