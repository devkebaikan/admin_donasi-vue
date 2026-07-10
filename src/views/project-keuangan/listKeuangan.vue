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
              placeholder="Cari items atau nota..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Project</label>
          <ChoicesSelect
            id="filter-project"
            :modelValue="String(selectedProjectId || '')"
            @update:modelValue="
              (val: any) => {
                selectedProjectId = val === '' ? '' : Number(val);
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
            :modelValue="String(selectedKegiatanId || '')"
            @update:modelValue="
              (val: any) => {
                selectedKegiatanId = val === '' ? '' : Number(val);
                resetPage();
              }
            "
            :options="kegiatanOptions"
            :isLoading="isKegiatanLoading"
            :key="kegiatanOptions.length"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Mitra</label>
          <ChoicesSelect
            id="filter-mitra"
            :modelValue="String(selectedMitraId || '')"
            @update:modelValue="
              (val: any) => {
                selectedMitraId = val === '' ? '' : Number(val);
                resetPage();
              }
            "
            :options="mitraOptions"
            :isLoading="isMitraLoading"
            :key="mitraOptions.length"
          />
        </b-col>
      </b-row>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="d-flex flex-wrap gap-2 align-items-center mt-3"
      >
        <span class="text-muted small">Filter aktif:</span>
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
          v-if="selectedProjectId !== ''"
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
          v-if="selectedKegiatanId !== ''"
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
          v-if="selectedMitraId !== ''"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Mitra: {{ selectedMitraLabel }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedMitraId = '';
              resetPage();
            "
          ></i>
        </b-badge>
      </div>
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
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Keuangan
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
      <div v-else-if="keuanganDetail" class="pb-4">
        <!-- Judul items -->
        <h5 class="fw-bold mb-2">{{ keuanganDetail.items }}</h5>

        <hr class="my-3" />

        <!-- Info Grid -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi Keuangan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nominal</small>
              <span class="fw-semibold text-success">
                {{ formatCurrency(keuanganDetail.nominal) }}
              </span>
            </div>
          </b-col>
          <b-col cols="12">
            <div v-if="keuanganDetail.nota" class="rounded p-2">
              <small class="text-muted d-block">Nota</small>
              <img
                :src="keuanganDetail.nota"
                :alt="keuanganDetail.items"
                class="w-100 rounded"
                style="max-height: 220px; object-fit: cover"
              />
              <!-- <span class="fw-semibold small">{{
                keuanganDetail.nota || "-"
              }}</span> -->
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Mitra -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-buildings me-1"></i>Mitra
        </h6>
        <div
          v-if="keuanganDetail.mitra"
          class="d-flex align-items-center gap-3 bg-light rounded p-2 mb-3"
        >
          <img
            v-if="keuanganDetail.mitra.image_url"
            :src="keuanganDetail.mitra.image_url"
            :alt="keuanganDetail.mitra.nama"
            class="rounded-circle"
            style="width: 40px; height: 40px; object-fit: cover; flex-shrink: 0"
          />
          <div
            v-else
            class="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px; flex-shrink: 0"
          >
            <i class="bx bx-buildings text-white fs-18"></i>
          </div>
          <div>
            <div class="fw-semibold small">{{ keuanganDetail.mitra.nama }}</div>
            <div v-if="keuanganDetail.mitra.wa" class="text-muted small">
              <i class="bx bxl-whatsapp me-1"></i>{{ keuanganDetail.mitra.wa }}
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">Tidak ada data mitra.</p>

        <hr class="my-3" />

        <!-- Timestamps -->
        <div class="d-flex gap-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(keuanganDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(keuanganDetail.updated_at)
            }}</small>
          </div>
        </div>
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Project Keuangan">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              v-if="selectedProjectId"
              variant="primary"
              @click="handleAddKeuangan"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Keuangan
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
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { useKeuanganTable } from "./components/data";
import { getKeuanganById } from "@/services/projectKeuanganService";
import { getAllProjects } from "@/services/projectService";
import { getAllKegiatan } from "@/services/kegiatanService";
import { getAllMitra } from "@/services/mitraService";
import { formatCurrency, formatDateTime } from "@/helpers/format";
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
  selectedProjectId,
  selectedKegiatanId,
  selectedMitraId,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useKeuanganTable();

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedProjectId.value !== "" ||
      selectedKegiatanId.value !== "" ||
      selectedMitraId.value !== ""
    ),
);

const route = useRoute();
watch(
  () => route.query.project_id,
  (id) => {
    selectedProjectId.value = id ? Number(id) : "";
  },
  { immediate: true },
);

const handleAddKeuangan = () => {
  if (selectedProjectId.value) {
    router.push(`/keuangan/create?project_id=${selectedProjectId.value}`);
  } else {
    router.push("/keuangan/create");
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedProjectId.value = "";
  selectedKegiatanId.value = "";
  selectedMitraId.value = "";
  resetPage();
};

const { data: projectList, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getAllProjects({ mode: "list" }),
});

const { data: kegiatanList, isLoading: isKegiatanLoading } = useQuery({
  queryKey: ["kegiatans-list"],
  queryFn: () => getAllKegiatan({ mode: "list" }),
});

const { data: mitraList, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitras-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});

const toArray = (data: any) =>
  Array.isArray(data) ? data : (data?.data ?? []);

const projectOptions = computed(() => {
  const list = toArray(projectList.value);
  return [
    { value: "", text: "Semua Project" },
    ...list.map((item: any) => ({
      value: item.id,
      text: item.nama ?? item.judul,
    })),
  ];
});

const kegiatanOptions = computed(() => {
  const list = toArray(kegiatanList.value);
  return [
    { value: "", text: "Semua Kegiatan" },
    ...list.map((item: any) => ({
      value: item.id,
      text: item.nama ?? item.judul,
    })),
  ];
});

const mitraOptions = computed(() => {
  const list = toArray(mitraList.value);
  return [
    { value: "", text: "Semua Mitra" },
    ...list.map((item: any) => ({ value: item.id, text: item.nama })),
  ];
});

const selectedProjectLabel = computed(
  () =>
    projectOptions.value.find((o) => o.value === selectedProjectId.value)
      ?.text ?? String(selectedProjectId.value),
);

const selectedKegiatanLabel = computed(
  () =>
    kegiatanOptions.value.find((o) => o.value === selectedKegiatanId.value)
      ?.text ?? String(selectedKegiatanId.value),
);

const selectedMitraLabel = computed(
  () =>
    mitraOptions.value.find((o) => o.value === selectedMitraId.value)?.text ??
    String(selectedMitraId.value),
);

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: keuanganDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["keuangan-detail", selectedId.value]),
  queryFn: () => getKeuanganById(selectedId.value),
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
    if (id) router.push(`/keuangan/${id}/edit`);
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
