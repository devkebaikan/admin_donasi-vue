<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="nominal-form-edit"
          :title="`Edit Nominal${nominalData ? ': ' + nominalData.nama_pilihan : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data nominal...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data nominal.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Nama Pilihan -->
            <b-col md="6">
              <b-form-group label="Nama Pilihan" label-for="nama-pilihan">
                <b-form-input
                  id="nama-pilihan"
                  v-model="v$.nama_pilihan.$model"
                  type="text"
                  placeholder="e.g., Sedekah Rutin"
                  :state="v$.nama_pilihan.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.nama_pilihan.$error">
                  Nama pilihan wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Nominal -->
            <b-col md="6">
              <b-form-group label="Nominal" label-for="nominal">
                <CurrencyInput
                  id="nominal"
                  v-model="formState.nominal"
                  :key="`nominal-${formState.nominal}`"
                  placeholder="0"
                />
                <div
                  v-if="v$.nominal.$error"
                  class="invalid-feedback d-block"
                >
                  Nominal wajib diisi.
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
                  @click="router.push('/nominal')"
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
import CurrencyInput from "@/components/CurrencyInput.vue";
import { getNominalById, updateNominal } from "@/services/nominalService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const nominalId = computed(() => Number(route.params.id));

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  nama_pilihan: "",
  nominal: undefined as number | undefined,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  nama_pilihan: { required },
  nominal: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch data by ID ───────────────────────────────────────────────────────
const {
  data: nominalData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["default-nominal", nominalId],
  queryFn: () => getNominalById(nominalId.value),
  enabled: computed(() => !!nominalId.value),
});

// ── Pre-fill form ──────────────────────────────────────────────────────────
watch(
  nominalData,
  (data) => {
    if (!data) return;

    formState.nama_pilihan = data.nama_pilihan ?? "";
    formState.nominal = Number(data.nominal ?? 0);

    formReady.value = true;
  },
  { immediate: true },
);

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateNominalPayload, isPending } = useMutation({
  mutationFn: () =>
    updateNominal(nominalId.value, {
      nama_pilihan: formState.nama_pilihan.trim(),
      nominal: Number(formState.nominal ?? 0),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["default-nominal"] });
    queryClient.invalidateQueries({ queryKey: ["default-nominal", nominalId] });
    showToast("Nominal berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/nominal"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui nominal";
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

  updateNominalPayload();
};
</script>
