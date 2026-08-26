<template>
  <GenericCreateTransaction v-if="!isDedicatedType" />

  <VerticalLayout v-else>
    <b-row>
      <b-col cols="12" lg="12">
        <form @submit.prevent="handleSubmit">
          <!-- Informasi Detail -->
          <UIComponentCard title="Informasi Detail" class="mb-3">
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
                <!-- disabled -->
                <b-form-select
                  v-model="formState.status"
                  :state="v$.status.$dirty ? !v$.status.$error : null"
                >
                  <b-form-select-option value="Paid">Paid</b-form-select-option>
                  <b-form-select-option value="Pending"
                    >Pending</b-form-select-option
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
                <label class="form-label fw-semibold required">User</label>
                <b-form-input :model-value="userDisplay" disabled />
                <div v-if="userIdError" class="invalid-feedback d-block">
                  {{ userIdError }}
                </div>
              </b-col>

              <b-col cols="12" :md="8">
                <label class="form-label fw-semibold">Doa</label>
                <b-form-input
                  v-model="formState.doa"
                  placeholder="Permohonan doa dari pendonor..."
                />
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Item Detail Transaksi -->
          <UIComponentCard title="Item Detail Transaksi" class="mb-3">
            <div
              v-for="(item, idx) in items"
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
                  v-if="items.length > 1"
                  variant="outline-danger"
                  size="sm"
                  @click="removeItem(idx)"
                >
                  <i class="bx bx-trash"></i>
                </b-button>
              </div>

              <b-row class="g-3" v-if="activeType === 'donation'">
                <b-col cols="12" md="6">
                  <label class="form-label fw-semibold required">Program</label>
                  <ChoicesSelect
                    :id="`donation-program-id-${idx}`"
                    :modelValue="String(item.program_id || 0)"
                    @update:modelValue="
                      (val: string) => {
                        item.program_id = val === '0' ? null : Number(val);
                      }
                    "
                    :options="programList"
                    :isLoading="isProgramLoading"
                    :key="programList.length"
                  />
                </b-col>

                <b-col cols="12" md="3">
                  <label class="form-label fw-semibold required"
                    >Gross Nominal</label
                  >
                  <CurrencyInput
                    v-model.number="item.gross_nominal"
                    placeholder="0"
                    :state="null"
                  />
                </b-col>

                <b-col cols="12" md="3">
                  <label class="form-label fw-semibold">Diskon</label>
                  <CurrencyInput
                    v-model.number="item.discount"
                    placeholder="0"
                    :state="null"
                  />
                </b-col>

                <!-- <b-col cols="12">
                  <div class="bg-light rounded p-2 d-inline-block">
                    <small class="text-muted d-block">Total</small>
                    <span class="fw-semibold">{{
                      formatCurrency(donationItemTotal(item))
                    }}</span>
                  </div>
                </b-col> -->
              </b-row>

              <b-row class="g-3" v-else-if="activeType === 'event'">
                <b-col cols="12" md="7">
                  <label class="form-label fw-semibold required">Event</label>
                  <ChoicesSelect
                    :id="`event-id-${idx}`"
                    :modelValue="String(item.event_id || 0)"
                    @update:modelValue="
                      (val: string) => {
                        item.event_id = val === '0' ? null : Number(val);
                      }
                    "
                    :options="eventList"
                    :isLoading="isEventLoading"
                    :key="eventList.length"
                  />
                </b-col>

                <b-col cols="12" md="3">
                  <label class="form-label fw-semibold required">Qty</label>
                  <CurrencyInput
                    v-model.number="item.quantity"
                    placeholder="1"
                    :state="null"
                  />
                </b-col>

                <b-col cols="12" v-if="eventOf(item)">
                  <div class="bg-light rounded p-2 d-inline-block">
                    <small class="text-muted d-block">Estimasi Total</small>
                    <span class="fw-semibold">{{
                      formatCurrency(
                        (eventOf(item)?.price || 0) * (item.quantity || 0),
                      )
                    }}</span>
                  </div>
                </b-col>
              </b-row>

              <b-row class="g-3" v-else-if="activeType === 'zakat'">
                <b-col cols="12" md="5">
                  <label class="form-label fw-semibold required">Program</label>
                  <ChoicesSelect
                    :id="`zakat-program-id-${idx}`"
                    :modelValue="String(item.program_id || 0)"
                    @update:modelValue="
                      (val: string) => {
                        item.program_id = val === '0' ? null : Number(val);
                      }
                    "
                    :options="programList"
                    :isLoading="isProgramLoading"
                    :key="programList.length"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required"
                    >Jenis Zakat</label
                  >
                  <ChoicesSelect
                    :id="`zakat-id-${idx}`"
                    :modelValue="String(item.zakat_id || 0)"
                    @update:modelValue="
                      (val: string) => {
                        item.zakat_id = val === '0' ? null : Number(val);
                      }
                    "
                    :options="zakatTypeList"
                  />
                </b-col>

                <b-col cols="12" md="3">
                  <label class="form-label fw-semibold required">Qty</label>
                  <CurrencyInput
                    v-model.number="item.quantity"
                    placeholder="1"
                    :state="null"
                  />
                </b-col>

                <b-col cols="12" md="4">
                  <label class="form-label fw-semibold required"
                    >Gross Nominal</label
                  >
                  <CurrencyInput
                    v-model.number="item.gross_nominal"
                    placeholder="0"
                    :state="null"
                  />
                </b-col>

                <b-col cols="12">
                  <div class="bg-light rounded p-2 d-inline-block">
                    <small class="text-muted d-block">Total</small>
                    <span class="fw-semibold">{{
                      formatCurrency(zakatItemTotal(item))
                    }}</span>
                  </div>
                </b-col>
              </b-row>
            </div>

            <b-button variant="outline-primary" size="sm" @click="addItem">
              <i class="bx bx-plus me-1"></i>Tambah Item
            </b-button>

            <div v-if="itemError" class="text-danger small mt-2">
              {{ itemError }}
            </div>
          </UIComponentCard>

          <!-- Detail Payment -->
          <UIComponentCard title="Detail Payment" class="mb-3">
            <b-row class="g-3">
              <b-col cols="12" md="6">
                <label class="form-label fw-semibold required"
                  >Payment Method</label
                >
                <ChoicesSelect
                  id="payment-method-id"
                  :modelValue="String(formState.payment_method_id || 0)"
                  @update:modelValue="
                    (val: string) => {
                      formState.payment_method_id =
                        val === '0' ? null : Number(val);
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
            </b-row>

            <b-row v-if="activeType === 'donation'" class="g-3 mt-1">
              <b-col cols="12">
                <hr class="my-1" />
                <h6 class="text-muted fw-semibold mb-3">
                  Pencocokan Mutasi / Jurnal
                </h6>
              </b-col>

              <b-col cols="12" md="4">
                <label class="form-label fw-semibold">Total Nominal</label>
                <b-form-input
                  :model-value="formatCurrency(donationGrandTotal)"
                  disabled
                />
              </b-col>

              <b-col cols="12" md="3" class="d-flex align-items-end">
                <b-button
                  variant="outline-primary"
                  class="w-100"
                  :disabled="isDataUnclaimed"
                  @click="checkMutation"
                >
                  <b-spinner v-if="isDataUnclaimed" small class="me-1" />
                  Cek Mutasi
                </b-button>
              </b-col>

              <b-col cols="12" md="5">
                <label class="form-label fw-semibold">Jurnal ID</label>
                <ChoicesSelect
                  id="jurnal-id"
                  :modelValue="String(formState.jurnal_id || 0)"
                  @update:modelValue="
                    (val: string) => {
                      formState.jurnal_id = val === '0' ? null : Number(val);
                    }
                  "
                  :options="jurnalOptions"
                  :isLoading="isDataUnclaimed"
                  :key="jurnalOptions.length"
                />
              </b-col>
            </b-row>

            <!-- Actions -->
            <div class="d-flex gap-2 mt-3">
              <b-button type="submit" variant="primary" :disabled="isPending">
                <b-spinner v-if="isPending" small class="me-1" />
                {{ isPending ? "Menyimpan..." : "Simpan Transaksi" }}
              </b-button>
              <b-button variant="outline-secondary" @click="router.back()">
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
import { computed, onMounted, reactive, ref } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import GenericCreateTransaction from "./components/GenericCreateTransaction.vue";
import { createTransaction } from "@/services/transactionService";
import router from "@/router";
import { getAllPaymentMethods } from "@/services/paymentMethodService";
import { getUserById } from "@/services/userService";
import {
  getAllPrograms,
  getTransactionUnclaimed,
} from "@/services/programService";
import { getEvents } from "@/services/eventService";
import { formatCurrency } from "@/helpers/format";

const route = useRoute();

const DEDICATED_TYPES = ["donation", "event", "zakat"] as const;
type DedicatedType = (typeof DEDICATED_TYPES)[number];

const activeType = computed<DedicatedType | null>(() => {
  const type = route.query.type;
  return typeof type === "string" &&
    DEDICATED_TYPES.includes(type as DedicatedType)
    ? (type as DedicatedType)
    : null;
});

const isDedicatedType = computed(() => activeType.value !== null);

const ZAKAT_TYPE_LIST = [
  { value: 1, text: "Zakat Fitrah" },
  { value: 2, text: "Zakat Maal" },
  { value: 3, text: "Zakat Fidyah" },
];
const zakatTypeList = computed(() => [
  { value: 0, text: "Pilih jenis zakat..." },
  ...ZAKAT_TYPE_LIST,
]);

const now = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

const formState = reactive({
  date: defaultDate,
  time: defaultTime,
  status: "Paid",
  source: "CRM",
  doa: "",
  jurnal_id: null as number | null,
  payment_method_id: null as number | null,
});

type TransactionItem = {
  program_id: number | null;
  gross_nominal: number;
  discount: number;
  event_id: number | null;
  quantity: number;
  zakat_id: number | null;
};

const makeItem = (): TransactionItem => ({
  program_id: null,
  gross_nominal: 0,
  discount: 0,
  event_id: null,
  quantity: 1,
  zakat_id: null,
});

const items = ref<TransactionItem[]>([makeItem()]);

const addItem = () => items.value.push(makeItem());
const removeItem = (idx: number) => items.value.splice(idx, 1);

const donationItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) - (item.discount || 0);
const zakatItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) * (item.quantity || 0);

const donationGrandTotal = computed(() =>
  items.value.reduce((sum, item) => sum + donationItemTotal(item), 0),
);

const userId = ref<number | null>(null);
const userDisplay = ref("");
const userIdError = ref("");

// jurnal id list (transaction unclaimed) — dicocokkan dari payment method + total nominal
const {
  data: dataUnclaimed,
  isLoading: isDataUnclaimed,
  refetch: refetchUnclaimed,
} = useQuery({
  queryKey: ["transaction-unclaimed"],
  queryFn: () =>
    getTransactionUnclaimed({
      method: formState.payment_method_id,
      nominal: donationGrandTotal.value,
    }),
  enabled: false,
});

const jurnalOptions = computed(() => {
  const raw = dataUnclaimed.value as any;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : [];
  return [
    {
      value: 0,
      text: list.length ? "Pilih jurnal..." : "Klik Cek Mutasi untuk mencari",
    },
    ...list.map((t: any) => ({
      value: t.id,
      text: t.akun_name,
    })),
  ];
});

const checkMutation = () => {
  if (!formState.payment_method_id || !donationGrandTotal.value) {
    toast.warning("Pilih payment method dan isi nominal item terlebih dahulu.");
    return;
  }
  formState.jurnal_id = null;
  refetchUnclaimed();
};

// program list
const { data: programData, isLoading: isProgramLoading } = useQuery({
  queryKey: ["program-list"],
  queryFn: getAllPrograms,
});

const programList = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  return [
    { value: 0, text: "Pilih program..." },
    ...list.map((p: any) => ({ value: p.id, text: p.title })),
  ];
});

// event list
const { data: eventData, isLoading: isEventLoading } = useQuery({
  queryKey: ["event-list-select"],
  queryFn: () => getEvents({ limit: 100 }),
  enabled: computed(() => activeType.value === "event"),
});

const eventRawList = computed(() => {
  const raw = eventData.value as any;
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.data) ? raw.data : [];
});

const eventList = computed(() => [
  { value: 0, text: "Pilih event..." },
  ...eventRawList.value.map((e: any) => ({ value: e.id, text: e.title })),
]);

const eventOf = (item: TransactionItem) =>
  eventRawList.value.find((e: any) => e.id === item.event_id);

const donationProgramType = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  const selected = list.find((p: any) => p.id === items.value[0]?.program_id);
  return (selected?.tipe?.nama ?? "infaq").toLowerCase();
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

const itemError = ref("");

const rules = {
  date: { required: helpers.withMessage("Tanggal wajib diisi.", required) },
  time: { required: helpers.withMessage("Waktu wajib diisi.", required) },
  status: { required: helpers.withMessage("Status wajib dipilih.", required) },
  payment_method_id: {
    required: helpers.withMessage("Payment Method wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

onMounted(async () => {
  const queryUserId = route.query.user_id;
  const id = Number(queryUserId);

  if (!queryUserId || !(id > 0)) {
    userIdError.value = "user_id tidak ditemukan pada URL.";
    return;
  }

  userId.value = id;
  const user = await getUserById(id);
  userDisplay.value = user ? `${user.name} - ${user.phone}` : `User #${id}`;
});

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

const buildDetails = () => {
  if (activeType.value === "donation") {
    if (!items.value.every((item) => item.program_id && item.gross_nominal > 0))
      return null;
    return items.value.map((item) => ({
      detail_type: "donation",
      discount: item.discount || 0,
      gross_nominal: item.gross_nominal || 0,
      program_id: item.program_id,
    }));
  }

  if (activeType.value === "event") {
    if (!items.value.every((item) => item.event_id && item.quantity >= 1))
      return null;
    return items.value.map((item) => ({
      detail_type: "event",
      quantity: item.quantity,
      event_id: item.event_id,
    }));
  }

  if (activeType.value === "zakat") {
    if (
      !items.value.every(
        (item) =>
          item.program_id &&
          item.zakat_id &&
          item.quantity >= 1 &&
          item.gross_nominal > 0,
      )
    )
      return null;
    return items.value.map((item) => ({
      detail_type: "zakat",
      program_id: item.program_id,
      zakat_id: item.zakat_id,
      quantity: item.quantity,
      gross_nominal: item.gross_nominal || 0,
    }));
  }

  return null;
};

const handleSubmit = async () => {
  itemError.value = "";
  const isValid = await v$.value.$validate();

  if (!userId.value) {
    userIdError.value = "user_id tidak ditemukan pada URL.";
    return;
  }

  const transactionDetails = buildDetails();
  if (!transactionDetails) {
    itemError.value = "Lengkapi setiap item detail transaksi.";
    return;
  }

  if (!isValid) return;

  const payload: Record<string, any> = {
    type: activeType.value,
    program_type:
      activeType.value === "donation"
        ? donationProgramType.value
        : activeType.value,
    transaction_details: transactionDetails,
    payment_method_id: formState.payment_method_id,
    doa: formState.doa || "",
    user_id: userId.value,
    status: formState.status,
    date: formState.date,
    time: formState.time,
    source: formState.source,
  };

  if (activeType.value === "donation") {
    payload.total = donationGrandTotal.value;
    if (formState.jurnal_id) payload.jurnal_id = formState.jurnal_id;
  }

  if (activeType.value === "zakat") {
    payload.total = items.value.reduce(
      (sum, item) => sum + zakatItemTotal(item),
      0,
    );
  }

  mutate(payload);
};
</script>
