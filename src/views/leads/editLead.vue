<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="lead-form-edit"
          :title="`Edit Lead${leadData ? ': ' + leadData.name : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingLead" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data lead...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data lead.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchLead">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
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
                  @update:modelValue="(val: any) => (v$.type.$model = val)"
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
              <span class="text-muted">Menyimpan perubahan...</span>
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
                  Simpan Perubahan
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
import { reactive, ref, computed, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getLeadById, updateLead, getLeadTypes } from "@/services/leadService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const leadId = computed(() => Number(route.params.id));

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

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

// ── Fetch lead by ID ───────────────────────────────────────────────────────
const {
  data: leadData,
  isLoading: isFetchingLead,
  isError: fetchError,
  refetch: refetchLead,
} = useQuery({
  queryKey: ["lead", leadId],
  queryFn: () => getLeadById(leadId.value),
  enabled: computed(() => !!leadId.value),
});

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

// ── Pre-fill form saat data tersedia ──────────────────────────────────────
watch(
  leadData,
  (data) => {
    if (!data) return;

    formState.name = data.name ?? "";
    formState.code = data.code ?? "";
    formState.type = data.type ?? "";

    formReady.value = true;
  },
  { immediate: true },
);

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateLeadPayload, isPending } = useMutation({
  mutationFn: (payload: { code: string; name: string; type: string }) =>
    updateLead(leadId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    showToast("Lead berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/leads"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui lead";
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

  updateLeadPayload({
    name: formState.name.trim(),
    code: formState.code.trim(),
    type: formState.type,
  });
};
</script>
