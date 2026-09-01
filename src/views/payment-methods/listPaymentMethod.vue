<template>
  <VerticalLayout>
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
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Metode
            Pembayaran
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
      <div v-else-if="paymentMethodDetail" class="pb-4">
        <h5 class="fw-bold mb-2">{{ paymentMethodDetail.account_behalf }}</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            :class="[
              'badge',
              paymentMethodDetail.is_active ? 'bg-success' : 'bg-danger',
            ]"
          >
            {{ paymentMethodDetail.is_active ? "Aktif" : "Nonaktif" }}
          </span>
          <span
            v-if="paymentMethodDetail.bank_reference"
            class="badge bg-primary"
          >
            {{ paymentMethodDetail.bank_reference.name }}
          </span>
          <span
            v-if="paymentMethodDetail.usage"
            class="badge bg-info-subtle text-info"
          >
            {{ paymentMethodDetail.usage }}
          </span>
        </div>

        <!-- Tombol Aksi -->
        <!-- <div class="d-flex gap-2 mb-3">
          <b-button
            :variant="paymentMethodDetail.is_active ? 'danger' : 'success'"
            size="sm"
            class="flex-fill"
            @click="handleToggle(paymentMethodDetail.id, paymentMethodDetail.is_active)"
          >
            <i :class="['bx me-1', paymentMethodDetail.is_active ? 'bx-x-circle' : 'bx-check-circle']"></i>
            {{ paymentMethodDetail.is_active ? "Nonaktifkan" : "Aktifkan" }}
          </b-button>
        </div> -->

        <hr class="my-3" />

        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">No. Rekening</small>
              <span class="fw-semibold small">{{
                paymentMethodDetail.account_number
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Kode</small>
              <span class="fw-semibold small">{{
                paymentMethodDetail.code || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Bank Provider</small>
              <span class="fw-semibold small">{{
                paymentMethodDetail.bank_provider || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Akun Keuangan</small>
              <span class="fw-semibold small">{{
                paymentMethodDetail.fin_akun_detail?.name || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Total Transaksi</small>
              <span class="fw-semibold small">{{
                paymentMethodDetail.transactions_count ?? 0
              }}</span>
            </div>
          </b-col>
        </b-row>

        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-wallet me-1"></i>Keuangan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Saldo Terakhir</small>
              <span class="fw-semibold small">{{
                formatCurrency(paymentMethodDetail.saldo_terakhir ?? 0)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Fee</small>
              <span class="fw-semibold small">
                {{
                  paymentMethodDetail.fee_type === "percentage"
                    ? `${paymentMethodDetail.fee}%`
                    : formatCurrency(paymentMethodDetail.fee ?? 0)
                }}
              </span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />
        <div class="d-flex gap-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(paymentMethodDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(paymentMethodDetail.updated_at)
            }}</small>
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
              placeholder="Cari nama, no. rekening, atau bank..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Bank Reference</label>
          <ChoicesSelect
            id="filter-bank-reference"
            :modelValue="String(selectedBankReferenceId || 0)"
            @update:modelValue="
              (val) => {
                selectedBankReferenceId = val === '0' ? '' : Number(val);
                resetPage();
              }
            "
            :options="bankReferenceOptions"
            :isLoading="isBankReferenceLoading"
            :key="bankReferenceOptions.length"
          />
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsActive" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Status</b-form-select-option>
            </template>
            <b-form-select-option value="true">Aktif</b-form-select-option>
            <b-form-select-option value="false">Nonaktif</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Usage</label>
          <b-form-select v-model="selectedUsage" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Usage</b-form-select-option>
            </template>
            <b-form-select-option value="penampung"
              >Penampung</b-form-select-option
            >
            <b-form-select-option value="penerima"
              >Penerima</b-form-select-option
            >
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
          v-if="selectedBankReferenceId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Bank: {{ selectedBankReferenceLabel }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedBankReferenceId = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedIsActive !== ''"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Status: {{ selectedIsActive === "true" ? "Aktif" : "Nonaktif" }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedIsActive = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedUsage"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Usage: {{ selectedUsage }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedUsage = '';
              resetPage();
            "
          ></i>
        </b-badge>
      </div>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Metode Pembayaran">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" :to="{ name: 'payment-method.create' }">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Metode Pembayaran
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
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { formatCurrency, formatDateTime } from "@/helpers/format";
import { hasPermission } from "@/helpers/permission";
import { usePaymentMethodTable } from "./components/data";
import {
  getPaymentMethodById,
  togglePaymentMethodStatus,
} from "@/services/paymentMethodService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import router from "@/router";

const queryClient = useQueryClient();

const isCanCreate = hasPermission("payment:create");

const {
  tableOptions,
  tableKeyString,
  tableKey,
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
  selectedBankReferenceId,
  selectedIsActive,
  selectedUsage,
} = usePaymentMethodTable();

// ── Bank reference options (filter dropdown) ────────────────────────────────

const { data: bankReferenceData, isLoading: isBankReferenceLoading } = useQuery(
  {
    queryKey: ["bank-references-list"],
    queryFn: () => getAllBankReferences({ mode: "list" }),
  },
);

const bankReferenceOptions = computed(() => {
  const list = Array.isArray(bankReferenceData.value)
    ? bankReferenceData.value
    : [];
  return [
    { value: 0, text: "Semua Bank" },
    ...list.map((b: any) => ({ value: b.id, text: b.name })),
  ];
});

const selectedBankReferenceLabel = computed(
  () =>
    bankReferenceOptions.value.find(
      (o) => o.value === selectedBankReferenceId.value,
    )?.text ?? "",
);

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedBankReferenceId.value ||
      selectedIsActive.value !== "" ||
      selectedUsage.value
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedBankReferenceId.value = "";
  selectedIsActive.value = "";
  selectedUsage.value = "";
  resetPage();
};

// ── Detail Offcanvas ─────────────────────────────────────────────────────────

const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: paymentMethodDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["payment-method-detail", selectedId.value]),
  queryFn: () => getPaymentMethodById(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetailOffcanvas.value = true;
};

// ── Toggle status ────────────────────────────────────────────────────────────

const { mutate: doToggle } = useMutation({
  mutationFn: (id: number) => togglePaymentMethodStatus(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    queryClient.invalidateQueries({
      queryKey: ["payment-method-detail"],
      exact: false,
    });
    tableKey.value++;
  },
  onError: () => {
    Swal.fire({
      title: "Gagal",
      text: "Terjadi kesalahan saat mengubah status.",
      icon: "error",
      confirmButtonColor: "#ff6c2f",
    });
  },
});

const handleToggle = (id: number, currentlyActive: boolean) => {
  const willActivate = !currentlyActive;
  Swal.fire({
    title: willActivate
      ? "Aktifkan metode pembayaran?"
      : "Nonaktifkan metode pembayaran?",
    text: willActivate
      ? "Metode pembayaran ini akan aktif kembali."
      : "Metode pembayaran ini akan disembunyikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: willActivate ? "Ya, aktifkan!" : "Ya, nonaktifkan!",
    cancelButtonText: "Batal",
    confirmButtonColor: willActivate ? "#0acf97" : "#6c757d",
    cancelButtonColor: "#ef5f5f",
  }).then((result: any) => {
    if (result.isConfirmed) doToggle(id);
  });
};

// ── Global click handler ─────────────────────────────────────────────────────

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
    router.push(`/payment-methods/${editBtn.getAttribute("data-id")}/edit`);
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

  const toggleEl = target.closest<HTMLElement>("#table-gridjs .toggle-status");
  if (toggleEl) {
    event.preventDefault();
    const id = toggleEl.getAttribute("data-id");
    const active = toggleEl.getAttribute("data-active");
    if (id) handleToggle(Number(id), active === "true");
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
