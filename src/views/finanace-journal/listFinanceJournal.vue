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
        <!-- Row 1: Cari, Nota Number, Tipe, Has Pair -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Cari</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari nota, keterangan..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Nomor Nota</label>
          <b-form-input
            v-model="selectedNotaNumber"
            placeholder="Filter nomor nota..."
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <option value="">Semua Tipe</option>
            <option value="D">Debit (D)</option>
            <option value="K">Kredit (K)</option>
          </b-form-select>
        </b-col>
        <b-col cols="12" md="2" class="d-flex align-items-end">
          <b-button
            variant="soft-primary"
            class="w-100"
            v-b-toggle.advanced-filter
          >
            <i class="bx bx-slider-alt me-1"></i>
            Lainnya
          </b-button>
        </b-col>
      </b-row>

      <!-- Advanced Filter -->
      <b-collapse id="advanced-filter">
        <hr />
        <b-row class="g3">
          <b-col cols="12" md="4">
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

          <!-- Row 2: Akun, Program, Project -->
          <b-col cols="12" md="4">
            <label class="form-label fw-semibold">Akun</label>
            <ChoicesSelect
              id="akun"
              :modelValue="selectedAkunId"
              @update:modelValue="
                (val: any) => {
                  selectedAkunId = val;
                  resetPage();
                }
              "
              :options="akunOptions"
              :isLoading="isAkunLoading"
              :key="akunOptions.length"
            />
          </b-col>

          <b-col cols="12" md="4">
            <label class="form-label fw-semibold">Program</label>
            <ChoicesSelect
              id="program"
              :modelValue="selectedProgramId"
              @update:modelValue="
                (val: any) => {
                  selectedProgramId = val;
                  resetPage();
                }
              "
              :options="programOptions"
              :isLoading="isProgramLoading"
              :key="programOptions.length"
            />
          </b-col>

          <b-col cols="12" md="2">
            <label class="form-label fw-semibold">Has Pair</label>
            <b-form-select v-model="selectedHasPair" @change="resetPage">
              <option value="">Semua</option>
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </b-form-select>
          </b-col>

          <!-- Row 3: Date range -->
          <b-col cols="12" md="4">
            <label class="form-label fw-semibold"> Rentang Tanggal </label>

            <FlatPicker
              id="tx-date-range"
              v-model="dateRange"
              placeholder="Pilih rentang tanggal..."
              :options="{
                mode: 'range',
                dateFormat: 'Y-m-d',
              }"
              @update:model-value="resetPage"
            />
          </b-col>
        </b-row>
      </b-collapse>
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
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Jurnal
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
      <div v-else-if="journalDetail" class="pb-4">
        <!-- Nota + Badge Tipe -->
        <h5 class="fw-bold mb-1">{{ journalDetail.nota_number ?? "-" }}</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            :class="[
              'badge',
              journalDetail.type === 'K' ? 'bg-success' : 'bg-primary',
            ]"
          >
            {{
              journalDetail.type === "K"
                ? "Kredit"
                : journalDetail.type === "D"
                  ? "Debit"
                  : journalDetail.type
            }}
          </span>
        </div>

        <hr class="my-3" />

        <!-- Keuangan -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Nominal
        </h6>
        <div class="bg-light rounded p-3 mb-3">
          <span class="fw-bold fs-5 text-dark">{{
            formatCurrency(journalDetail.nominal)
          }}</span>
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
              <small class="text-muted d-block">Tanggal</small>
              <span class="fw-semibold small">{{
                formatDate(journalDetail.date)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Akun ID</small>
              <span class="fw-semibold small">{{
                journalDetail.akun_id ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Payment Method ID</small>
              <span class="fw-semibold small">{{
                journalDetail.payment_method_id ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Pair ID</small>
              <span class="fw-semibold small">{{
                journalDetail.pair_id ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Keterangan</small>
              <span class="fw-semibold small">{{
                journalDetail.keterangan ?? "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Deskripsi Luar</small>
              <span class="small">{{
                journalDetail.outside_description ?? "-"
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Timestamps -->
        <div class="d-flex gap-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(journalDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(journalDetail.updated_at)
            }}</small>
          </div>
        </div>
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Jurnal Keuangan">
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
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useFinanceJournalTable } from "./components/data";
import { getFinanceJournalById } from "@/services/financeJournalService";
import { getFinanceAccounts } from "@/services/financeAccountService";
import { getAllPrograms } from "@/services/programService";
import { getProjects } from "@/services/projectService";
import { formatCurrency, formatDate, formatDateTime } from "@/helpers/format";

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedType,
  selectedAkunId,
  selectedProgramId,
  selectedProjectId,
  selectedNotaNumber,
  selectedHasPair,
  dateRange,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
} = useFinanceJournalTable();

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedType.value ||
      selectedAkunId.value !== "" ||
      selectedProgramId.value !== "" ||
      selectedProjectId.value !== "" ||
      selectedNotaNumber.value ||
      selectedHasPair.value !== "" ||
      dateRange.value
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  selectedAkunId.value = "";
  selectedProgramId.value = "";
  selectedProjectId.value = "";
  selectedNotaNumber.value = "";
  selectedHasPair.value = "";
  dateRange.value = "";
  resetPage();
};

// --- Dropdown options ---
const toArray = (data: any) =>
  Array.isArray(data) ? data : (data?.data ?? []);

const { data: akunList, isLoading: isAkunLoading } = useQuery({
  queryKey: ["finance-akun-list"],
  queryFn: () => getFinanceAccounts({ mode: "list" }),
});

const { data: programList, isLoading: isProgramLoading } = useQuery({
  queryKey: ["programs-list"],
  queryFn: () => getAllPrograms({ mode: "list" }),
});

const { data: projectList, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getProjects({ mode: "list" }),
});

const akunOptions = computed(() => {
  if (!akunList.value) return [{ value: "", text: "Pilih Akun..." }];
  const role = akunList.value ?? [];
  return [
    { value: "", text: "Pilih Akun..." },
    ...role.map((item: any) => ({
      value: item.id,
      text: `${item.number}-${item.name}`,
    })),
  ];
});

const programOptions = computed(() => {
  if (!programList.value) return [{ value: "", text: "Pilih program..." }];
  const role = programList.value ?? [];
  return [
    { value: "", text: "Pilih program..." },
    ...role.map((item: any) => ({
      value: item.id,
      text: `${item.title}`,
    })),
  ];
});
const projectOptions = computed(() => {
  if (!projectList.value) return [{ value: "", text: "Pilih proyek..." }];
  const role = projectList.value ?? [];
  return [
    { value: "", text: "Pilih proyek..." },
    ...role.map((item: any) => ({
      value: item.id,
      text: `${item.judul}`,
    })),
  ];
});

// --- Detail Offcanvas ---
const showDetail = ref(false);
const selectedId = ref(0);

const {
  data: journalDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["finance-journal-detail", selectedId.value]),
  queryFn: () => getFinanceJournalById(selectedId.value),
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
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
