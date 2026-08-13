<template>
  <div class="rounded-3" style="margin-bottom: 80px">
    <h6 class="fs-11 fw-semibold text-uppercase mb-2" style="color: #5a9c6a">
      <i class="bx bx-history me-1"></i>Riwayat Donasi
    </h6>

    <div v-if="isHistoryLoading" class="text-center p-3">
      <b-spinner small variant="primary" />
    </div>
    <template v-else-if="donationHistory.length">
      <div
        v-for="(don, idx) in donationHistory"
        :key="don.id"
        style="background-color: #ecf8ee"
        class="d-flex p-3 align-items-center justify-content-between py-1"
        :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
      >
        <div>
          <p class="mb-0 fs-12 fw-semibold">
            {{ formatCurrency(don.total) }}
            <b-badge
              v-if="don.id === transaction?.id"
              :variant="null"
              class="badge-soft-primary fs-10 ms-1"
            >
              Transaksi Ini
            </b-badge>
          </p>
          <p class="mb-0 text-muted fs-11">
            {{ don.transaction_details?.[0].program?.name }}
          </p>
        </div>
        <div class="text-end flex-shrink-0 ms-2">
          <p class="mb-1 text-muted fs-11">{{ formatDate(don.date) }}</p>
          <b-badge
            :variant="null"
            class="fw-medium fs-10"
            :class="`badge-soft-${transactionStatusVariant(don.status)}`"
          >
            {{ don.status }}
          </b-badge>
        </div>
      </div>
    </template>
    <p v-else class="text-muted fs-13 mb-0">Belum ada riwayat donasi</p>
  </div>
</template>

<script setup lang="ts">
import type {
  CrmTransactionDetail,
  CrmTransactionHistoryItem,
} from "@/types/crm";

defineProps<{
  isHistoryLoading: boolean;
  donationHistory: CrmTransactionHistoryItem[];
  transaction: CrmTransactionDetail | null | undefined;
  formatCurrency: (value: string | number) => string;
  formatDate: (value: string | Date | null | undefined) => string;
  transactionStatusVariant: (status?: string) => string;
}>();
</script>
