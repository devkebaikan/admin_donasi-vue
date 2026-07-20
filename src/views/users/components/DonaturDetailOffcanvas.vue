<template>
  <b-offcanvas
    v-model="isVisible"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 700px"
    @hide="emit('hide')"
  >
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-receipt me-1 text-primary"></i>Detail Donatur
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <div v-if="isUserLoading" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat detail...</p>
    </div>
    <div v-else-if="isUserError" class="alert alert-danger m-0">
      Gagal memuat detail. Silakan coba lagi.
    </div>
    <div v-else-if="userDetail" class="pb-4">
      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs border-bottom mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'user' }"
            @click="activeTab = 'user'"
            type="button"
          >
            <i class="bx bx-user me-1"></i>Detail User
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
            type="button"
          >
            <i class="bx bx-history me-1"></i>Riwayat Transaksi
          </button>
        </li>
      </ul>

      <!-- Tab: Detail User -->
      <div v-if="isUserLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2 text-muted">Memuat detail...</p>
      </div>
      <div v-else-if="isUserError" class="alert alert-danger m-0">
        Gagal memuat detail. Silakan coba lagi.
      </div>
      <div v-if="activeTab === 'user'" class="tab-content">
        <div v-if="userDetail">
          <!-- Info Donatur -->
          <h6
            class="fw-semibold text-muted mb-3 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            <i class="bx bx-user me-1"></i>Informasi Donatur
          </h6>
          <b-row class="g-2 mb-3">
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">Nama</small>
                <span class="fw-semibold small">
                  {{ userDetail.name || "-" }}
                </span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">Email</small>
                <span class="fw-semibold small">
                  {{ userDetail.email || "-" }}
                </span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">No. Telepon</small>
                <!-- <span class="fw-semibold small">
                  {{ userDetail.phone || "-" }}
                </span> -->
                <a
                  v-if="userDetail.phone"
                  :href="`https://wa.me/${userDetail.phone}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="fw-semibold small"
                >
                  <i class="bx bxl-whatsapp text-success me-1"></i
                  >{{ userDetail.phone }}
                </a>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">ID User</small>
                <span class="fw-semibold small font-monospace">
                  {{ userDetail.id || "-" }}
                </span>
              </div>
            </b-col>
          </b-row>

          <hr class="my-3" />
          <h6
            class="fw-semibold text-muted mb-2 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            <i class="bx bx-info-circle me-1"></i>Informasi Akun
          </h6>
          <b-row class="g-2 mb-3">
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">Referral Code</small>
                <span class="fw-semibold small font-monospace">
                  {{ userDetail.referral_code || "-" }}
                </span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">Public Code</small>
                <span class="fw-semibold small font-monospace">
                  {{ userDetail.public_code || "-" }}
                </span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">Status Verified</small>
                <span v-if="userDetail.verified" class="badge bg-success">{{
                  userDetail.verified
                }}</span>
                <span v-else class="badge bg-secondary">Belum Verified</span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="bg-light rounded p-2">
                <small class="text-muted d-block">User ID</small>
                <span class="fw-semibold small font-monospace"
                  >#{{ userDetail.id }}</span
                >
              </div>
            </b-col>
          </b-row>

          <!-- Catatan -->
          <div v-if="userDetail.note" class="mb-3">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Catatan</small>
              <span class="small">{{ userDetail.note }}</span>
            </div>
          </div>

          <hr class="my-3" />

          <!-- Timestamps User -->
          <div class="d-flex gap-3 mb-3">
            <div>
              <small class="text-muted d-block">Terdaftar</small>
              <small class="fw-semibold">
                {{ formatDateTime(userDetail.created_at) }}
              </small>
            </div>
            <div>
              <small class="text-muted d-block">Diperbarui</small>
              <small class="fw-semibold">
                {{ formatDateTime(userDetail.updated_at) }}
              </small>
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Informasi user tidak tersedia.
        </p>
      </div>

      <!-- Tab: Riwayat Transaksi User -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div v-if="isHistoryLoading" class="text-center py-4">
          <b-spinner small variant="primary" class="me-2" />
          <span class="text-muted small">Memuat riwayat...</span>
        </div>
        <div v-else-if="isHistoryError" class="alert alert-warning mb-0">
          Gagal memuat riwayat transaksi.
        </div>
        <div v-else-if="userHistory && userHistory.length">
          <div class="table-responsive">
            <table class="table table-hover table-sm">
              <thead class="table-light">
                <tr>
                  <th style="width: 100px">Invoice</th>
                  <th style="width: 120px">Tanggal</th>
                  <th style="width: 120px">Total</th>
                  <th style="width: 100px">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tx in userHistory"
                  :key="tx.id"
                  :class="{
                    'table-light': tx.id === selectedId,
                  }"
                >
                  <td>
                    <span class="font-monospace fw-semibold small">
                      {{ tx.invoice }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ formatDate(tx.date) }}
                    </small>
                  </td>
                  <td>
                    <small class="fw-semibold">
                      {{ formatCurrency(tx.total) }}
                    </small>
                  </td>
                  <td>
                    <span
                      :class="['badge', statusBadgeClass(tx.status)]"
                      style="font-size: 10px"
                    >
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Tidak ada riwayat transaksi.
        </p>
      </div>
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getAllTransactions } from "@/services/transactionService";
import { formatCurrency, formatDateTime, formatDate } from "@/helpers/format";
import { getUserById } from "@/services/userService";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  selectedId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "hide"]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const activeTab = ref("user");

const {
  data: userHistory,
  isLoading: isHistoryLoading,
  isError: isHistoryError,
} = useQuery({
  queryKey: computed(() => ["user-transaction-history", props.selectedId]),
  queryFn: () =>
    getAllTransactions({ user_id: props.selectedId || 0, status: "Paid" }),
  enabled: computed(() => !!props.selectedId),
});

const {
  data: userDetail,
  isLoading: isUserLoading,
  isError: isUserError,
} = useQuery({
  queryKey: ["detail-user", props.selectedId],
  queryFn: () => getUserById(props.selectedId),
  enabled: computed(() => !!props.selectedId),
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

watch(
  () => props.selectedId,
  () => {
    activeTab.value = "user";
  },
);
</script>
