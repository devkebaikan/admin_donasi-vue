<template>
  <VerticalLayout>
    <div class="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div>
        <h4 class="mb-1 fw-bold">Pengajuan Refund Transaksi</h4>
        <p class="text-muted mb-0 small">
          Formulir untuk mengajukan pengembalian dana (refund) transaksi donasi.
        </p>
      </div>
      <b-button variant="outline-secondary" size="sm" @click="router.back()">
        <i class="bx bx-arrow-back me-1"></i>Kembali
      </b-button>
    </div>

    <div v-if="isLoadingTx" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat data transaksi...</p>
    </div>

    <div v-else-if="!txData" class="alert alert-danger">
      Data transaksi tidak ditemukan.
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <b-row>
        <b-col cols="12" lg="12">
          <UIComponentCard title="Rekening Tujuan Refund" class="mb-3">
            <!-- Tabel Detail Transaksi Tersedia -->
            <div v-if="txDetailsList.length" class="mt-3">
              <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Program</th>
                      <th style="width: 140px">Gross Nominal</th>
                      <th style="width: 140px">Nominal Bersih</th>
                      <th style="width: 140px">Refund Sebelumnya</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="d in txDetailsList" :key="d.id">
                      <td>{{ getDetailLabel(d) }}</td>
                      <td>{{ formatCurrency(d.gross_nominal ?? 0) }}</td>
                      <td class="fw-semibold text-success">{{ formatCurrency(d.nominal ?? d.gross_nominal ?? 0) }}</td>
                      <td>
                        <span v-if="d.refund" class="text-danger fw-semibold">
                          {{ formatCurrency(d.refund) }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </UIComponentCard>

          <!-- Rekening Tujuan Refund -->
          <UIComponentCard title="Rekening Tujuan Refund" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Bank Tujuan</label>
                <ChoicesSelect
                  id="bank-reference-id"
                  :modelValue="String(formState.bank_reference_id || 0)"
                  @update:modelValue="
                    (val: string) => {
                      formState.bank_reference_id = val === '0' ? null : Number(val);
                    }
                  "
                  :options="bankList"
                  :isLoading="isBankLoading"
                  :key="bankList.length"
                />
                <div v-if="v$.bank_reference_id.$error" class="invalid-feedback d-block">
                  {{ v$.bank_reference_id.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Nomor Rekening</label>
                <b-form-input
                  v-model="formState.account_number"
                  placeholder="Contoh: 1234567890"
                  :state="v$.account_number.$dirty ? !v$.account_number.$error : null"
                />
                <div v-if="v$.account_number.$error" class="invalid-feedback d-block">
                  {{ v$.account_number.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Atas Nama Rekening</label>
                <b-form-input
                  v-model="formState.account_behalf"
                  placeholder="Contoh: John Doe"
                  :state="v$.account_behalf.$dirty ? !v$.account_behalf.$error : null"
                />
                <div v-if="v$.account_behalf.$error" class="invalid-feedback d-block">
                  {{ v$.account_behalf.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12">
                <label class="form-label fw-semibold">Catatan / Alasan Refund</label>
                <b-form-textarea
                  v-model="formState.notes"
                  rows="3"
                  placeholder="Masukkan alasan atau catatan pengajuan refund..."
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Item Detail Refund -->
          <UIComponentCard title="Item Detail Refund" class="mb-3">
            <p class="text-muted small mb-3">
              Pilih detail transaksi dan masukkan nominal refund yang diajukan untuk setiap item.
            </p>

            <div
              v-for="(item, idx) in refundItems"
              :key="idx"
              class="border rounded p-3 mb-3 bg-white shadow-sm"
            >
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-primary-subtle text-primary border px-2 py-1">
                    Item Refund #{{ idx + 1 }}
                  </span>
                </div>
                <b-button
                  v-if="refundItems.length > 1"
                  variant="outline-danger"
                  size="sm"
                  title="Hapus Item"
                  @click="removeItem(idx)"
                >
                  <i class="bx bx-trash me-1"></i>Hapus
                </b-button>
              </div>

              <b-row class="g-3">
                <b-col cols="12" md="7">
                  <label class="form-label fw-semibold required">
                    Detail Transaksi
                  </label>

                  <b-form-select
                    v-if="detailOptions.length > 1"
                    v-model="item.transaction_detail_id"
                    @change="(val: any) => onDetailChange(idx, val)"
                  >
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Detail Transaksi --
                    </b-form-select-option>
                    <b-form-select-option
                      v-for="opt in detailOptions.filter(o => o.value !== null)"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.text }}
                    </b-form-select-option>
                  </b-form-select>

                  <b-form-input
                    v-else
                    type="number"
                    v-model.number="item.transaction_detail_id"
                    placeholder="Masukkan transaction_detail_id"
                  />

                  <small v-if="getSelectedDetailInfo(item.transaction_detail_id)" class="text-muted d-block mt-1">
                    Maksimal nominal item:
                    <span class="fw-semibold text-dark">
                      {{ formatCurrency(getSelectedDetailMaxAmount(item.transaction_detail_id)) }}
                    </span>
                  </small>
                </b-col>

                <b-col cols="12" md="5">
                  <div class="d-flex justify-content-between align-items-center">
                    <label class="form-label fw-semibold required">
                      Nominal Refund
                    </label>
                    <b-button
                      v-if="getSelectedDetailMaxAmount(item.transaction_detail_id) > 0"
                      variant="link"
                      size="sm"
                      class="p-0 text-decoration-none"
                      @click="item.refund_amount = getSelectedDetailMaxAmount(item.transaction_detail_id)"
                    >
                      Isi Maksimal
                    </b-button>
                  </div>
                  <CurrencyInput
                    v-model.number="item.refund_amount"
                    placeholder="0"
                    :state="undefined"
                  />
                  <div
                    v-if="
                      getSelectedDetailMaxAmount(item.transaction_detail_id) > 0 &&
                      item.refund_amount > getSelectedDetailMaxAmount(item.transaction_detail_id)
                    "
                    class="text-warning small mt-1"
                  >
                    <i class="bx bx-error-circle me-1"></i>Nominal melebihi nilai transaksi detail.
                  </div>
                </b-col>
              </b-row>
            </div>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
              <b-button variant="outline-primary" size="sm" @click="addItem">
                <i class="bx bx-plus me-1"></i>Tambah Item Refund
              </b-button>

              <div class="bg-light rounded p-2 px-3 border text-end">
                <small class="text-muted d-block">Total Refund Diajukan</small>
                <span class="fs-5 fw-bold text-primary">
                  {{ formatCurrency(totalRefundAmount) }}
                </span>
              </div>
            </div>

            <div v-if="itemError" class="alert alert-danger mt-3 py-2 small mb-0">
              <i class="bx bx-error me-1"></i>{{ itemError }}
            </div>
          </UIComponentCard>

          <!-- Aksi / Tombol Submit -->
          <div class="d-flex gap-2 mb-4">
            <b-button type="submit" variant="primary" :disabled="isPending">
              <b-spinner v-if="isPending" small class="me-1" />
              <i v-else class="bx bx-check-circle me-1"></i>
              {{ isPending ? "Mengajukan Refund..." : "Ajukan Refund" }}
            </b-button>
            <b-button variant="outline-secondary" @click="router.push('/transactions')">
              Batal
            </b-button>
          </div>
        </b-col>
      </b-row>
    </form>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import CurrencyInput from "@/components/CurrencyInput.vue";
import {
  getTransactionById,
  proposeRefund,
  type ProposeRefundPayload,
} from "@/services/transactionService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import { formatCurrency, formatDate } from "@/helpers/format";

const route = useRoute();
const router = useRouter();

const transactionId = computed(() => Number(route.params.id || 0));

// Form State
const formState = reactive({
  bank_reference_id: null as number | null,
  account_number: "",
  account_behalf: "",
  notes: "",
});

interface RefundItemRow {
  transaction_detail_id: number | null;
  refund_amount: number;
}

const refundItems = ref<RefundItemRow[]>([
  { transaction_detail_id: null, refund_amount: 0 },
]);

const itemError = ref("");

// Fetch Transaction Detail
const { data: txData, isLoading: isLoadingTx } = useQuery({
  queryKey: computed(() => ["transaction-refund-target", transactionId.value]),
  queryFn: () => getTransactionById(transactionId.value),
  enabled: computed(() => transactionId.value > 0),
});

// Transaction Details list helper
const txDetailsList = computed(() => {
  const details = txData.value?.transaction_details;
  return Array.isArray(details) ? details : [];
});

const getDetailLabel = (detail: any) => {
  if (detail?.program?.name) return detail.program.name;
  if (detail?.program?.title) return detail.program.title;
  if (detail?.event?.title) return `Event: ${detail.event.title}`;
  if (detail?.zakat?.name) return `Zakat: ${detail.zakat.name}`;
  if (detail?.detail_type) return `Detail (${detail.detail_type})`;
  return `Item Detail #${detail?.id}`;
};

const detailOptions = computed(() => {
  const opts = txDetailsList.value.map((d: any) => {
    const nominalText = formatCurrency(d.nominal ?? d.gross_nominal ?? 0);
    return {
      value: d.id,
      text: `${getDetailLabel(d)} (${nominalText})`,
    };
  });
  return [{ value: null, text: "-- Pilih Detail Transaksi --" }, ...opts];
});

// Detail info helpers
const getSelectedDetailInfo = (detailId: number | null) => {
  if (!detailId) return null;
  return txDetailsList.value.find((d: any) => d.id === detailId);
};

const getSelectedDetailMaxAmount = (detailId: number | null) => {
  const info = getSelectedDetailInfo(detailId);
  if (!info) return 0;
  return Number(info.nominal ?? info.gross_nominal ?? 0);
};

const onDetailChange = (index: number, val: any) => {
  const numVal = val ? Number(val) : null;
  refundItems.value[index].transaction_detail_id = numVal;
  if (numVal && refundItems.value[index].refund_amount === 0) {
    const max = getSelectedDetailMaxAmount(numVal);
    if (max > 0) {
      refundItems.value[index].refund_amount = max;
    }
  }
};

// Pre-fill initial item when transaction details loaded
watch(
  () => txData.value,
  (newVal) => {
    if (newVal?.transaction_details?.length === 1) {
      const firstDetail = newVal.transaction_details[0];
      if (
        refundItems.value.length === 1 &&
        refundItems.value[0].transaction_detail_id === null
      ) {
        refundItems.value[0].transaction_detail_id = firstDetail.id;
        refundItems.value[0].refund_amount = Number(
          firstDetail.nominal ?? firstDetail.gross_nominal ?? 0,
        );
      }
    }
  },
  { immediate: true },
);

// Fetch Bank References List
const { data: bankData, isLoading: isBankLoading } = useQuery({
  queryKey: ["bank-references-list-refund"],
  queryFn: () => getAllBankReferences({ mode: "list" }),
});

const bankList = computed(() => {
  const raw = bankData.value;
  const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
  return [
    { value: 0, text: "-- Pilih Bank --" },
    ...list.map((b: any) => ({
      value: b.id,
      text: `${b.name}${b.code && b.code !== "-" ? ` (${b.code})` : ""}`,
    })),
  ];
});

// Dynamic items management
const addItem = () => {
  refundItems.value.push({ transaction_detail_id: null, refund_amount: 0 });
};

const removeItem = (index: number) => {
  refundItems.value.splice(index, 1);
};

const totalRefundAmount = computed(() =>
  refundItems.value.reduce(
    (sum, item) => sum + (Number(item.refund_amount) || 0),
    0,
  ),
);

// Status Badge Helper
const STATUS_BADGE: Record<string, string> = {
  Paid: "bg-success",
  Pending: "bg-warning text-dark",
  Canceled: "bg-danger",
  Refunded: "bg-info",
};
const statusBadgeClass = (s: string) => STATUS_BADGE[s] ?? "bg-secondary";

// Validation Rules
const rules = {
  bank_reference_id: {
    required: helpers.withMessage("Bank tujuan wajib dipilih.", required),
    validBank: helpers.withMessage(
      "Bank tujuan wajib dipilih.",
      (val: any) => Boolean(val && Number(val) > 0),
    ),
  },
  account_number: {
    required: helpers.withMessage("Nomor rekening wajib diisi.", required),
  },
  account_behalf: {
    required: helpers.withMessage("Atas nama rekening wajib diisi.", required),
  },
};

const v$ = useVuelidate(rules, formState);

// Propose Refund Mutation
const { mutate, isPending } = useMutation({
  mutationFn: proposeRefund,
  onSuccess: () => {
    toast.success("Pengajuan refund berhasil dibuat.");
    router.push("/transactions");
  },
  onError: (error: any) => {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal mengajukan refund. Silakan coba lagi.";
    toast.error(errorMsg);
  },
});

const handleSubmit = async () => {
  itemError.value = "";
  const isValid = await v$.value.$validate();

  if (!transactionId.value) {
    itemError.value = "Transaction ID tidak valid.";
    return;
  }

  // Validate items
  if (!refundItems.value.length) {
    itemError.value = "Minimal 1 item detail refund harus diisi.";
    return;
  }

  for (let i = 0; i < refundItems.value.length; i++) {
    const item = refundItems.value[i];
    if (!item.transaction_detail_id || Number(item.transaction_detail_id) <= 0) {
      itemError.value = `Item #${i + 1}: Detail transaksi wajib dipilih.`;
      return;
    }
    if (!item.refund_amount || Number(item.refund_amount) <= 0) {
      itemError.value = `Item #${i + 1}: Nominal refund harus lebih dari 0.`;
      return;
    }
  }

  if (!isValid) return;

  const payload: ProposeRefundPayload = {
    transaction_id: Number(transactionId.value),
    bank_reference_id: Number(formState.bank_reference_id),
    account_number: String(formState.account_number).trim(),
    account_behalf: String(formState.account_behalf).trim(),
    notes: formState.notes || "",
    transaction_detail_ids: refundItems.value.map((i) =>
      Number(i.transaction_detail_id),
    ),
    refund_amounts: refundItems.value.map((i) => Number(i.refund_amount)),
  };

  mutate(payload);
};
</script>