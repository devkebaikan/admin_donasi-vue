<template>
  <VerticalLayout>
    <!-- Filters -->
    <b-card class="mb-3 shadow-sm">
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

      <!-- Search -->
      <b-row class="g-3">
        <b-col cols="12">
          <label class="form-label fw-semibold">Pencarian</label>

          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>

            <b-form-input
              v-model="searchQuery"
              placeholder="Cari invoice, catatan, source, user..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>
      </b-row>

      <!-- Main Filters -->
      <b-row class="g-3 mt-1">
        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Status</label>

          <b-form-select v-model="selectedStatus" @change="resetPage">
            <template #first>
              <b-form-select-option value="">
                Semua Status
              </b-form-select-option>
            </template>

            <b-form-select-option value="Paid"> Paid </b-form-select-option>

            <b-form-select-option value="Pending">
              Pending
            </b-form-select-option>

            <b-form-select-option value="Canceled">
              Canceled
            </b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold"> Payment Method </label>

          <ChoicesSelect
            id="payment-method"
            :modelValue="filterPaymentMethodId"
            @update:modelValue="
              (val) => {
                filterPaymentMethodId = val;
                resetPage();
              }
            "
            :options="paymentList"
            :isLoading="loadingPaymentMethod"
            :key="paymentList.length"
          />
        </b-col>

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

        <b-row class="g-3">
          <b-col cols="12" md="3">
            <label class="form-label fw-semibold"> Invoice </label>

            <b-form-input
              v-model="filterInvoice"
              placeholder="Nomor invoice"
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-col>

          <b-col cols="12" md="3">
            <label class="form-label fw-semibold"> User ID </label>

            <b-form-input
              v-model="filterUserId"
              type="number"
              placeholder="User ID"
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-col>

          <b-col cols="12" md="3">
            <label class="form-label fw-semibold"> Source </label>

            <b-form-input
              v-model="selectedSource"
              placeholder="Source"
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-col>

          <b-col cols="12" md="3">
            <label class="form-label fw-semibold"> Min Total </label>

            <b-form-input
              v-model="filterMinTotal"
              type="number"
              placeholder="0"
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-col>

          <b-col cols="12" md="3">
            <label class="form-label fw-semibold"> Max Total </label>

            <b-form-input
              v-model="filterMaxTotal"
              type="number"
              placeholder="999999999"
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-col>
        </b-row>
      </b-collapse>

      <!-- Active Filter -->
      <div
        v-if="hasActiveFilters"
        class="mb-3 d-flex flex-wrap gap-2 align-items-center mt-4"
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
          v-if="filterPaymentMethodId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Payment: {{ filterPaymentMethodId }}
          <i
            class="bx bx-x cursor-pointer"
            @click="filterPaymentMethodId = ''"
          ></i>
        </b-badge>

        <b-badge
          v-if="dateRange"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Tanggal: {{ dateRange }}
          <i class="bx bx-x cursor-pointer" @click="dateRange = ''"></i>
        </b-badge>

        <b-badge
          v-if="filterInvoice"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Invoice: {{ filterInvoice }}
          <i class="bx bx-x cursor-pointer" @click="filterInvoice = ''"></i>
        </b-badge>

        <b-badge
          v-if="selectedSource"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Source: {{ selectedSource }}
          <i class="bx bx-x cursor-pointer" @click="selectedSource = ''"></i>
        </b-badge>

        <b-badge
          v-if="filterUserId"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          User ID: {{ filterUserId }}
          <i class="bx bx-x cursor-pointer" @click="filterUserId = ''"></i>
        </b-badge>

        <b-badge
          v-if="filterMinTotal"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Min Total: {{ filterMinTotal }}
          <i class="bx bx-x cursor-pointer" @click="filterMinTotal = ''"></i>
        </b-badge>

        <b-badge
          v-if="filterMaxTotal"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Max Total: {{ filterMaxTotal }}
          <i class="bx bx-x cursor-pointer" @click="filterMaxTotal = ''"></i>
        </b-badge>
      </div>
    </b-card>

    <!-- ----------------------------------------------------- Detail Offcanvas ----------------------------------------------------- -->
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
            <i class="bx bx-receipt me-1 text-primary"></i>Detail Transaksi
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
      <div v-else-if="txDetail" class="pb-4">
        <!-- Invoice + Status -->
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <span class="font-monospace fw-bold fs-6">{{
            txDetail.invoice
          }}</span>
          <span :class="['badge', statusBadgeClass(txDetail.status)]">{{
            txDetail.status
          }}</span>
          <span class="badge bg-light text-dark border">{{
            txDetail.source
          }}</span>
        </div>

        <hr class="my-3" />

        <!-- Informasi Pembayar -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-user me-1"></i>Informasi Pembayar
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nama</small>
              <span class="fw-semibold small">{{
                txDetail.user?.name || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">No. Telepon</small>
              <span class="fw-semibold small">{{
                txDetail.user?.phone || "-"
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Detail Donasi -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-list-ul me-1"></i>Detail Donasi
          <span class="ms-1 badge bg-secondary">{{
            txDetail.transaction_details?.length ?? 0
          }}</span>
        </h6>
        <div
          v-if="txDetail.transaction_details?.length"
          class="d-flex flex-column gap-3"
        >
          <div
            v-for="detail in txDetail.transaction_details"
            :key="detail.id"
            class="border rounded p-3"
          >
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="fw-semibold small">
                {{ detail.program?.name || "-" }}
              </div>
              <span :class="['badge', activityBadgeClass(detail.activity)]">{{
                detail.activity
              }}</span>
            </div>
            <b-row class="g-2">
              <b-col cols="6">
                <small class="text-muted d-block">Gross Nominal</small>
                <small class="fw-semibold">{{
                  formatCurrency(detail.gross_nominal)
                }}</small>
              </b-col>
              <b-col cols="6">
                <small class="text-muted d-block">Nominal Bersih</small>
                <small class="fw-semibold text-success">{{
                  formatCurrency(detail.nominal)
                }}</small>
              </b-col>
              <b-col cols="6">
                <small class="text-muted d-block">Operasional</small>
                <small class="fw-semibold">{{
                  formatCurrency(detail.operasional)
                }}</small>
              </b-col>
              <b-col cols="6">
                <small class="text-muted d-block">Komisi</small>
                <small class="fw-semibold">{{
                  formatCurrency(detail.komisi)
                }}</small>
              </b-col>
              <b-col cols="6">
                <small class="text-muted d-block">Fee</small>
                <small class="fw-semibold">{{
                  formatCurrency(detail.fee)
                }}</small>
              </b-col>
              <b-col cols="6">
                <small class="text-muted d-block">Diskon</small>
                <small class="fw-semibold">{{
                  formatCurrency(detail.discount)
                }}</small>
              </b-col>
              <b-col v-if="detail.refund" cols="6">
                <small class="text-muted d-block">Refund</small>
                <small class="fw-semibold text-danger">{{
                  formatCurrency(detail.refund)
                }}</small>
              </b-col>
            </b-row>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Tidak ada detail donasi.
        </p>

        <hr class="my-3" />

        <!-- Informasi Transaksi -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi Transaksi
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Tanggal</small>
              <span class="fw-semibold small">{{
                formatDate(txDetail.date)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Jenis Transaksi</small>
              <span class="fw-semibold small">{{
                txDetail.transaction_type?.name || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">No. Order</small>
              <span class="fw-semibold small">#{{ txDetail.order }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Anonim</small>
              <span class="fw-semibold small">{{
                txDetail.anonim ? "Ya" : "Tidak"
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Metode Pembayaran -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-credit-card me-1"></i>Metode Pembayaran
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Bank / Provider</small>
              <span class="fw-semibold small text-capitalize">{{
                txDetail.payment_method?.bank_provider || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Atas Nama</small>
              <span class="fw-semibold small">{{
                txDetail.payment_method?.account_behalf || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">No. Rekening</small>
              <span class="fw-semibold small font-monospace">{{
                txDetail.payment_method?.account_number || "-"
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Ringkasan Keuangan -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Ringkasan Keuangan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Harga</small>
              <span class="fw-semibold small">{{
                formatCurrency(txDetail.price)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Diskon</small>
              <span class="fw-semibold small">{{
                formatCurrency(txDetail.discount)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Biaya Aplikasi</small>
              <span class="fw-semibold small">{{
                formatCurrency(txDetail.application_fee)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Fee Detail</small>
              <span class="fw-semibold small">{{
                formatCurrency(txDetail.fee_detail)
              }}</span>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="rounded p-2" style="background: #e8f4ff">
              <small class="text-muted d-block">Total</small>
              <span class="fw-bold text-primary">{{
                formatCurrency(txDetail.total)
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Timestamps -->
        <div class="d-flex gap-3">
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(txDetail.updated_at)
            }}</small>
          </div>
        </div>
      </div>
    </b-offcanvas>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Transaksi">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/transactions/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Transaksi
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data transaksi...</p>
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
                {{ totalRows }} transaksi)
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import { useTransactionTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { getTransactionById } from "@/services/transactionService";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { formatCurrency, formatDateTime, formatDate } from "@/helpers/format";
import { getAllPaymentMethods } from "@/services/paymentMethodService";
import { useRoute } from "vue-router";

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedId = ref(0);
const route = useRoute();

const {
  data: txDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["transaction-detail", selectedId.value]),
  queryFn: () => getTransactionById(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const STATUS_BADGE: Record<string, string> = {
  Paid: "bg-success",
  Pending: "bg-warning text-dark",
  Canceled: "bg-danger",
};
const statusBadgeClass = (s: string) => STATUS_BADGE[s] ?? "bg-secondary";

const ACTIVITY_BADGE: Record<string, string> = {
  "Waiting for payment": "bg-warning text-dark",
  Paid: "bg-success",
  Canceled: "bg-danger",
  Refunded: "bg-info",
};
const activityBadgeClass = (s: string) => ACTIVITY_BADGE[s] ?? "bg-secondary";

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetailOffcanvas.value = true;
};

const { data: paymentMethod, isLoading: loadingPaymentMethod } = useQuery({
  queryKey: ["payment-method"],
  queryFn: getAllPaymentMethods,
});

const paymentList = computed(() => {
  if (!paymentMethod.value) return [{ value: "", text: "Payment method" }];
  return [
    { value: "", text: "Payment method" },
    ...paymentMethod.value?.map((item: any) => ({
      value: item.id,
      text: item.name,
    })),
  ];
});

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedStatus,
  selectedSource,
  dateRange,
  filterUserId,
  filterPaymentMethodId,
  filterInvoice,
  filterMinTotal,
  filterMaxTotal,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useTransactionTable();

watch(
  () => route.query.user_id,
  (id) => {
    filterUserId.value = id ? String(id) : "";
  },
  { immediate: true },
);

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      filterInvoice.value ||
      selectedStatus.value ||
      selectedSource.value ||
      dateRange.value ||
      filterUserId.value ||
      filterPaymentMethodId.value ||
      filterMinTotal.value ||
      filterMaxTotal.value
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  filterInvoice.value = "";
  selectedStatus.value = "";
  selectedSource.value = "";
  dateRange.value = "";
  filterUserId.value = "";
  filterPaymentMethodId.value = "";
  filterMinTotal.value = "";
  filterMaxTotal.value = "";
  resetPage();
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
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
    if (id) router.push(`/transactions/${id}/edit`);
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
