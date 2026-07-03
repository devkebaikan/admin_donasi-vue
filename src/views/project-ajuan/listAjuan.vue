<template>
  <VerticalLayout>
    <!-- Filter -->
    <b-card class="mb-3 shadow-sm">
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

      <!-- Search -->
      <b-row class="g-3">
        <b-col cols="12">
          <label class="form-label fw-semibold">Pencarian</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari atas nama atau nomor rekening..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>
      </b-row>

      <!-- Filter Utama -->
      <b-row class="g-3 mt-1">
        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Tipe</b-form-select-option>
            </template>
            <b-form-select-option value="ajuan">Ajuan</b-form-select-option>
            <b-form-select-option value="refund">Refund</b-form-select-option>
            <b-form-select-option value="more">More</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedStatus" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Status</b-form-select-option>
            </template>
            <b-form-select-option value="proposed"
              >Proposed</b-form-select-option
            >
            <b-form-select-option value="accepted"
              >Accepted</b-form-select-option
            >
            <b-form-select-option value="rejected"
              >Rejected</b-form-select-option
            >
          </b-form-select>
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

        <b-col cols="12" md="2" class="d-flex align-items-end">
          <b-button
            variant="soft-primary"
            class="w-100"
            v-b-toggle.ajuan-advanced-filter
          >
            <i class="bx bx-slider-alt me-1"></i>Lainnya
          </b-button>
        </b-col>
      </b-row>

      <!-- Filter Lanjutan -->
      <b-collapse id="ajuan-advanced-filter">
        <hr />
        <b-row class="g-3">
          <b-col cols="12" md="3">
            <label class="form-label fw-semibold">Activity</label>
            <b-form-select v-model="selectedActivity" @change="resetPage">
              <template #first>
                <b-form-select-option value=""
                  >Semua Activity</b-form-select-option
                >
              </template>
              <b-form-select-option value="proposed"
                >Proposed</b-form-select-option
              >
              <b-form-select-option value="pending"
                >Pending</b-form-select-option
              >
              <b-form-select-option value="accepted"
                >Accepted</b-form-select-option
              >
              <b-form-select-option value="claimed"
                >Claimed</b-form-select-option
              >
            </b-form-select>
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
        </b-row>
      </b-collapse>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="d-flex flex-wrap gap-2 align-items-center mt-4"
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
          v-if="selectedType"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Tipe: {{ TYPE_LABEL[selectedType] ?? selectedType }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedType = '';
              resetPage();
            "
          ></i>
        </b-badge>

        <b-badge
          v-if="selectedStatus"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Status: {{ STATUS_LABEL[selectedStatus] ?? selectedStatus }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedStatus = '';
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

        <b-badge
          v-if="selectedActivity"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Activity: {{ ACTIVITY_LABEL[selectedActivity] ?? selectedActivity }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedActivity = '';
              resetPage();
            "
          ></i>
        </b-badge>

        <b-badge
          v-if="dateRange"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Dari: {{ dateRange }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              dateRange = '';
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
            <i class="bx bx-info-circle me-1 text-primary"></i>Detail Ajuan
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
      <div v-else-if="ajuanDetail" class="pb-4">
        <!-- Judul + badges -->
        <h5 class="fw-bold mb-2">{{ ajuanDetail.account_behalf }}</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span :class="['badge', typeBadgeClass(ajuanDetail.type)]">
            {{ ajuanDetail.type }}
          </span>
          <span :class="['badge', statusBadgeClass(ajuanDetail.status)]">
            {{ ajuanDetail.status }}
          </span>
          <span :class="['badge', activityBadgeClass(ajuanDetail.activity)]">
            {{ ajuanDetail.activity }}
          </span>
        </div>

        <!-- Tombol Aksi -->
        <div
          v-if="ajuanDetail.activity === 'proposed'"
          class="d-flex gap-2 mb-3"
        >
          <template v-if="ajuanDetail.type === 'ajuan'">
            <b-button
              variant="success"
              size="sm"
              class="flex-fill"
              @click="
                openAcceptModal(ajuanDetail.id, ajuanDetail.nominal_ajuan)
              "
            >
              <i class="bx bx-check-circle me-1"></i>Terima Ajuan
            </b-button>
            <b-button
              variant="danger"
              size="sm"
              class="flex-fill"
              @click="handleRejectAjuan(ajuanDetail.id)"
            >
              <i class="bx bx-x-circle me-1"></i>Tolak Ajuan
            </b-button>
          </template>
          <template v-else-if="ajuanDetail.type === 'refund'">
            <b-button
              variant="success"
              size="sm"
              class="flex-fill"
              @click="handleAcceptRefund(ajuanDetail.id)"
            >
              <i class="bx bx-check-circle me-1"></i>Terima Refund
            </b-button>
            <b-button
              variant="danger"
              size="sm"
              class="flex-fill"
              @click="handleRejectRefund(ajuanDetail.id)"
            >
              <i class="bx bx-x-circle me-1"></i>Tolak Refund
            </b-button>
          </template>
        </div>

        <hr class="my-3" />

        <!-- Info Keuangan -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-money me-1"></i>Informasi Keuangan
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="12">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nominal Ajuan</small>
              <span class="fw-semibold text-success fs-6">
                {{ formatCurrency(ajuanDetail.nominal_ajuan) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Biaya</small>
              <span class="fw-semibold small">{{
                formatCurrency(ajuanDetail.biaya)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Claim Used</small>
              <span class="fw-semibold small">{{
                formatCurrency(ajuanDetail.claim_used)
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Program Saldo Used</small>
              <span class="fw-semibold small">{{
                formatCurrency(ajuanDetail.program_saldo_used)
              }}</span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Info Rekening -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-credit-card me-1"></i>Informasi Rekening
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Atas Nama</small>
              <span class="fw-semibold small">{{
                ajuanDetail.account_behalf || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Nomor Rekening</small>
              <span class="fw-semibold small">{{
                ajuanDetail.account_number || "-"
              }}</span>
            </div>
          </b-col>
          <b-col cols="12" v-if="ajuanDetail.bank_reference">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Bank</small>
              <span class="fw-semibold small">
                {{ ajuanDetail.bank_reference.name }}
                <span class="text-muted ms-1"
                  >({{ ajuanDetail.bank_reference.code }})</span
                >
              </span>
            </div>
          </b-col>
        </b-row>

        <hr class="my-3" />

        <!-- Project -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-folder me-1"></i>Project
        </h6>
        <div v-if="ajuanDetail.project" class="bg-light rounded p-2 mb-3">
          <div class="fw-semibold small">{{ ajuanDetail.project.name }}</div>
          <small class="text-muted"
            >Status: {{ ajuanDetail.project.status }}</small
          >
        </div>
        <p v-else class="text-muted small fst-italic">
          Tidak ada data project.
        </p>

        <hr class="my-3" />

        <!-- Mitra -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-buildings me-1"></i>Mitra
        </h6>
        <div
          v-if="ajuanDetail.mitra"
          class="d-flex align-items-center gap-3 bg-light rounded p-2 mb-3"
        >
          <img
            v-if="ajuanDetail.mitra.image_url"
            :src="ajuanDetail.mitra.image_url"
            :alt="ajuanDetail.mitra.nama"
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
            <div class="fw-semibold small">{{ ajuanDetail.mitra.nama }}</div>
            <div v-if="ajuanDetail.mitra.wa" class="text-muted small">
              <i class="bx bxl-whatsapp me-1"></i>{{ ajuanDetail.mitra.wa }}
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">Tidak ada data mitra.</p>

        <hr class="my-3" />

        <!-- User -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-user me-1"></i>Pengaju
        </h6>
        <div v-if="ajuanDetail.user" class="bg-light rounded p-2 mb-3">
          <div class="fw-semibold small">{{ ajuanDetail.user.name }}</div>
          <div v-if="ajuanDetail.user.phone" class="text-muted small">
            <i class="bx bx-phone me-1"></i>{{ ajuanDetail.user.phone }}
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Tidak ada data pengaju.
        </p>

        <hr class="my-3" />

        <!-- Timestamps -->
        <div class="d-flex gap-3">
          <div>
            <small class="text-muted d-block">Dibuat</small>
            <small class="fw-semibold">{{
              formatDateTime(ajuanDetail.created_at)
            }}</small>
          </div>
          <div>
            <small class="text-muted d-block">Diperbarui</small>
            <small class="fw-semibold">{{
              formatDateTime(ajuanDetail.updated_at)
            }}</small>
          </div>
        </div>
      </div>
    </b-offcanvas>

    <!-- Modal Terima Ajuan -->
    <b-modal
      v-model="showAcceptModal"
      title="Terima Ajuan"
      centered
      :ok-disabled="isAcceptPending"
      ok-title="Terima"
      cancel-title="Batal"
      ok-variant="success"
      @ok.prevent="handleAcceptAjuan"
    >
      <b-row class="g-3">
        <b-col cols="12">
          <b-form-group label="Nominal Ajuan" label-for="accept-nominal">
            <b-input-group prepend="Rp">
              <CurrencyInput
                id="accept-nominal"
                v-model="acceptForm.nominal_ajuan"
                placeholder="0"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12">
          <b-form-group label="Biaya" label-for="accept-biaya">
            <b-input-group prepend="Rp">
              <CurrencyInput
                id="accept-biaya"
                v-model="acceptForm.biaya"
                placeholder="0"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12">
          <b-form-group label="Metode Pembayaran" label-for="accept-payment">
            <ChoicesSelect
              id="accept-payment"
              :modelValue="String(acceptForm.payment_method_id || 0)"
              @update:modelValue="
                (val: any) => {
                  acceptForm.payment_method_id = val === '0' ? 0 : Number(val);
                }
              "
              :options="paymentMethodOptions"
              :isLoading="isPaymentMethodLoading"
              :key="paymentMethodOptions.length"
            />
            <div v-if="acceptFormError" class="invalid-feedback d-block">
              {{ acceptFormError }}
            </div>
          </b-form-group>
        </b-col>
      </b-row>
      <div v-if="isAcceptPending" class="text-center mt-3">
        <b-spinner variant="success" small class="me-1" />
        <span class="text-muted small">Memproses...</span>
      </div>
    </b-modal>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Project Ajuan">
          <div class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/ajuan/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Ajuan
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
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import CurrencyInput from "@/components/CurrencyInput.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import { useAjuanTable } from "./components/data";
import {
  getAjuanById,
  acceptAjuan,
  rejectAjuan,
  acceptRefund,
  rejectRefund,
} from "@/services/ajuanService";
import { getAllMitra } from "@/services/mitraService";

import { formatCurrency, formatDateTime } from "@/helpers/format";
import router from "@/router";
import { getPaymentMethod } from "@/services/paymentMethodService";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const TYPE_LABEL: Record<string, string> = {
  ajuan: "Ajuan",
  refund: "Refund",
  more: "More",
};
const STATUS_LABEL: Record<string, string> = {
  proposed: "Proposed",
  accepted: "Accepted",
  rejected: "Rejected",
};
const ACTIVITY_LABEL: Record<string, string> = {
  proposed: "Proposed",
  pending: "Pending",
  accepted: "Accepted",
  claimed: "Claimed",
};

const TYPE_BADGE: Record<string, string> = {
  ajuan: "bg-primary",
  refund: "bg-warning",
  more: "bg-info",
};
const STATUS_BADGE: Record<string, string> = {
  proposed: "bg-secondary",
  accepted: "bg-success",
  rejected: "bg-danger",
};
const ACTIVITY_BADGE: Record<string, string> = {
  proposed: "bg-secondary",
  pending: "bg-warning",
  accepted: "bg-success",
  claimed: "bg-info",
};

const typeBadgeClass = (s: string) => TYPE_BADGE[s] ?? "bg-secondary";
const statusBadgeClass = (s: string) => STATUS_BADGE[s] ?? "bg-secondary";
const activityBadgeClass = (s: string) => ACTIVITY_BADGE[s] ?? "bg-secondary";

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  selectedMitraId,
  selectedStatus,
  selectedActivity,
  selectedType,
  currentPage,
  perPageItem,
  dateRange,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useAjuanTable();

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedType.value ||
      selectedStatus.value ||
      selectedMitraId.value !== "" ||
      selectedActivity.value ||
      dateRange.value
    ),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  selectedStatus.value = "";
  selectedMitraId.value = "";
  selectedActivity.value = "";
  dateRange.value = "";
  resetPage();
};

const { data: mitraList, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitras-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});

const toArray = (data: any) =>
  Array.isArray(data) ? data : (data?.data ?? []);

const mitraOptions = computed(() => {
  const list = toArray(mitraList.value);
  return [
    { value: "", text: "Semua Mitra" },
    ...list.map((item: any) => ({ value: item.id, text: item.nama })),
  ];
});

const selectedMitraLabel = computed(
  () =>
    mitraOptions.value.find((o) => o.value === selectedMitraId.value)?.text ??
    String(selectedMitraId.value),
);

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedId = ref(0);

const {
  data: ajuanDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["ajuan-detail", selectedId.value]),
  queryFn: () => getAjuanById(selectedId.value),
  enabled: computed(() => selectedId.value > 0),
});

const openDetail = (id: number) => {
  selectedId.value = id;
  showDetailOffcanvas.value = true;
};

// --- Accept Ajuan Modal ---
const showAcceptModal = ref(false);
const acceptingId = ref(0);
const acceptFormError = ref("");
const acceptForm = reactive({
  nominal_ajuan: 0,
  biaya: 0,
  payment_method_id: 0,
});

const { data: paymentMethodData, isLoading: isPaymentMethodLoading } = useQuery(
  {
    queryKey: ["payment-methods"],
    queryFn: () => getPaymentMethod({ is_active: true }),
  },
);

const paymentMethodOptions = computed(() => {
  const list = Array.isArray(paymentMethodData.value)
    ? paymentMethodData.value
    : [];
  return [
    { value: 0, text: "-- Pilih Metode Pembayaran --" },
    ...list.map((p: any) => ({ value: p.id, text: p.name })),
  ];
});

const openAcceptModal = (id: number, nominal: number) => {
  acceptingId.value = id;
  acceptForm.nominal_ajuan = nominal;
  acceptForm.biaya = 0;
  acceptForm.payment_method_id = 0;
  acceptFormError.value = "";
  showAcceptModal.value = true;
};

const { mutate: mutateAccept, isPending: isAcceptPending } = useMutation({
  mutationFn: () =>
    acceptAjuan(acceptingId.value, {
      nominal_ajuan: acceptForm.nominal_ajuan,
      biaya: acceptForm.biaya,
      payment_method_id: acceptForm.payment_method_id,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    showAcceptModal.value = false;
    showToast("Ajuan berhasil diterima", {
      type: "success",
      position: "top-center",
    });
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menerima ajuan";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleAcceptAjuan = () => {
  if (acceptForm.payment_method_id === 0) {
    acceptFormError.value = "Metode pembayaran wajib dipilih.";
    return;
  }
  acceptFormError.value = "";
  mutateAccept();
};

// --- Reject / Refund actions ---
const handleRejectAjuan = async (id: number) => {
  const result = await Swal.fire({
    title: "Tolak Ajuan?",
    text: "Ajuan ini akan ditolak dan tidak bisa dibatalkan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Tolak",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc3545",
  });
  if (!result.isConfirmed) return;
  try {
    await rejectAjuan(id);
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    showToast("Ajuan berhasil ditolak", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Gagal menolak ajuan";
    showToast(msg, { type: "error", position: "top-center" });
  }
};

const handleAcceptRefund = async (id: number) => {
  const result = await Swal.fire({
    title: "Terima Refund?",
    text: "Refund ini akan diterima.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Terima",
    cancelButtonText: "Batal",
    confirmButtonColor: "#198754",
  });
  if (!result.isConfirmed) return;
  try {
    await acceptRefund(id);
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    showToast("Refund berhasil diterima", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Gagal menerima refund";
    showToast(msg, { type: "error", position: "top-center" });
  }
};

const handleRejectRefund = async (id: number) => {
  const result = await Swal.fire({
    title: "Tolak Refund?",
    text: "Refund ini akan ditolak dan tidak bisa dibatalkan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Tolak",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc3545",
  });
  if (!result.isConfirmed) return;
  try {
    await rejectRefund(id);
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    showToast("Refund berhasil ditolak", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Gagal menolak refund";
    showToast(msg, { type: "error", position: "top-center" });
  }
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

  const acceptAjuanBtn = target.closest<HTMLElement>(
    '#table-gridjs .accept-ajuan-btn[data-action="accept-ajuan"]',
  );
  if (acceptAjuanBtn) {
    event.preventDefault();
    const id = acceptAjuanBtn.getAttribute("data-id");
    const nominal = acceptAjuanBtn.getAttribute("data-nominal");
    if (id) openAcceptModal(Number(id), Number(nominal ?? 0));
    return;
  }

  const rejectAjuanBtn = target.closest<HTMLElement>(
    '#table-gridjs .reject-ajuan-btn[data-action="reject-ajuan"]',
  );
  if (rejectAjuanBtn) {
    event.preventDefault();
    const id = rejectAjuanBtn.getAttribute("data-id");
    if (id) handleRejectAjuan(Number(id));
    return;
  }

  const acceptRefundBtn = target.closest<HTMLElement>(
    '#table-gridjs .accept-refund-btn[data-action="accept-refund"]',
  );
  if (acceptRefundBtn) {
    event.preventDefault();
    const id = acceptRefundBtn.getAttribute("data-id");
    if (id) handleAcceptRefund(Number(id));
    return;
  }

  const rejectRefundBtn = target.closest<HTMLElement>(
    '#table-gridjs .reject-refund-btn[data-action="reject-refund"]',
  );
  if (rejectRefundBtn) {
    event.preventDefault();
    const id = rejectRefundBtn.getAttribute("data-id");
    if (id) handleRejectRefund(Number(id));
    return;
  }

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/ajuan/${id}/edit`);
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
