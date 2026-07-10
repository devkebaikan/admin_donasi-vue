<template>
  <b-modal
    v-model="showModal"
    title="Buat Ajuan Project"
    centered
    :ok-disabled="isActionPending"
    ok-title="Buat Ajuan"
    cancel-title="Batal"
    ok-variant="success"
    @ok.prevent="handleSubmitAjuan"
  >
    <b-row class="g-3">
      <!-- Tipe -->
      <b-col cols="12">
        <b-form-group label="Tipe" label-for="ajuan-type">
          <b-form-select
            id="ajuan-type"
            v-model="ajuanForm.type"
            @change="ajuanFormError = ''"
            disabled
          >
            <option value="ajuan">Ajuan</option>
            <option value="refund">Refund</option>
            <option value="more">More</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <!-- Nominal Ajuan -->
      <b-col cols="12">
        <b-form-group label="Nominal Ajuan" label-for="ajuan-nominal">
          <b-input-group prepend="Rp">
            <CurrencyInput
              id="ajuan-nominal"
              v-model="ajuanForm.nominal_ajuan"
              placeholder="0"
              :state="null"
            />
          </b-input-group>
        </b-form-group>
      </b-col>

      <!-- Biaya -->
      <!-- <b-col cols="12">
        <b-form-group label="Biaya" label-for="ajuan-biaya">
          <b-input-group prepend="Rp">
            <CurrencyInput
              id="ajuan-biaya"
              v-model="ajuanForm.biaya"
              placeholder="0"
              :state="null"
            />
          </b-input-group>
          <small class="text-muted">Opsional</small>
        </b-form-group>
      </b-col> -->

      <!-- Bank Sumber -->
      <b-col cols="12">
        <b-form-group label="Bank Sumber" label-for="ajuan-bank-id">
          <ChoicesSelect
            id="ajuan-bank-id"
            :modelValue="String(ajuanForm.bank_reference_id || 0)"
            @update:modelValue="
              (val: any) => {
                ajuanForm.bank_reference_id = val === '0' ? 0 : Number(val);
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

      <!-- Atas Nama -->
      <b-col cols="12">
        <b-form-group label="Atas Nama" label-for="ajuan-account-behalf">
          <b-form-input
            id="ajuan-account-behalf"
            v-model="ajuanForm.account_behalf"
            type="text"
            placeholder="e.g., Budi Santoso"
            maxlength="255"
          />
        </b-form-group>
      </b-col>

      <!-- Nomor Rekening -->
      <b-col cols="12">
        <b-form-group label="Nomor Rekening" label-for="ajuan-account-number">
          <b-form-input
            id="ajuan-account-number"
            v-model="ajuanForm.account_number"
            type="text"
            placeholder="e.g., 1234567890"
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

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    projectId: number;
  }>(),
  {
    modelValue: false,
    projectId: 0,
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

const queryClient = useQueryClient();

const ajuanForm = reactive({
  mitra_id: "",
  bank_reference_id: 0,
  account_behalf: "",
  account_number: "",
  nominal_ajuan: 0,
  biaya: 0,
  type: "ajuan",
});

const ajuanFormError = ref("");
const bankError = ref("");

const { data: projectData } = useQuery({
  queryKey: computed(() => ["project-detail", props.projectId]),
  queryFn: () => getProjectById(props.projectId),
  enabled: computed(() => props.projectId > 0),
});

watch(
  () => projectData.value,
  (project) => {
    if (project?.mitra_utama) {
      ajuanForm.mitra_id = project.mitra_utama.id;
    } else {
      ajuanForm.mitra_id = "";
    }
  },
);

watch(
  () => showModal.value,
  (isOpen) => {
    if (!isOpen) {
      ajuanForm.mitra_id = "";
      ajuanForm.bank_reference_id = 0;
      ajuanForm.account_behalf = "";
      ajuanForm.account_number = "";
      ajuanForm.nominal_ajuan = 0;
      ajuanForm.biaya = 0;
      ajuanForm.type = "ajuan";
      ajuanFormError.value = "";
      bankError.value = "";
    }
  },
);

const { data: bankData, isLoading: isBankLoading } = useQuery({
  queryKey: ["bank-references-list"],
  queryFn: () => getAllBankReferences({ mode: "list" }),
});

const bankOptions = computed(() => {
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

const { mutate: mutateAjuan, isPending: isActionPending } = useMutation({
  mutationFn: () =>
    createAjuan({
      project_id: props.projectId,
      mitra_id: ajuanForm.mitra_id,
      bank_reference_id: ajuanForm.bank_reference_id,
      account_behalf: ajuanForm.account_behalf,
      account_number: ajuanForm.account_number,
      nominal_ajuan: ajuanForm.nominal_ajuan,
      biaya: ajuanForm.biaya,
      type: ajuanForm.type,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    toast("Ajuan berhasil dibuat", {
      type: "success",
      position: "top-center",
    });
    showModal.value = false;
    emit("success");
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal membuat ajuan";
    toast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmitAjuan = () => {
  ajuanFormError.value = "";
  bankError.value = "";

  if (!ajuanForm.mitra_id) {
    ajuanFormError.value = "Mitra wajib dipilih";
    return;
  }

  if (!ajuanForm.bank_reference_id) {
    bankError.value = "Bank wajib dipilih";
    return;
  }

  if (!ajuanForm.account_behalf.trim()) {
    toast("Atas nama wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (!ajuanForm.account_number.trim()) {
    toast("Nomor rekening wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (!ajuanForm.nominal_ajuan || ajuanForm.nominal_ajuan <= 0) {
    toast("Nominal ajuan harus lebih dari 0", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  // console.log(ajuanForm);
  mutateAjuan();
};
</script>
