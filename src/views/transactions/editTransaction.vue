<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12" lg="12">
        <div v-if="isLoadingTx" class="text-center p-5">
          <b-spinner variant="primary" />
          <p class="mt-2 text-muted">Memuat data transaksi...</p>
        </div>

        <div v-else-if="!txData" class="alert alert-danger">
          Transaksi tidak ditemukan.
        </div>

        <form v-else @submit.prevent="handleSubmit">
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
                <b-form-select
                  v-model="formState.status"
                  :state="v$.status.$dirty ? !v$.status.$error : null"
                >
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
                {{ isPending ? "Menyimpan..." : "Simpan Perubahan" }}
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
import { computed, reactive, ref, watch } from "vue";
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
import CurrencyInput from "@/components/CurrencyInput.vue";
import {
  getTransactionById,
  updateTransaction,
} from "@/services/transactionService";
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
const txId = computed(() => Number(route.params.id));

const DEDICATED_TYPES = ["donation", "event", "zakat"] as const;
type DedicatedType = (typeof DEDICATED_TYPES)[number];

const activeType = ref<DedicatedType>("donation");

const ZAKAT_TYPE_LIST = [
  { value: 1, text: "Zakat Fitrah" },
  { value: 2, text: "Zakat Maal" },
  { value: 3, text: "Zakat Fidyah" },
];

const zakatTypeList = computed(() => [
  { value: 0, text: "Pilih jenis zakat..." },
  ...ZAKAT_TYPE_LIST,
]);

const formState = reactive({
  date: "",
  time: "",
  status: "Paid",
  source: "CRM",
  doa: "",
  jurnal_id: null as number | null,
  payment_method_id: null as number | null,
});

type TransactionItem = {
  id?: number;
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
const itemError = ref("");
const selectedJurnal = ref<{ value: number; text: string } | null>(null);

// Fetch Transaction by ID
const { data: txData, isLoading: isLoadingTx } = useQuery({
  queryKey: computed(() => ["transactions", txId.value]),
  queryFn: () => getTransactionById(txId.value),
  enabled: computed(() => !!txId.value),
});

const extractDate = (iso: string) => {
  if (!iso) return "";
  if (iso.includes("T")) return iso.split("T")[0];
  if (iso.includes(" ")) return iso.split(" ")[0];
  return iso;
};

const extractTime = (iso: string) => {
  if (!iso) return "";
  if (iso.includes("T")) {
    const t = new Date(iso);
    if (!isNaN(t.getTime())) {
      return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
    }
  }
  if (iso.includes(" ")) {
    const parts = iso.split(" ");
    return parts[1]?.substring(0, 8) || "";
  }
  return iso.substring(0, 8);
};

const getDetectedType = (data: any): DedicatedType => {
  const queryType = route.query.type;
  if (
    typeof queryType === "string" &&
    DEDICATED_TYPES.includes(queryType as DedicatedType)
  ) {
    return queryType as DedicatedType;
  }
  const rawType = (
    data?.type ||
    data?.transaction_type?.name ||
    data?.transaction_details?.[0]?.detail_type ||
    ""
  ).toLowerCase();

  if (rawType.includes("event")) return "event";
  if (rawType.includes("zakat")) return "zakat";
  return "donation";
};

watch(
  txData,
  async (data) => {
    if (!data) return;

    activeType.value = getDetectedType(data);

    formState.date = extractDate(data.date ?? "");
    formState.time = extractTime(data.time ?? "");
    formState.status = data.status ?? "Paid";
    formState.source = data.source ?? "CRM";
    formState.doa = data.doa ?? data.notes ?? "";
    formState.payment_method_id = data.payment_method_id ?? null;
    formState.jurnal_id = data.jurnal_id ?? (data.jurnal?.id ?? null);

    if (data.jurnal) {
      selectedJurnal.value = {
        value: data.jurnal.id,
        text:
          data.jurnal.akun_name ||
          data.jurnal.name ||
          `Jurnal #${data.jurnal.id}`,
      };
    }

    userId.value = data.user_id ?? (data.user?.id ?? null);
    if (data.user) {
      userDisplay.value = `${data.user.name || "User"} - ${data.user.phone || ""}`;
    } else if (userId.value) {
      userDisplay.value = `User #${userId.value}`;
      try {
        const u = await getUserById(userId.value);
        if (u) userDisplay.value = `${u.name} - ${u.phone || ""}`;
      } catch (e) {
        // ignore
      }
    }

    if (
      data.transaction_details &&
      Array.isArray(data.transaction_details) &&
      data.transaction_details.length > 0
    ) {
      items.value = data.transaction_details.map((d: any) => ({
        id: d.id,
        program_id: d.program_id ?? (d.program?.id ?? null),
        gross_nominal: Number(d.gross_nominal ?? d.nominal ?? 0),
        discount: Number(d.discount ?? 0),
        event_id: d.event_id ?? (d.event?.id ?? null),
        quantity: Number(d.quantity ?? 1),
        zakat_id: d.zakat_id ?? null,
      }));
    } else {
      items.value = [makeItem()];
    }
  },
  { immediate: true },
);

// Jurnal unclaimed list
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

  const options = list.map((t: any) => ({
    value: t.id,
    text: t.akun_name || `Jurnal #${t.id}`,
  }));

  if (
    selectedJurnal.value &&
    !options.some((o: any) => o.value === selectedJurnal.value?.value)
  ) {
    options.unshift(selectedJurnal.value);
  }

  return [
    {
      value: 0,
      text: options.length ? "Pilih jurnal..." : "Klik Cek Mutasi untuk mencari",
    },
    ...options,
  ];
});

const checkMutation = () => {
  if (!formState.payment_method_id || !donationGrandTotal.value) {
    toast.warning("Pilih payment method dan isi nominal item terlebih dahulu.");
    return;
  }
  refetchUnclaimed();
};

// Program list
const { data: programData, isLoading: isProgramLoading } = useQuery({
  queryKey: ["program-list"],
  queryFn: getAllPrograms,
});

const programList = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  return [
    { value: 0, text: "Pilih program..." },
    ...list.map((p: any) => ({ value: p.id, text: p.title || p.name })),
  ];
});

// Event list
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
  ...eventRawList.value.map((e: any) => ({
    value: e.id,
    text: e.title || e.name,
  })),
]);

const eventOf = (item: TransactionItem) =>
  eventRawList.value.find((e: any) => e.id === item.event_id);

const donationProgramType = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  const selected = list.find((p: any) => p.id === items.value[0]?.program_id);
  return (selected?.tipe?.nama ?? "infaq").toLowerCase();
});

// Payment method list
const { data: paymentMethodData, isLoading: isPaymentMethodLoading } = useQuery({
  queryKey: ["payment-method-list"],
  queryFn: getAllPaymentMethods,
});

const paymentMethodList = computed(() => {
  const list = Array.isArray(paymentMethodData.value)
    ? paymentMethodData.value
    : [];
  return [
    { value: 0, text: "Pilih metode pembayaran" },
    ...list.map((p: any) => ({
      value: p.id,
      text: `${p.bank_reference?.name || p.name || "Bank"} | ${p.code || p.account_number || ""}`,
    })),
  ];
});

const rules = {
  date: { required: helpers.withMessage("Tanggal wajib diisi.", required) },
  time: { required: helpers.withMessage("Waktu wajib diisi.", required) },
  status: { required: helpers.withMessage("Status wajib dipilih.", required) },
  payment_method_id: {
    required: helpers.withMessage("Payment Method wajib dipilih.", required),
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

const buildDetails = () => {
  if (activeType.value === "donation") {
    if (!items.value.every((item) => item.program_id && item.gross_nominal > 0))
      return null;
    return items.value.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
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
      ...(item.id ? { id: item.id } : {}),
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
      ...(item.id ? { id: item.id } : {}),
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
    userIdError.value = "User tidak valid.";
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
