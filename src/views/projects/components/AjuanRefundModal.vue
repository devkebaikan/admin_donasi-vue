<template>
  <b-modal
    v-model="showModal"
    :title="config.title"
    centered
    :ok-disabled="isActionPending"
    :ok-title="config.okTitle"
    cancel-title="Batal"
    ok-variant="success"
    @ok.prevent="handleSubmit"
  >
    <b-row class="g-3">
      <!-- Tipe -->
      <b-col cols="12">
        <b-form-group label="Tipe" label-for="form-type">
          <b-form-input id="form-type" :model-value="config.label" disabled />
        </b-form-group>
      </b-col>

      <!-- Nominal -->
      <b-col cols="12">
        <b-form-group :label="config.nominalLabel" label-for="form-nominal">
          <b-input-group prepend="Rp">
            <CurrencyInput
              id="form-nominal"
              v-model="form.nominal_ajuan"
              placeholder="0"
              :state="nominalError ? false : null"
            />
          </b-input-group>
          <small class="text-muted">
            Maksimal: Rp {{ formatRupiah(maxNominal) }}
          </small>
          <div v-if="nominalError" class="invalid-feedback d-block">
            {{ nominalError }}
          </div>
        </b-form-group>
      </b-col>

      <!-- Bank Sumber -->
      <b-col cols="12">
        <b-form-group label="Bank Sumber" label-for="form-bank-id">
          <ChoicesSelect
            id="form-bank-id"
            :modelValue="String(form.bank_reference_id || 0)"
            @update:modelValue="
              (val: any) => {
                form.bank_reference_id = val === '0' ? 0 : Number(val);
              }
            "
            :options="bankOptions"
            :isLoading="isBankLoading"
            :key="bankOptions.length"
          />
          <div v-if="bankError" class="invalid-feedback d-block">
            {{ bankError }}
          </div>
        </b-form-group>
      </b-col>

      <b-col cols="12" v-if="isBankAccountIncomplete">
        <div class="p-2 rounded bg-light">
          <div class="fw-semibold text-warning-emphasis mb-1">
            Data Rekening Mitra Belum Lengkap
          </div>
          <small class="text-muted">
            Sebelum membuat {{ config.label.toLowerCase() }}, silakan lengkapi
            data rekening mitra pada halaman Edit Mitra.
          </small>

          <div class="mt-2">
            <RouterLink
              :to="`/mitra/${form.mitra_id}/edit`"
              class="btn btn-sm btn-outline-success"
            >
              Edit Mitra
            </RouterLink>
          </div>
        </div>
      </b-col>

      <!-- Nama Pemilik Rekening -->
      <b-col cols="12">
        <b-form-group
          label="Nama Pemilik Rekening"
          label-for="form-account-behalf"
        >
          <b-form-input
            disabled
            id="form-account-behalf"
            v-model="form.account_behalf"
            type="text"
            placeholder="..."
            maxlength="255"
          />
        </b-form-group>
      </b-col>

      <!-- Nomor Rekening -->
      <b-col cols="12">
        <b-form-group label="Nomor Rekening" label-for="form-account-number">
          <b-form-input
            disabled
            id="form-account-number"
            v-model="form.account_number"
            type="text"
            placeholder="..."
            maxlength="100"
          />
        </b-form-group>
      </b-col>
    </b-row>

    <div v-if="isActionPending" class="text-center mt-3">
      <b-spinner variant="success" small class="me-1" />
      <span class="text-muted small">Menyimpan...</span>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { createAjuan } from "@/services/ajuanService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import { getProjectById } from "@/services/projectService";
import { getMitraById } from "@/services/mitraService";
import { getAllPaymentMethods } from "@/services/paymentMethodService";

type Mode = "ajuan" | "refund";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    projectId: number;
    mode: Mode;
  }>(),
  {
    modelValue: false,
    projectId: 0,
    mode: "ajuan",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Config per mode — satu-satunya tempat perbedaan ajuan vs refund didefinisikan
const MODE_CONFIG: Record<
  Mode,
  {
    title: string;
    okTitle: string;
    label: string;
    nominalLabel: string;
    successMsg: string;
    errorMsg: string;
    invalidateKey: string;
    maxField: "total_alokasi" | "sisa_dana_mitra";
    maxExceededMsg: (max: string) => string;
  }
> = {
  ajuan: {
    title: "Buat Ajuan Project",
    okTitle: "Buat Ajuan",
    label: "Ajuan",
    nominalLabel: "Nominal Ajuan",
    successMsg: "Ajuan berhasil dibuat",
    errorMsg: "Gagal membuat ajuan",
    invalidateKey: "project-ajuans",
    maxField: "total_alokasi",
    maxExceededMsg: (max) =>
      `Nominal ajuan tidak boleh melebihi total alokasi (Rp ${max})`,
  },
  refund: {
    title: "Refund Project",
    okTitle: "Buat Refund",
    label: "Refund",
    nominalLabel: "Nominal Refund",
    successMsg: "Refund berhasil dibuat",
    errorMsg: "Gagal membuat refund",
    invalidateKey: "project-refunds",
    maxField: "sisa_dana_mitra",
    maxExceededMsg: (max) =>
      `Nominal refund tidak boleh melebihi sisa dana (Rp ${max})`,
  },
};

const config = computed(() => MODE_CONFIG[props.mode]);
const isBankAccountIncomplete = computed(() => {
  return !form.account_behalf?.trim() || !form.account_number?.trim();
});
const queryClient = useQueryClient();

const form = reactive({
  mitra_id: "",
  bank_reference_id: 0,
  account_behalf: "",
  account_number: "",
  nominal_ajuan: 0,
  biaya: 0,
});

const nominalError = ref("");
const bankError = ref("");

const { data: projectData } = useQuery({
  queryKey: computed(() => ["project-detail", props.projectId]),
  queryFn: () => getProjectById(props.projectId),
  enabled: computed(() => props.projectId > 0),
});

const maxNominal = computed(() => {
  const field = config.value.maxField;
  return Number(projectData.value?.[field] ?? 0);
});

const formatRupiah = (val: number) => val.toLocaleString("id-ID");

watch(
  [() => showModal.value, () => projectData.value],
  ([isOpen, project]) => {
    if (!isOpen || !project) return;

    form.mitra_id = String(project.mitra_utama?.id ?? "");
  },
  { immediate: true },
);

const { data: detailMitra } = useQuery({
  queryKey: ["detail-mitra", form.mitra_id],
  queryFn: () => getMitraById(Number(form.mitra_id)),
  enabled: computed(() => form.mitra_id !== ""),
});

watch(
  [() => showModal.value, () => detailMitra.value],
  ([isOpen, mitra]) => {
    if (!isOpen || !mitra) return;

    const data = mitra.data ?? mitra;

    form.account_behalf = data.account_behalf ?? "";
    form.account_number = data.account_number ?? "";
    form.bank_reference_id = data.bank_refferences_id ?? 0;
  },
  { immediate: true },
);

watch(
  () => showModal.value,
  (isOpen) => {
    if (!isOpen) {
      form.mitra_id = "";
      form.bank_reference_id = 0;
      form.account_behalf = "";
      form.account_number = "";
      form.nominal_ajuan = 0;
      form.biaya = 0;
      nominalError.value = "";
      bankError.value = "";
    }
  },
);

const { data: bankData, isLoading: isBankLoading } = useQuery({
  queryKey: ["bank-references-list"],
  queryFn: () => getAllPaymentMethods({ usage: "penampung", is_active: true }),
});

const bankOptions = computed(() => {
  const raw = bankData.value;
  const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
  return [
    { value: 0, text: "-- Pilih Bank Reference --" },
    ...list.map((b: any) => ({
      value: b.id,
      text: `${b.fin_akun_detail.name}`,
    })),
  ];
});

const { mutate: mutateForm, isPending: isActionPending } = useMutation({
  mutationFn: () =>
    createAjuan({
      project_id: props.projectId,
      mitra_id: Number(form.mitra_id),
      bank_reference_id: form.bank_reference_id,
      account_behalf: form.account_behalf,
      account_number: form.account_number,
      nominal_ajuan: form.nominal_ajuan,
      biaya: form.biaya,
      type: props.mode,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [config.value.invalidateKey] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    toast(config.value.successMsg, { type: "success", position: "top-center" });
    showModal.value = false;
    emit("success");
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? config.value.errorMsg;
    toast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = () => {
  nominalError.value = "";
  bankError.value = "";

  if (!form.mitra_id) {
    toast("Mitra wajib dipilih", { type: "warning", position: "top-center" });
    return;
  }

  if (!form.bank_reference_id) {
    bankError.value = "Bank wajib dipilih";
    return;
  }

  if (!form.account_behalf.trim()) {
    toast("Atas nama wajib diisi", { type: "warning", position: "top-center" });
    return;
  }

  if (!form.account_number.trim()) {
    toast("Nomor rekening wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (!form.nominal_ajuan || form.nominal_ajuan <= 0) {
    toast(`Nominal ${config.value.label.toLowerCase()} harus lebih dari 0`, {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (form.nominal_ajuan > maxNominal.value) {
    toast(
      `Nominal ${config.value.label.toLowerCase()} tidak boleh lebih dari ${formatRupiah(maxNominal.value)}`,
      {
        type: "warning",
        position: "top-center",
      },
    );
    return;
  }

  if (maxNominal.value > 0 && form.nominal_ajuan > maxNominal.value) {
    nominalError.value = config.value.maxExceededMsg(
      formatRupiah(maxNominal.value),
    );
    return;
  }

  mutateForm();
};
</script>
