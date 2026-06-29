<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12" lg="12">
        <div v-if="isLoadingTx" class="text-center p-5">
          <b-spinner variant="primary" />
          <p class="mt-2">Memuat data transaksi...</p>
        </div>

        <div v-else-if="!txData" class="alert alert-danger">
          Transaksi tidak ditemukan.
        </div>

        <form v-else @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <UIComponentCard title="Informasi Dasar" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="6">
                <label class="form-label fw-semibold required">Tanggal</label>
                <FlatPicker
                  id="edit-tx-date"
                  v-model="formState.date"
                  placeholder="YYYY-MM-DD"
                  :options="{ dateFormat: 'Y-m-d' }"
                />
                <div v-if="v$.date.$error" class="invalid-feedback d-block">
                  {{ v$.date.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="6">
                <label class="form-label fw-semibold required">Waktu</label>
                <FlatPicker
                  id="edit-tx-time"
                  v-model="formState.time"
                  placeholder="HH:MM:SS"
                  :options="{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: 'H:i:S',
                    time_24hr: true,
                  }"
                />
                <div v-if="v$.time.$error" class="invalid-feedback d-block">
                  {{ v$.time.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Status</label>
                <b-form-select
                  v-model="formState.status"
                  :state="v$.status.$dirty ? !v$.status.$error : null"
                >
                  <template #first>
                    <b-form-select-option value="" disabled
                      >Pilih status</b-form-select-option
                    >
                  </template>
                  <b-form-select-option value="Paid">Paid</b-form-select-option>
                  <b-form-select-option value="Pending"
                    >Pending</b-form-select-option
                  >
                  <b-form-select-option value="Canceled"
                    >Canceled</b-form-select-option
                  >
                </b-form-select>
                <div v-if="v$.status.$error" class="invalid-feedback d-block">
                  {{ v$.status.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Source</label>
                <b-form-input
                  v-model="formState.source"
                  placeholder="CRM, direct, ..."
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Invoice</label>
                <b-form-input
                  v-model="formState.invoice"
                  placeholder="Invoice"
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- References -->
          <UIComponentCard title="Referensi" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">User ID</label>
                <b-form-input
                  v-model.number="formState.user_id"
                  type="number"
                  min="1"
                  :state="v$.user_id.$dirty ? !v$.user_id.$error : null"
                />
                <div v-if="v$.user_id.$error" class="invalid-feedback d-block">
                  {{ v$.user_id.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required"
                  >Payment Method ID</label
                >
                <b-form-input
                  v-model.number="formState.payment_method_id"
                  type="number"
                  min="1"
                  :state="
                    v$.payment_method_id.$dirty
                      ? !v$.payment_method_id.$error
                      : null
                  "
                />
                <div
                  v-if="v$.payment_method_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.payment_method_id.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required"
                  >Transaction Type ID</label
                >
                <b-form-input
                  v-model.number="formState.transaction_type_id"
                  type="number"
                  min="1"
                  :state="
                    v$.transaction_type_id.$dirty
                      ? !v$.transaction_type_id.$error
                      : null
                  "
                />
                <div
                  v-if="v$.transaction_type_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.transaction_type_id.$errors[0]?.$message }}
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Amounts -->
          <UIComponentCard title="Nominal" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Total</label>
                <b-form-input
                  v-model.number="formState.total"
                  type="number"
                  min="0"
                  :state="v$.total.$dirty ? !v$.total.$error : null"
                />
                <div v-if="v$.total.$error" class="invalid-feedback d-block">
                  {{ v$.total.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Price</label>
                <b-form-input
                  v-model.number="formState.price"
                  type="number"
                  min="0"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Diskon</label>
                <b-form-input
                  v-model.number="formState.discount"
                  type="number"
                  min="0"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Application Fee</label>
                <b-form-input
                  v-model.number="formState.application_fee"
                  type="number"
                  min="0"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Fee Detail</label>
                <b-form-input
                  v-model.number="formState.fee_detail"
                  type="number"
                  min="0"
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Optional -->
          <UIComponentCard title="Opsional" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="6">
                <label class="form-label fw-semibold">Notes</label>
                <b-form-textarea v-model="formState.notes" rows="2" />
              </b-col>

              <b-col cols="12" md="6">
                <label class="form-label fw-semibold">Payment Detail</label>
                <b-form-textarea v-model="formState.payment_detail" rows="2" />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Reff Code</label>
                <b-form-input v-model="formState.reff_code" />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Third Party ID</label>
                <b-form-input v-model="formState.third_party_id" />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Payment URL</label>
                <b-form-input v-model="formState.payment_url" />
              </b-col>

              <b-col cols="12" md="3">
                <label class="form-label fw-semibold">Anonim</label>
                <div class="form-check form-switch mt-1">
                  <input
                    id="edit-anonim-sw"
                    v-model="isAnonim"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="isAnonim"
                  />
                  <label class="form-check-label" for="edit-anonim-sw">{{
                    isAnonim ? "Ya" : "Tidak"
                  }}</label>
                </div>
              </b-col>
            </b-row>
            <!-- Actions -->
            <div class="d-flex gap-2 mt-3">
              <b-button type="submit" variant="primary" :disabled="isPending">
                <b-spinner v-if="isPending" small class="me-1" />
                {{ isPending ? "Menyimpan..." : "Simpan Perubahan" }}
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="router.push('/transactions')"
              >
                Batal
              </b-button>
            </div>
          </UIComponentCard>
        </form>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import {
  getTransactionById,
  updateTransaction,
} from "@/services/transactionService";
import router from "@/router";

const route = useRoute();
const txId = computed(() => Number(route.params.id));

const { data: txData, isLoading: isLoadingTx } = useQuery({
  queryKey: computed(() => ["transactions", txId.value]),
  queryFn: () => getTransactionById(txId.value),
  enabled: computed(() => !!txId.value),
});

const formState = reactive({
  date: "",
  time: "",
  status: "",
  source: "",
  invoice: "",
  user_id: null as number | null,
  payment_method_id: null as number | null,
  transaction_type_id: null as number | null,
  total: null as number | null,
  price: 0,
  discount: 0,
  application_fee: 0,
  fee_detail: 0,
  notes: "",
  payment_detail: "",
  reff_code: "",
  third_party_id: "",
  payment_url: "",
});

const isAnonim = ref(false);

const extractDate = (iso: string) => (iso ? iso.split("T")[0] : "");
const extractTime = (iso: string) => {
  if (!iso) return "";
  const t = new Date(iso);
  return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}:${String(t.getUTCSeconds()).padStart(2, "0")}`;
};

watch(
  txData,
  (data) => {
    if (!data) return;
    formState.date = extractDate(data.date ?? "");
    formState.time = extractTime(data.time ?? "");
    formState.status = data.status ?? "";
    formState.source = data.source ?? "";
    formState.invoice = data.invoice ?? "";
    formState.user_id = data.user_id ?? null;
    formState.payment_method_id = data.payment_method_id ?? null;
    formState.transaction_type_id = data.transaction_type_id ?? null;
    formState.total = data.total ?? null;
    formState.price = data.price ?? 0;
    formState.discount = data.discount ?? 0;
    formState.application_fee = data.application_fee ?? 0;
    formState.fee_detail = data.fee_detail ?? 0;
    formState.notes = data.notes ?? "";
    formState.payment_detail = data.payment_detail ?? "";
    formState.reff_code = data.reff_code ?? "";
    formState.third_party_id = data.third_party_id ?? "";
    formState.payment_url = data.payment_url ?? "";
    isAnonim.value = !!data.anonim;
  },
  { immediate: true },
);

const rules = {
  date: { required: helpers.withMessage("Tanggal wajib diisi.", required) },
  time: { required: helpers.withMessage("Waktu wajib diisi.", required) },
  status: { required: helpers.withMessage("Status wajib dipilih.", required) },
  user_id: {
    required: helpers.withMessage("User ID wajib diisi.", required),
    minValue: helpers.withMessage("User ID harus lebih dari 0.", minValue(1)),
  },
  payment_method_id: {
    required: helpers.withMessage("Payment Method ID wajib diisi.", required),
    minValue: helpers.withMessage(
      "Payment Method ID harus lebih dari 0.",
      minValue(1),
    ),
  },
  transaction_type_id: {
    required: helpers.withMessage("Transaction Type ID wajib diisi.", required),
    minValue: helpers.withMessage(
      "Transaction Type ID harus lebih dari 0.",
      minValue(1),
    ),
  },
  total: {
    required: helpers.withMessage("Total wajib diisi.", required),
    minValue: helpers.withMessage("Total tidak boleh negatif.", minValue(0)),
  },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Record<string, any>) =>
    updateTransaction(txId.value, payload),
  onSuccess: () => {
    toast.success("Transaksi berhasil diperbarui.");
    router.push(`/transactions/${txId.value}`);
  },
  onError: () => {
    toast.error("Gagal memperbarui transaksi. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  const payload: Record<string, any> = {
    date: formState.date,
    time: formState.time,
    status: formState.status,
    total: formState.total,
    user_id: formState.user_id,
    payment_method_id: formState.payment_method_id,
    transaction_type_id: formState.transaction_type_id,
    price: formState.price,
    discount: formState.discount,
    application_fee: formState.application_fee,
    fee_detail: formState.fee_detail,
    anonim: isAnonim.value ? 1 : 0,
  };

  if (formState.source) payload.source = formState.source;
  if (formState.invoice) payload.invoice = formState.invoice;
  if (formState.notes) payload.notes = formState.notes;
  if (formState.payment_detail)
    payload.payment_detail = formState.payment_detail;
  if (formState.reff_code) payload.reff_code = formState.reff_code;
  if (formState.third_party_id)
    payload.third_party_id = formState.third_party_id;
  if (formState.payment_url) payload.payment_url = formState.payment_url;

  mutate(payload);
};
</script>
