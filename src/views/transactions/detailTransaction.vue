<template>
  <VerticalLayout>
    <div v-if="isLoading" class="text-center p-5">
      <b-spinner variant="primary" />
      <p class="mt-2">Memuat data transaksi...</p>
    </div>

    <div v-else-if="!tx" class="alert alert-danger">
      Transaksi tidak ditemukan.
    </div>

    <template v-else>
      <!-- Header -->
      <b-card class="mb-3">
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2"
        >
          <div>
            <h5 class="mb-1 fw-bold font-monospace">
              {{ tx.invoice || `#${tx.id}` }}
            </h5>
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <span :class="['badge', statusClass(tx.status)]">{{
                tx.status
              }}</span>
              <span class="badge bg-light text-dark border">{{
                tx.source
              }}</span>
              <span class="text-muted small">{{
                formatDateTime(tx.date)
              }}</span>
            </div>
          </div>
          <div class="d-flex gap-2">
            <b-button
              variant="outline-warning"
              size="sm"
              @click="router.push(`/transactions/${tx.id}/edit`)"
            >
              <i class="bx bx-edit me-1"></i>Edit
            </b-button>
            <b-button
              variant="outline-secondary"
              size="sm"
              @click="router.push('/transactions')"
            >
              <i class="bx bx-arrow-back me-1"></i>Kembali
            </b-button>
          </div>
        </div>
      </b-card>

      <b-row class="g-3">
        <!-- Left column -->
        <b-col cols="12" lg="7">
          <!-- Transaction Info -->
          <UIComponentCard title="Informasi Transaksi" class="mb-3">
            <table class="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="text-muted fw-semibold" style="width: 40%">ID</td>
                  <td class="font-monospace">{{ tx.id }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Invoice</td>
                  <td class="font-monospace">{{ tx.invoice || "-" }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Tanggal</td>
                  <td>{{ formatDateTime(tx.date) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Waktu</td>
                  <td>{{ formatDateTime(tx.time) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Status</td>
                  <td>
                    <span :class="['badge', statusClass(tx.status)]">{{
                      tx.status
                    }}</span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Source</td>
                  <td>{{ tx.source || "-" }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Total</td>
                  <td class="fw-bold fs-5 text-primary">
                    {{ formatCurrency(tx.total) }}
                  </td>
                </tr>
                <tr v-if="tx.discount">
                  <td class="text-muted fw-semibold">Diskon</td>
                  <td>{{ formatCurrency(tx.discount) }}</td>
                </tr>
                <tr v-if="tx.application_fee">
                  <td class="text-muted fw-semibold">Application Fee</td>
                  <td>{{ formatCurrency(tx.application_fee) }}</td>
                </tr>
                <tr v-if="tx.fee_detail">
                  <td class="text-muted fw-semibold">Fee Detail</td>
                  <td>{{ formatCurrency(tx.fee_detail) }}</td>
                </tr>
                <tr v-if="tx.third_party_id">
                  <td class="text-muted fw-semibold">Third Party</td>
                  <td>{{ tx.third_party_id }}</td>
                </tr>
                <tr v-if="tx.payment_url">
                  <td class="text-muted fw-semibold">Payment URL</td>
                  <td>
                    <a
                      :href="tx.payment_url"
                      target="_blank"
                      class="text-primary small"
                    >
                      Buka link <i class="bx bx-link-external"></i>
                    </a>
                  </td>
                </tr>
                <tr v-if="tx.created_at">
                  <td class="text-muted fw-semibold">Dibuat</td>
                  <td class="small text-muted">
                    {{ formatDateTime(tx.created_at) }}
                  </td>
                </tr>
                <tr v-if="tx.updated_at">
                  <td class="text-muted fw-semibold">Diperbarui</td>
                  <td class="small text-muted">
                    {{ formatDateTime(tx.updated_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </UIComponentCard>

          <!-- Transaction Details -->
          <UIComponentCard title="Detail Transaksi">
            <div
              v-if="!tx.transaction_details?.length"
              class="text-muted fst-italic"
            >
              Tidak ada detail transaksi.
            </div>
            <div
              v-for="(detail, idx) in tx.transaction_details"
              :key="detail.id"
              :class="['border rounded p-3', Number(idx) > 0 ? 'mt-2' : '']"
            >
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <strong class="small text-uppercase text-muted"
                  >Detail #{{ Number(idx) + 1 }}</strong
                >
                <span class="badge bg-light text-dark border">{{
                  detail.detail_type
                }}</span>
              </div>
              <div v-if="detail.program" class="mb-2">
                <span class="fw-semibold small">Program:</span>
                <span class="small ms-1">{{ detail.program.name }}</span>
              </div>
              <table class="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted small" style="width: 50%">Qty</td>
                    <td class="small">{{ detail.quantity }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted small">Gross Nominal</td>
                    <td class="small">
                      {{ formatCurrency(detail.gross_nominal) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted small">Nominal</td>
                    <td class="small fw-semibold">
                      {{ formatCurrency(detail.nominal) }}
                    </td>
                  </tr>
                  <tr v-if="detail.fee">
                    <td class="text-muted small">Fee</td>
                    <td class="small">{{ formatCurrency(detail.fee) }}</td>
                  </tr>
                  <tr v-if="detail.operasional">
                    <td class="text-muted small">Operasional</td>
                    <td class="small">
                      {{ formatCurrency(detail.operasional) }}
                    </td>
                  </tr>
                  <tr v-if="detail.komisi">
                    <td class="text-muted small">Komisi</td>
                    <td class="small">{{ formatCurrency(detail.komisi) }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted small">Activity</td>
                    <td>
                      <span class="badge bg-info small">{{
                        detail.activity
                      }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UIComponentCard>
        </b-col>

        <!-- Right column -->
        <b-col cols="12" lg="5">
          <!-- User -->
          <UIComponentCard title="User" class="mb-3">
            <div v-if="tx.user">
              <table class="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted fw-semibold" style="width: 40%">
                      ID
                    </td>
                    <td class="font-monospace">{{ tx.user.id }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted fw-semibold">Nama</td>
                    <td>{{ tx.user.name || "-" }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted fw-semibold">Telepon</td>
                    <td class="font-monospace small">
                      {{ tx.user.phone || "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted fst-italic mb-0">
              User ID: {{ tx.user_id }}
            </p>
          </UIComponentCard>

          <!-- Payment Method -->
          <UIComponentCard title="Metode Pembayaran" class="mb-3">
            <div v-if="tx.payment_method">
              <table class="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted fw-semibold" style="width: 50%">
                      ID
                    </td>
                    <td class="font-monospace">{{ tx.payment_method.id }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted fw-semibold">Provider</td>
                    <td>{{ tx.payment_method.bank_provider || "-" }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted fw-semibold">Atas Nama</td>
                    <td>{{ tx.payment_method.account_behalf || "-" }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted fw-semibold">No Rekening</td>
                    <td class="font-monospace small">
                      {{ tx.payment_method.account_number || "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted fst-italic mb-0">
              Payment Method ID: {{ tx.payment_method_id }}
            </p>
          </UIComponentCard>

          <!-- Transaction Type -->
          <UIComponentCard title="Tipe Transaksi">
            <div v-if="tx.transaction_type">
              <p class="mb-0">
                <span class="badge bg-primary">{{
                  tx.transaction_type.name
                }}</span>
                <span class="text-muted small ms-2"
                  >ID: {{ tx.transaction_type.id }}</span
                >
              </p>
            </div>
            <p v-else class="text-muted fst-italic mb-0">
              Type ID: {{ tx.transaction_type_id }}
            </p>
          </UIComponentCard>
        </b-col>
      </b-row>
    </template>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getTransactionById } from "@/services/transactionService";
import router from "@/router";
import { formatCurrency, formatDateTime } from "@/helpers/format";

const route = useRoute();
const txId = computed(() => Number(route.params.id));

const { data: tx, isLoading } = useQuery({
  queryKey: computed(() => ["transactions", txId.value]),
  queryFn: () => getTransactionById(txId.value),
  enabled: computed(() => !!txId.value),
});

const statusClass = (status: string) =>
  ({
    Paid: "bg-success",
    Pending: "bg-warning text-dark",
    Canceled: "bg-danger",
  })[status] ?? "bg-secondary";
</script>
