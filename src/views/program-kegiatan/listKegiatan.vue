<template>
  <VerticalLayout>
    <!-- Filter -->
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
          <label class="form-label fw-semibold">Cari</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari judul kegiatan..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <option value="">Semua Tipe</option>
            <option value="Progress">Progress</option>
            <option value="Final">Final</option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Project</label>
          <ChoicesSelect
            id="project"
            :modelValue="selectedProjectId"
            @update:modelValue="
              (val: any) => {
                selectedProjectId = val;
                resetPage();
              }
            "
            :options="projectOptions"
            :isLoading="isProjectLoading"
            :key="projectOptions.length"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Mitra</label>
          <ChoicesSelect
            id="mitra"
            :modelValue="selectedMitraId"
            @update:modelValue="
              (val: any) => {
                selectedMitraId = val;
                resetPage();
              }
            "
            :options="mitraOptions"
            :isLoading="isMitraLoading"
            :key="mitraOptions.length"
          />
        </b-col>
      </b-row>
    </b-card>

    <!-- Detail Offcanvas -->
    <b-offcanvas
      v-model="showDetail"
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
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Kegiatan
          </h5>
          <b-button size="sm" variant="outline-secondary" @click="hide">
            <i class="bx bx-x fs-18"></i>
          </b-button>
        </div>
      </template>

      <div v-if="isDetailLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2 text-muted">Memuat detail...</p>
      </div>
      <div v-else-if="isDetailError" class="alert alert-danger m-0">
        Gagal memuat detail. Silakan coba lagi.
      </div>
      <div v-else-if="kegiatanDetail" class="pb-4">
        <!-- Thumbnail -->
        <div v-if="kegiatanDetail.thumbnail" class="mb-3">
          <img
            :src="`${STORAGE_BASE}${kegiatanDetail.thumbnail}`"
            :alt="kegiatanDetail.judul"
            class="w-100 rounded"
            style="max-height: 220px; object-fit: cover"
          />
        </div>

        <!-- Judul + Badge Tipe -->
        <h5 class="fw-bold mb-2">{{ kegiatanDetail.judul }}</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            :class="[
              'badge',
              kegiatanDetail.type === 'Final' ? 'bg-success' : 'bg-info',
            ]"
            >{{ kegiatanDetail.type }}</span
          >
        </div>

        <hr class="my-3" />

        <!-- Info Grid -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Mitra</small>
              <span class="fw-semibold small">{{
                kegiatanDetail.mitra_name ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">ID Project</small>
              <span class="fw-semibold small">{{
                kegiatanDetail.project_id ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Tanggal Kegiatan</small>
              <span class="fw-semibold small">{{
                formatDate(kegiatanDetail.date)
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Timestamps -->
        <div class="d-flex gap-3 mb-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(kegiatanDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(kegiatanDetail.updated_at)
            }}</small>
          </div>
        </div>

        <hr class="my-3" />

        <!-- Deskripsi -->
        <!-- <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-file-blank me-1"></i>Deskripsi
        </h6>
        <div
          v-if="kegiatanDetail.deskripsi"
          class="small"
          v-html="kegiatanDetail.deskripsi"
        ></div>
        <p v-else class="text-muted small fst-italic">Tidak ada deskripsi.</p> -->
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Kegiatan">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button
              v-if="selectedProjectId"
              variant="primary"
              @click="handleAddKegiatan"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah kegiatan
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error: {{ error?.message || "Coba lagi." }}
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
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useKegiatanTable } from "./components/data";
import { getKegiatanById } from "@/services/kegiatanService";
import { getProjects } from "@/services/projectService";
import { getAllMitra } from "@/services/mitraService";
import { formatDate, formatDateTime } from "@/helpers/format";
import { hasPermission } from "@/helpers/permission";
import router from "@/router";
import { useRoute } from "vue-router";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const isCanCreate = hasPermission("program:create");

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedType,
  selectedProjectId,
  selectedMitraId,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useKegiatanTable();

const route = useRoute();
watch(
  () => route.query.project_id,
  (id) => {
    selectedProjectId.value = id ? Number(id) : "";
  },
  { immediate: true },
);

const handleAddKegiatan = () => {
  if (selectedProjectId.value) {
    router.push(`/kegiatan/create?project_id=${selectedProjectId.value}`);
  } else {
    router.push("/kegiatan/create");
  }
};

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedType.value ||
      selectedProjectId.value !== "" ||
      selectedMitraId.value !== ""
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  selectedProjectId.value = "";
  selectedMitraId.value = "";
  resetPage();
};

const { data: projectList, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getProjects({ mode: "list" }),
});

const { data: mitraList, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitras-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});

const toArray = (data: any) =>
  Array.isArray(data) ? data : (data?.data ?? []);

const projectOptions = computed(() => {
  if (!projectList.value) return [{ value: "", text: "Pilih Project..." }];
  const role = projectList.value ?? [];
  return [
    { value: "", text: "Pilih Project..." },
    ...role.map((item: any) => ({ value: item.id, text: item.judul })),
  ];
});
const mitraOptions = computed(() => {
  if (!mitraList.value) return [{ value: "", text: "Pilih Mitra..." }];
  const role = mitraList.value ?? [];
  return [
    { value: "", text: "Pilih Mitra..." },
    ...role.map((item: any) => ({ value: item.id, text: item.nama })),
  ];
});

// --- Detail Offcanvas ---
const showDetail = ref(false);
const selectedId = ref(0);

const {
  data: kegiatanDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["kegiatan-detail", selectedId.value]),
  queryFn: () => getKegiatanById(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetail.value = true;
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  if (detailBtn) {
    event.preventDefault();
    const id = detailBtn.getAttribute("data-id");
    if (id) openDetail(Number(id));
    return;
  }

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/kegiatan/${id}/edit`);
    return;
  }

  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );
  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
