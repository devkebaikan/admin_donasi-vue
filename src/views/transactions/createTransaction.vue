<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12" lg="12">
        <form @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <UIComponentCard title="Informasi Dasar" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="3">
                <label class="form-label fw-semibold required">Tanggal</label>
                <FlatPicker
                  id="tx-date"
                  v-model="formState.date"
                  placeholder="Pilih tanggal"
                  :options="{ dateFormat: 'Y-m-d' }"
                />
                <div v-if="v$.date.$error" class="invalid-feedback d-block">
                  {{ v$.date.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="3">
                <label class="form-label fw-semibold required">Waktu</label>
                <FlatPicker
                  id="tx-time"
                  v-model="formState.time"
                  placeholder="Pilih waktu"
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

              <b-col cols="12" md="3">
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

              <b-col cols="12" md="3">
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
                  placeholder="Auto-generate jika kosong"
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- References -->
          <UIComponentCard title="Referensi" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">User ID</label>
                <SearchSelect
                  id="user-id"
                  :modelValue="String(formState.user_id || 0)"
                  @update:modelValue="
                    (val: string) => {
                      formState.user_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  @search="
                    (query: string) => {
                      userSearchQuery = query;
                    }
                  "
                  :options="userList"
                  :isLoading="isUserLoading"
                />
                <div v-if="v$.user_id.$error" class="invalid-feedback d-block">
                  {{ v$.user_id.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required"
                  >Payment Method</label
                >
                <ChoicesSelect
                  id="payment-method-id"
                  :modelValue="String(formState.payment_method_id || 0)"
                  @update:modelValue="
                    (val: string) => {
                      formState.payment_method_id =
                        val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="paymentMethodList"
                  :isLoading="isPaymentMethodLoading"
                  :key="paymentMethodList.length"
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
                  placeholder="ID Tipe Transaksi"
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
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Type</label>
                <b-form-select
                  v-model="formState.type"
                  :state="v$.type.$dirty ? !v$.type.$error : null"
                >
                  <template #first>
                    <b-form-select-option value="" disabled
                      >Pilih tipe</b-form-select-option
                    >
                  </template>
                  <b-form-select-option value="donation"
                    >Donation</b-form-select-option
                  >
                  <b-form-select-option value="zakat"
                    >Zakat</b-form-select-option
                  >
                  <b-form-select-option value="other"
                    >Other</b-form-select-option
                  >
                </b-form-select>
                <div v-if="v$.type.$error" class="invalid-feedback d-block">
                  {{ v$.type.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Jurnal ID</label>
                <b-form-input
                  v-model.number="formState.jurnal_id"
                  type="number"
                  min="1"
                  placeholder="Opsional"
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Amounts -->
          <UIComponentCard title="Nominal" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="4">
                <label class="form-label fw-semibold required">Total</label>
                <CurrencyInput
                  id="total"
                  placeholder="0"
                  v-model.number="formState.total"
                  :state="v$.total.$dirty ? !v$.total.$error : null"
                />
                <div v-if="v$.total.$error" class="invalid-feedback d-block">
                  {{ v$.total.$errors[0]?.$message }}
                </div>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Price</label>
                <CurrencyInput
                  v-model.number="formState.price"
                  placeholder="0"
                  :state="null"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Diskon</label>
                <CurrencyInput
                  v-model.number="formState.discount"
                  placeholder="0"
                  :state="null"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Application Fee</label>
                <CurrencyInput
                  v-model.number="formState.application_fee"
                  placeholder="0"
                  :state="null"
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Fee Detail</label>
                <CurrencyInput
                  v-model.number="formState.fee_detail"
                  placeholder="0"
                  :state="null"
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Optional -->
          <UIComponentCard title="Opsional" class="mb-3 hidden d-none">
            <b-row class="g-3">
              <b-col cols="12" md="6">
                <label class="form-label fw-semibold">Doa</label>
                <b-form-textarea
                  v-model="formState.doa"
                  rows="2"
                  placeholder="Permohonan doa dari pendonor..."
                />
              </b-col>

              <b-col cols="12" md="6">
                <label class="form-label fw-semibold">Notes</label>
                <b-form-textarea
                  v-model="formState.notes"
                  rows="2"
                  placeholder="Catatan transaksi..."
                />
              </b-col>

              <b-col cols="12" md="6">
                <label class="form-label fw-semibold">Payment Detail</label>
                <b-form-textarea
                  v-model="formState.payment_detail"
                  rows="2"
                  placeholder="Detail pembayaran..."
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Reff Code</label>
                <b-form-input
                  v-model="formState.reff_code"
                  placeholder="Kode referral..."
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Third Party ID</label>
                <b-form-input
                  v-model="formState.third_party_id"
                  placeholder="midtrans, ..."
                />
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Payment URL</label>
                <b-form-input
                  v-model="formState.payment_url"
                  placeholder="https://..."
                />
              </b-col>

              <b-col cols="12" md="3">
                <label class="form-label fw-semibold">Anonim</label>
                <div class="form-check form-switch mt-1">
                  <input
                    id="anonim-sw"
                    v-model="isAnonim"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="isAnonim"
                  />
                  <label class="form-check-label" for="anonim-sw">{{
                    isAnonim ? "Ya" : "Tidak"
                  }}</label>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Transaction Details -->
          <UIComponentCard title="Detail Transaksi" class="mb-3">
            <div
              v-for="(detail, idx) in transactionDetails"
              :key="idx"
              class="border rounded p-3 mb-3"
            >
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <strong class="text-muted small text-uppercase"
                  >Item #{{ idx + 1 }}</strong
                >
                <b-button
                  v-if="transactionDetails.length > 1"
                  variant="outline-danger"
                  size="sm"
                  @click="removeDetail(idx)"
                >
                  <i class="bx bx-trash"></i>
                </b-button>
              </div>

              <b-row class="g-2">
                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required"
                    >Detail Type</label
                  >
                  <b-form-input
                    v-model="detail.detail_type"
                    placeholder="donation, zakat, ..."
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required"
                    >Activity</label
                  >
                  <b-form-select v-model="detail.activity">
                    <template #first>
                      <b-form-select-option value="" disabled
                        >Pilih activity</b-form-select-option
                      >
                    </template>
                    <b-form-select-option
                      v-for="a in ACTIVITIES"
                      :key="a"
                      :value="a"
                      >{{ a }}</b-form-select-option
                    >
                  </b-form-select>
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required">Qty</label>
                  <CurrencyInput
                    v-model.number="detail.quantity"
                    :state="null"
                    placeholder="1"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required"
                    >Gross Nominal</label
                  >
                  <CurrencyInput
                    v-model.number="detail.gross_nominal"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required">Nominal</label>
                  <CurrencyInput
                    v-model.number="detail.nominal"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold">Fee</label>
                  <CurrencyInput
                    v-model.number="detail.fee"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold">Diskon</label>
                  <CurrencyInput
                    v-model.number="detail.discount"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold">Operasional</label>
                  <CurrencyInput
                    v-model.number="detail.operasional"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold">Komisi</label>
                  <CurrencyInput
                    v-model.number="detail.komisi"
                    :state="null"
                    placeholder="0"
                  />
                </b-col>

                <b-col cols="12" md="6">
                  <label class="form-label fw-semibold">Program</label>
                  <ChoicesSelect
                    id="program-id"
                    :modelValue="String(detail.program_id || 0)"
                    @update:modelValue="
                      (val: string) => {
                        detail.program_id = val === '0' ? 0 : Number(val);
                      }
                    "
                    :options="programList"
                    :isLoading="isProgramLoading"
                    :key="programList.length"
                  />
                </b-col>

                <!-- <b-col cols="12" md="4">
                  <label class="form-label fw-semibold">Event ID</label>
                  <b-form-input
                    v-model.number="detail.event_id"
                    type="number"
                    min="1"
                    placeholder="Opsional"
                  />
                </b-col> -->
              </b-row>
            </div>

            <b-button variant="outline-primary" size="sm" @click="addDetail">
              <i class="bx bx-plus me-1"></i>Tambah Item
            </b-button>

            <div v-if="detailError" class="text-danger small mt-2">
              {{ detailError }}
            </div>
          </UIComponentCard>

          <!-- Actions -->
          <div class="d-flex gap-2">
            <b-button type="submit" variant="primary" :disabled="isPending">
              <b-spinner v-if="isPending" small class="me-1" />
              {{ isPending ? "Menyimpan..." : "Simpan Transaksi" }}
            </b-button>
            <b-button
              variant="outline-secondary"
              @click="router.push('/transactions')"
            >
              Batal
            </b-button>
          </div>
        </form>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import { createTransaction } from "@/services/transactionService";
import router from "@/router";
import { getAllPaymentMethods } from "@/services/paymentMethodService";
import { getUsers } from "@/services/userService";
import { getAllPrograms, getProgramTypes } from "@/services/programService";

const ACTIVITIES = [
  "Waiting for payment",
  "Done",
  "Process",
  "Pending",
  "Canceled",
  "Refunding",
  "Saving",
  "Used",
];

const formState = reactive({
  date: "",
  time: "",
  status: "",
  source: "",
  invoice: "",
  type: "",
  program_type: "",
  jurnal_id: null as number | null,
  user_id: null as number | null,
  payment_method_id: null as number | null,
  transaction_type_id: null as number | null,
  total: null as number | null,
  price: 0,
  discount: 0,
  application_fee: 0,
  fee_detail: 0,
  doa: "",
  notes: "",
  payment_detail: "",
  reff_code: "",
  third_party_id: "",
  payment_url: "",
});

// user list with search
const userSearchQuery = ref("");

const {
  data: userData,
  isLoading: isUserLoading,
  refetch: refetchUsers,
} = useQuery({
  queryKey: ["user-list", userSearchQuery],
  queryFn: () => {
    const params: Record<string, any> = { limit: 10 };
    if (userSearchQuery.value && userSearchQuery.value.length > 2) {
      params.search = userSearchQuery.value;
    }
    return getUsers(params);
  },
  enabled: computed(
    () => !userSearchQuery.value || userSearchQuery.value.length > 2,
  ),
});

const userList = computed(() => {
  const list = Array.isArray(userData.value) ? userData.value : [];
  return [
    { value: 0, text: "Cari user..." },
    ...list.map((p: any) => ({
      value: p.id,
      text: `${p.name} - ${p.phone}`,
    })),
  ];
});

watch(userSearchQuery, (newVal) => {
  if (newVal && newVal.length > 2) {
    refetchUsers();
  }
});

// program list
const { data: programData, isLoading: isProgramLoading } = useQuery({
  queryKey: ["program-list"],
  queryFn: getAllPrograms,
});

const programList = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  return [
    { value: 0, text: "Pilih program..." },
    ...list.map((p: any) => ({
      value: p.id,
      text: p.title,
    })),
  ];
});

// payment method list
const { data: paymentMethodData, isLoading: isPaymentMethodLoading } = useQuery(
  {
    queryKey: ["payment-method-list"],
    queryFn: getAllPaymentMethods,
  },
);

const paymentMethodList = computed(() => {
  const list = Array.isArray(paymentMethodData.value)
    ? paymentMethodData.value
    : [];
  return [
    { value: 0, text: "Pilih metode pembayaran" },
    ...list.map((p: any) => ({
      value: p.id,
      text: `${p.bank_reference.name} | ${p.code}`,
    })),
  ];
});

const isAnonim = ref(false);

const makeDetail = () => ({
  detail_type: "donation",
  activity: "",
  quantity: 1,
  gross_nominal: 0,
  nominal: 0,
  fee: 0,
  discount: 0,
  operasional: 0,
  komisi: 0,
  program_id: null as number | null,
  // event_id: null as number | null,
});

const transactionDetails = ref([makeDetail()]);
const detailError = ref("");

const addDetail = () => transactionDetails.value.push(makeDetail());
const removeDetail = (idx: number) => transactionDetails.value.splice(idx, 1);

const rules = {
  date: { required: helpers.withMessage("Tanggal wajib diisi.", required) },
  time: { required: helpers.withMessage("Waktu wajib diisi.", required) },
  status: { required: helpers.withMessage("Status wajib dipilih.", required) },
  type: { required: helpers.withMessage("Type wajib dipilih.", required) },
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
  mutationFn: createTransaction,
  onSuccess: () => {
    toast.success("Transaksi berhasil ditambahkan.");
    router.push("/transactions");
  },
  onError: () => {
    toast.error("Gagal menyimpan transaksi. Coba lagi.");
  },
});

const handleSubmit = async () => {
  detailError.value = "";
  const isValid = await v$.value.$validate();

  const validDetails = transactionDetails.value.filter(
    (d) => d.detail_type && d.activity && d.quantity >= 1,
  );
  if (!validDetails.length) {
    detailError.value =
      "Minimal satu detail transaksi wajib diisi (detail_type, activity, quantity).";
    if (!isValid) return;
    return;
  }

  if (!isValid) return;

  const payload: Record<string, any> = {
    date: formState.date,
    time: formState.time,
    status: formState.status,
    total: formState.total,
    user_id: formState.user_id,
    payment_method_id: formState.payment_method_id,
    transaction_type_id: formState.transaction_type_id,
    anonim: isAnonim.value ? 1 : 0,
    transaction_details: validDetails.map((d) => {
      const item: Record<string, any> = {
        detail_type: d.detail_type,
        activity: d.activity,
        quantity: d.quantity,
        gross_nominal: d.gross_nominal,
        nominal: d.nominal,
        fee: d.fee,
        discount: d.discount,
        operasional: d.operasional,
        komisi: d.komisi,
      };
      if (d.program_id) item.program_id = d.program_id;
      // if (d.event_id) item.event_id = d.event_id;
      return item;
    }),
  };

  if (formState.source) payload.source = formState.source;
  if (formState.invoice) payload.invoice = formState.invoice;
  if (formState.price) payload.price = formState.price;
  if (formState.discount) payload.discount = formState.discount;
  if (formState.application_fee)
    payload.application_fee = formState.application_fee;
  if (formState.fee_detail) payload.fee_detail = formState.fee_detail;
  if (formState.notes) payload.notes = formState.notes;
  if (formState.payment_detail)
    payload.payment_detail = formState.payment_detail;
  if (formState.reff_code) payload.reff_code = formState.reff_code;
  if (formState.third_party_id)
    payload.third_party_id = formState.third_party_id;
  if (formState.payment_url) payload.payment_url = formState.payment_url;

  // console.log(payload);

  mutate(payload);
};
</script>
