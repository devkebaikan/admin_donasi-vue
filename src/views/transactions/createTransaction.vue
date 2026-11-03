<template>
  <GenericCreateTransaction v-if="!isDedicatedType" />

  <VerticalLayout v-else>
    <b-row>
      <b-col cols="12" lg="12">
        <form @submit.prevent="handleSubmit">
          <!-- 1. Informasi Detail (Tanggal, Waktu, Status, Source, User, Doa) -->
          <TransactionInfoSection
            :form-state="formState"
            :v$="v$"
            :user-display="userDisplay"
            :user-id-error="userIdError"
            @update:field="handleUpdateField"
          />

          <!-- 2. Item Detail Transaksi (Donation / Event / Zakat / Qurban) -->
          <TransactionItemsSection
            :active-type="activeType"
            :items="items"
            :program-list="programList"
            :is-program-loading="isProgramLoading"
            :event-list="eventList"
            :is-event-loading="isEventLoading"
            :event-raw-list="eventRawList"
            :zakat-program-list="zakatProgramList"
            :is-program-zakat-loading="isProgramZakatLoading"
            :zakat-type-list="zakatTypeList"
            :item-error="itemError"
            @add-item="addItem"
            @remove-item="removeItem"
          />

          <!-- 3. Detail Payment & Matching Mutation / Jurnal -->
          <TransactionPaymentSection
            :active-type="activeType"
            :form-state="formState"
            :v$="v$"
            :payment-method-options="paymentMethodOptions"
            :is-payment-method-loading="isPaymentMethodLoading"
            :active-grand-total="activeGrandTotal"
            :jurnal-options="jurnalOptions"
            :is-data-unclaimed="isDataUnclaimed"
            :is-pending="isPending"
            @update:field="handleUpdateField"
            @search-payment-method="(q) => (paymentMethodSearchQuery = q)"
            @check-mutation="checkMutation"
            @cancel="router.back()"
          />
        </form>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { useSearchSelect } from "@/composables/useSearchSelect";
import GenericCreateTransaction from "./components/GenericCreateTransaction.vue";
import {
  TransactionInfoSection,
  TransactionItemsSection,
  TransactionPaymentSection,
  type DedicatedType,
  type TransactionItem,
  type FormState,
} from "./components/create-transaction";
import { createTransaction } from "@/services/transactionService";
import router from "@/router";
import { getAllPaymentMethods } from "@/services/paymentMethodService";
import { getUserById } from "@/services/userService";
import {
  getAllPrograms,
  getProgramSetup,
  getTransactionUnclaimed,
} from "@/services/programService";
import { getEvents } from "@/services/eventService";
import { getZakatTypes } from "@/services/zakatService.js";

const route = useRoute();

const DEDICATED_TYPES = ["donation", "event", "zakat", "qurban"] as const;

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


const { data: typezakat, isLoading: isTypeZakatLoading } = useQuery({
  queryKey: ["zakat-type"],
  queryFn: getZakatTypes,
});

const zakatTypeList = computed(() => {
  const list = Array.isArray(typezakat.value) ? typezakat.value : [];
  return [
    { value: 0, text: "Pilih Tipe..." },
    ...list.map((p: any) => ({ value: p.id, text: p.name })),
  ];
});



const now = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

const formState = reactive<FormState>({
  date: defaultDate,
  time: defaultTime,
  status: "Paid",
  source: "CRM",
  doa: "",
  jurnal_id: null,
  payment_method_id: null,
});

const handleUpdateField = (field: keyof FormState, value: any) => {
  (formState as any)[field] = value;
};

// ── Item management ────────────────────────────────────────────────────────
const makeItem = (): TransactionItem => ({
  program_id: null,
  gross_nominal: 0,
  discount: 0,
  event_id: null,
  quantity: 1,
  zakat_id: null,
});

const items = ref<TransactionItem[]>([makeItem()]);

const addItem = () => {
  const item = makeItem();
  if (activeType.value === "zakat" && zakatSetupProgram.value?.id) {
    item.program_id = zakatSetupProgram.value.id;
  }
  items.value.push(item);
};
const removeItem = (idx: number) => items.value.splice(idx, 1);

const donationItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) - (item.discount || 0);
const zakatItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) * (item.quantity || 0);
const qurbanItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) * (item.quantity || 1);

const donationGrandTotal = computed(() =>
  items.value.reduce((sum, item) => sum + donationItemTotal(item), 0),
);
const zakatGrandTotal = computed(() =>
  items.value.reduce((sum, item) => sum + zakatItemTotal(item), 0),
);

const activeGrandTotal = computed(() => {
  if (activeType.value === "zakat") return zakatGrandTotal.value;
  return donationGrandTotal.value;
});

const userId = ref<number | null>(null);
const userDisplay = ref("");
const userIdError = ref("");

// ── Jurnal / Mutation Matching ─────────────────────────────────────────────
const {
  data: dataUnclaimed,
  isLoading: isDataUnclaimed,
  refetch: refetchUnclaimed,
} = useQuery({
  queryKey: ["transaction-unclaimed"],
  queryFn: () =>
    getTransactionUnclaimed({
      method: formState.payment_method_id,
      nominal: activeGrandTotal.value,
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
      text: t.outside_description,
    })),
  ];
});

const checkMutation = () => {
  if (!formState.payment_method_id || !activeGrandTotal.value) {
    toast.warning("Pilih payment method dan isi nominal item terlebih dahulu.");
    return;
  }
  formState.jurnal_id = null;
  refetchUnclaimed();
};

// ── Program & Program Setup Zakat ─────────────────────────────────────────
const { data: programZakat, isLoading: isProgramZakatLoading } = useQuery({
  queryKey: ["program-zakat"],
  queryFn: () => getProgramSetup("zakat"),
  enabled: computed(() => activeType.value === "zakat"),
});

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

const zakatSetupProgram = computed(() => {
  const raw = programZakat.value as any;
  if (!raw) return null;
  const target = raw?.data ?? raw;
  let parsedValue: any = null;
  if (typeof target?.value === "string") {
    try {
      parsedValue = JSON.parse(target.value);
    } catch {
      parsedValue = null;
    }
  } else if (typeof target?.value === "object") {
    parsedValue = target.value;
  }

  const progId = parsedValue?.id ? Number(parsedValue.id) : null;
  const progLink = parsedValue?.link ? String(parsedValue.link) : null;
  return { id: progId, link: progLink };
});

const zakatProgramList = computed(() => {
  const allProgs = Array.isArray(programData.value) ? programData.value : [];
  const setup = zakatSetupProgram.value;

  if (setup?.id) {
    const matched = allProgs.find(
      (p: any) => p.id === setup.id || (setup.link && p.link === setup.link),
    );
    if (matched) {
      return [{ value: matched.id, text: matched.title }];
    }
    return [
      {
        value: setup.id,
        text: setup.link
          ? `Program Zakat (${setup.link})`
          : `Program Zakat #${setup.id}`,
      },
    ];
  }

  return programList.value;
});

watch(
  [() => activeType.value, zakatSetupProgram],
  ([type, setup]) => {
    if (type === "zakat" && setup?.id) {
      items.value.forEach((item) => {
        if (!item.program_id) {
          item.program_id = setup.id;
        }
      });
    }
  },
  { immediate: true },
);

// ── Event Query ────────────────────────────────────────────────────────────
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

const donationProgramType = computed(() => {
  const list = Array.isArray(programData.value) ? programData.value : [];
  const selected = list.find((p: any) => p.id === items.value[0]?.program_id);
  return (selected?.tipe?.nama ?? "infaq").toLowerCase();
});

// ── Payment Methods ────────────────────────────────────────────────────────
const {
  searchQuery: paymentMethodSearchQuery,
  options: paymentMethodOptions,
  isLoading: isPaymentMethodLoading,
} = useSearchSelect({
  queryKey: "payment-methods-search",
  fetchFn: getAllPaymentMethods,
  optionsMapper: (p: any) => ({
    value: p.id,
    text: `${p.bank_reference?.name ?? p.bank_reference_name ?? "-"} | ${p.account_number ?? "-"}`,
  }),
  placeholder: "Pilih metode pembayaran...",
  limit: 10,
});

// ── Validation & Lifecycle ─────────────────────────────────────────────────
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

// ── Mutation & Submit ──────────────────────────────────────────────────────
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

  if (activeType.value === "qurban") {
    if (
      !items.value.every(
        (item) =>
          item.program_id && item.quantity >= 1 && item.gross_nominal > 0,
      )
    )
      return null;
    return items.value.map((item) => ({
      detail_type: "qurban",
      program_id: item.program_id,
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
    payload.total = zakatGrandTotal.value;
    if (formState.jurnal_id) payload.jurnal_id = formState.jurnal_id;
  }

  if (activeType.value === "qurban") {
    payload.total = items.value.reduce(
      (sum, item) => sum + qurbanItemTotal(item),
      0,
    );
  }

  mutate(payload);
};

watch(
  () => formState.status,
  (newStatus) => {
    if (newStatus !== "Paid") {
      formState.jurnal_id = null;
    }
  },
);
</script>
