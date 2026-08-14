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
        class="d-flex align-items-center justify-content-between px-3 py-2"
        :class="{ 'border-top': idx > 0 }"
        style="background-color: #edf6ef; border-radius: 0.375rem"
      >
        <!-- Left Content -->
        <div class="flex-grow-1 pr-2">
          <!-- Nominal -->
          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold text-success fs-12">
              {{ formatCurrency(don.total) }}
            </span>

            <b-badge
              v-if="don.id === transaction?.id"
              variant="primary"
              class="ms-2 fs-10"
            >
              Transaksi Ini
            </b-badge>
          </div>

          <!-- Nama Program -->
          <div class="text-dark font-weight-medium fs-11 mb-1">
            {{
              don.transaction_details?.[0]?.program?.name ||
              "Belum masuk program"
            }}
          </div>

          <!-- Tipe Transaksi & Metode Pembayaran -->
          <div class="d-flex align-items-center flex-wrap text-muted fs-10">
            <span>
              {{ don.transaction_type?.name || "-" }}
            </span>

            <span class="mx-1">•</span>

            <span>
              {{ don.payment_method?.bank_name || "-" }}
            </span>
          </div>
        </div>

        <!-- Right Content -->
        <div class="text-right flex-shrink-0">
          <!-- Jam -->
          <div v-if="don.time" class="text-muted fs-10 mb-1">
            {{ formatDateTime(don.date) }}
          </div>

          <!-- Status -->
          <b-badge
            :variant="null"
            class="font-weight-medium fs-10"
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
import { formatDateTime } from "@/helpers/format";
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
