<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Project Ajuan">
          <b-row class="g-3">
            <!-- Project -->
            <b-col md="6">
              <b-form-group label="Project" label-for="project-id">
                <ChoicesSelect
                  id="project-id"
                  :modelValue="String(formState.project_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.project_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="projectList"
                  :isLoading="isProjectLoading"
                  :key="projectList.length"
                />
                <div
                  v-if="v$.project_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.project_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col>

            <!-- Mitra -->
            <b-col md="6">
              <b-form-group label="Mitra" label-for="mitra-id">
                <ChoicesSelect
                  id="mitra-id"
                  :modelValue="String(formState.mitra_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.mitra_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="mitraList"
                  :isLoading="isMitraLoading"
                  :key="mitraList.length"
                />
                <div v-if="v$.mitra_id.$error" class="invalid-feedback d-block">
                  {{ v$.mitra_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col>

            <!-- Tipe -->
            <b-col md="4">
              <b-form-group label="Tipe" label-for="type">
                <b-form-select
                  id="type"
                  v-model="v$.type.$model"
                  :state="v$.type.$error ? false : null"
                >
                  <template #first>
                    <b-form-select-option value=""
                      >-- Pilih Tipe --</b-form-select-option
                    >
                  </template>
                  <b-form-select-option value="ajuan"
                    >Ajuan</b-form-select-option
                  >
                  <b-form-select-option value="refund"
                    >Refund</b-form-select-option
                  >
                  <b-form-select-option value="more">More</b-form-select-option>
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.type.$error">
                  {{ v$.type.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Nominal Ajuan -->
            <b-col md="4">
              <b-form-group label="Nominal Ajuan" label-for="nominal-ajuan">
                <b-input-group prepend="Rp">
                  <!-- <b-form-input
                    id="nominal-ajuan"
                    v-model="v$.nominal_ajuan.$model"
                    type="number"
                    min="0"
                    placeholder="0"
                    :state="v$.nominal_ajuan.$error ? false : null"
                  /> -->
                  <CurrencyInput
                    id="nominal-ajuan"
                    placeholder="0"
                    v-model="v$.nominal_ajuan.$model"
                    :state="v$.nominal_ajuan.$error ? false : null"
                  />
                </b-input-group>
                <b-form-invalid-feedback
                  v-if="v$.nominal_ajuan.$error"
                  class="d-block"
                >
                  {{ v$.nominal_ajuan.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Biaya -->
            <b-col md="4">
              <b-form-group label="Biaya" label-for="biaya">
                <b-input-group prepend="Rp">
                  <CurrencyInput
                    id="biaya"
                    placeholder="0"
                    v-model="formState.biaya"
                    :state="null"
                  />
                </b-input-group>
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <b-col cols="12">
              <hr class="my-1" />
              <h6 class="text-muted fw-semibold mb-3">Informasi Rekening</h6>
            </b-col>

            <!-- Bank Reference -->
            <b-col md="12">
              <b-form-group label="Bank" label-for="bank-reference-id">
                <ChoicesSelect
                  id="bank-reference-id"
                  :modelValue="String(formState.bank_reference_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.bank_reference_id =
                        val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="bankList"
                  :isLoading="isBankLoading"
                  :key="bankList.length"
                />
                <div
                  v-if="v$.bank_reference_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.bank_reference_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col>

            <!-- Atas Nama -->
            <b-col md="6">
              <b-form-group label="Atas Nama" label-for="account-behalf">
                <b-form-input
                  id="account-behalf"
                  v-model="v$.account_behalf.$model"
                  type="text"
                  placeholder="e.g., Budi Santoso"
                  :state="v$.account_behalf.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.account_behalf.$error">
                  {{ v$.account_behalf.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Nomor Rekening -->
            <b-col md="6">
              <b-form-group label="Nomor Rekening" label-for="account-number">
                <b-form-input
                  id="account-number"
                  v-model="v$.account_number.$model"
                  type="text"
                  placeholder="e.g., 1234567890"
                  :state="v$.account_number.$error ? false : null"
                  maxlength="100"
                />
                <b-form-invalid-feedback v-if="v$.account_number.$error">
                  {{ v$.account_number.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Spinner -->
            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan data...</span>
            </b-col>

            <!-- Actions -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end mt-3">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/ajuan')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Ajuan
                </b-button>
              </div>
            </b-col>
          </b-row>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { createAjuan } from "@/services/ajuanService";
import { getProjects } from "@/services/projectService";
import { getAllMitra } from "@/services/mitraService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  project_id: 0,
  mitra_id: 0,
  bank_reference_id: 0,
  account_behalf: "",
  account_number: "",
  nominal_ajuan: 0,
  biaya: 0,
  type: "",
});

const rules = {
  project_id: {
    required: helpers.withMessage("Project wajib dipilih.", required),
    minValue: helpers.withMessage("Project wajib dipilih.", minValue(1)),
  },
  mitra_id: {
    required: helpers.withMessage("Mitra wajib dipilih.", required),
    minValue: helpers.withMessage("Mitra wajib dipilih.", minValue(1)),
  },
  bank_reference_id: {
    required: helpers.withMessage("Bank wajib dipilih.", required),
    minValue: helpers.withMessage("Bank wajib dipilih.", minValue(1)),
  },
  account_behalf: {
    required: helpers.withMessage("Atas nama wajib diisi.", required),
  },
  account_number: {
    required: helpers.withMessage("Nomor rekening wajib diisi.", required),
  },
  nominal_ajuan: {
    required: helpers.withMessage("Nominal ajuan wajib diisi.", required),
    minValue: helpers.withMessage("Nominal tidak boleh negatif.", minValue(0)),
  },
  type: {
    required: helpers.withMessage("Tipe wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const { data: projectData, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getProjects({ mode: "list" }),
});
const projectList = computed(() => {
  const list = Array.isArray(projectData.value) ? projectData.value : [];
  return [
    { value: 0, text: "-- Pilih Project --" },
    ...list.map((p: any) => ({
      value: p.id,
      text: p.judul ?? p.name ?? p.title,
    })),
  ];
});

const { data: mitraData, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitras-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});
const mitraList = computed(() => {
  const list = Array.isArray(mitraData.value) ? mitraData.value : [];
  return [
    { value: 0, text: "-- Pilih Mitra --" },
    ...list.map((m: any) => ({ value: m.id, text: m.nama ?? m.name })),
  ];
});

const { data: bankData, isLoading: isBankLoading } = useQuery({
  queryKey: ["bank-references-list"],
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

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    createAjuan({
      project_id: formState.project_id,
      mitra_id: formState.mitra_id,
      bank_reference_id: formState.bank_reference_id,
      account_behalf: formState.account_behalf,
      account_number: formState.account_number,
      nominal_ajuan: formState.nominal_ajuan,
      biaya: formState.biaya,
      type: formState.type,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["project-ajuans"] });
    showToast("Data ajuan berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/ajuan"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menyimpan data ajuan";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Lengkapi semua field yang wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
