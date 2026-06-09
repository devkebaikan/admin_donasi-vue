<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="percentage-form-edit"
          :title="`Edit Persentase${percentageData ? ': ' + percentageData.name : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data persentase...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data persentase.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., BENCANA"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  Nama wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Info total -->
            <b-col md="6" class="d-flex align-items-end pb-1">
              <div
                class="px-3 py-2 rounded w-100"
                :class="
                  totalPercentage === 100
                    ? 'bg-success bg-opacity-10 border border-success'
                    : 'bg-warning bg-opacity-10 border border-warning'
                "
              >
                <span class="small fw-semibold">Total: </span>
                <span
                  class="fw-bold"
                  :class="
                    totalPercentage === 100 ? 'text-success' : 'text-warning'
                  "
                >
                  {{ totalPercentage }}%
                </span>
                <span class="text-muted small ms-2">
                  {{ totalPercentage === 100 ? "(valid)" : "(harus = 100%)" }}
                </span>
              </div>
            </b-col>

            <!-- Program -->
            <b-col md="4">
              <b-form-group label="Program (%)" label-for="program">
                <b-form-input
                  id="program"
                  v-model.number="v$.program.$model"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 80"
                  :state="v$.program.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.program.$error">
                  Program wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Operasional -->
            <b-col md="4">
              <b-form-group label="Operasional (%)" label-for="operasional">
                <b-form-input
                  id="operasional"
                  v-model.number="v$.operasional.$model"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 15"
                  :state="v$.operasional.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.operasional.$error">
                  Operasional wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Komisi -->
            <b-col md="4">
              <b-form-group label="Komisi (%)" label-for="komisi">
                <b-form-input
                  id="komisi"
                  v-model.number="v$.komisi.$model"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 5"
                  :state="v$.komisi.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.komisi.$error">
                  Komisi wajib diisi.
                </b-form-invalid-feedback>
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
                  @click="router.push('/percentage')"
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
import {
  getPercentageById,
  updatePercentage,
} from "@/services/percentageService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const percentageId = computed(() => Number(route.params.id));

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  name: "",
  program: 0 as number,
  operasional: 0 as number,
  komisi: 0 as number,
});

// ── Computed total ─────────────────────────────────────────────────────────
const totalPercentage = computed(
  () =>
    Number(formState.program) +
    Number(formState.operasional) +
    Number(formState.komisi),
);

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  name: { required },
  program: { required },
  operasional: { required },
  komisi: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch data by ID ───────────────────────────────────────────────────────
const {
  data: percentageData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["program-percentage", percentageId],
  queryFn: () => getPercentageById(percentageId.value),
  enabled: computed(() => !!percentageId.value),
});

// ── Pre-fill form ──────────────────────────────────────────────────────────
watch(
  percentageData,
  (data) => {
    if (!data) return;

    formState.name = data.name ?? "";
    formState.program = Number(data.program ?? 0);
    formState.operasional = Number(data.operasional ?? 0);
    formState.komisi = Number(data.komisi ?? 0);

    formReady.value = true;
  },
  { immediate: true },
);

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updatePercentagePayload, isPending } = useMutation({
  mutationFn: () =>
    updatePercentage(percentageId.value, {
      name: formState.name.trim(),
      program: Number(formState.program),
      operasional: Number(formState.operasional),
      komisi: Number(formState.komisi),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-percentage"] });
    queryClient.invalidateQueries({
      queryKey: ["program-percentage", percentageId],
    });
    showToast("Persentase berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/percentage"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui persentase";
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

  updatePercentagePayload();
};
</script>
