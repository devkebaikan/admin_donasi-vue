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
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import { useTransactionTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { getPaymentMethod } from "@/services/transactionService";
import ChoicesSelect from "@/components/ChoicesSelect.vue";

const showAdvancedFilter = ref(false);

const { data: paymentMethod, isLoading: loadingPaymentMethod } = useQuery({
  queryKey: ["payment-method"],
  queryFn: getPaymentMethod,
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
    if (id) router.push(`/transactions/${id}`);
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
