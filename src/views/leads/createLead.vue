<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="lead-form-create" title="Tambah Lead Baru">
          <b-row class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Lead" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., John Doe"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  Nama lead wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Kode -->
            <b-col md="6">
              <b-form-group label="Kode" label-for="code">
                <b-form-input
                  id="code"
                  v-model="v$.code.$model"
                  type="text"
                  placeholder="e.g., JOHN123"
                  :state="v$.code.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.code.$error">
                  Kode lead wajib diisi.
                </b-form-invalid-feedback>
                <small class="text-muted"
                  >Kode unik untuk identifikasi lead</small
                >
              </b-form-group>
            </b-col>

            <!-- Tipe -->
            <b-col md="6">
              <b-form-group label="Tipe Lead" label-for="type">
                <ChoicesSelect
                  id="type"
                  :modelValue="v$.type.$model"
                  @update:modelValue="(val) => (v$.type.$model = val)"
                  :options="typeList"
                  :isLoading="isLoadingTypes"
                  :key="typeList.length"
                />
                <div v-if="v$.type.$error" class="invalid-feedback d-block">
                  Tipe lead wajib dipilih.
                </div>
                <div v-if="isLoadingTypes" class="mt-1">
                  <small class="text-muted">
                    <b-spinner small class="me-1" />Memuat pilihan tipe...
                  </small>
                </div>
              </b-form-group>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan lead...</span>
            </b-col>

            <!-- Tombol Submit -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  @click="router.push('/leads')"
                  :disabled="isPending"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  @click="handleSubmit"
                  :disabled="isPending"
                >
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Lead
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
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createLead, getLeadTypes } from "@/services/leadService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ChoicesSelect from "@/components/ChoicesSelect.vue";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

// ── Form state ─────────────────────────────────────────────────────────────
const formState = reactive({
  name: "",
  code: "",
  type: "",
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  name: { required },
  code: { required },
  type: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch lead types ────────────────────────────────────────────────────────
const { data: leadTypes, isLoading: isLoadingTypes } = useQuery({
  queryKey: ["lead-types"],
  queryFn: getLeadTypes,
});

const typeList = computed(() => {
  if (!leadTypes.value) return [{ value: "", text: "Choose Type..." }];
  return [
    { value: "", text: "Choose Type..." },
    ...leadTypes.value.map((item: any) => ({
      value: item.value,
      text: item.label,
    })),
  ];
});

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: createLeadPayload, isPending } = useMutation({
  mutationFn: (payload: { code: string; name: string; type: string }) =>
    createLead(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    showToast("Lead berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/leads"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan lead";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

// ── Submit ─────────────────────────────────────────────────────────────────
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

  createLeadPayload({
    name: formState.name.trim(),
    code: formState.code.trim(),
    type: formState.type,
  });
};
</script>
