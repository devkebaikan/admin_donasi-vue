<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          :title="`Edit Keuangan${keuanganData ? ': ' + keuanganData.items : ''}`"
        >
          <!-- Loading -->
          <div v-if="isLoadingKeuangan" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data keuangan...</span>
          </div>

          <!-- Error -->
          <div v-else-if="isErrorKeuangan" class="alert alert-danger">
            Gagal memuat data. Silakan coba lagi.
          </div>

          <form v-else @submit.prevent="handleSubmit">
            <b-row class="g-3">
              <!-- Kegiatan -->
              <b-col md="6">
                <b-form-group label="Kegiatan" label-for="kegiatan-id">
                  <ChoicesSelect
                    id="kegiatan-id"
                    :modelValue="String(formState.kegiatan_id || 0)"
                    @update:modelValue="
                      (val) => {
                        formState.kegiatan_id = val === '0' ? 0 : Number(val);
                      }
                    "
                    :options="kegiatanList"
                    :isLoading="isKegiatanLoading"
                    :key="kegiatanList.length"
                  />
                  <div v-if="v$.kegiatan_id.$error" class="invalid-feedback d-block">
                    {{ v$.kegiatan_id.$errors[0].$message }}
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

              <!-- Items -->
              <b-col md="8">
                <b-form-group label="Items" label-for="items">
                  <b-form-input
                    id="items"
                    v-model="v$.items.$model"
                    type="text"
                    placeholder="e.g., Pembangunan Kelas IT"
                    :state="v$.items.$error ? false : null"
                    maxlength="255"
                  />
                  <b-form-invalid-feedback v-if="v$.items.$error">
                    {{ v$.items.$errors[0].$message }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <!-- Nominal -->
              <b-col md="4">
                <b-form-group label="Nominal" label-for="nominal">
                  <b-input-group prepend="Rp">
                    <b-form-input
                      id="nominal"
                      v-model="v$.nominal.$model"
                      type="number"
                      min="0"
                      placeholder="0"
                      :state="v$.nominal.$error ? false : null"
                    />
                  </b-input-group>
                  <b-form-invalid-feedback v-if="v$.nominal.$error" class="d-block">
                    {{ v$.nominal.$errors[0].$message }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <!-- Nota -->
              <b-col cols="12">
                <b-form-group label="Nota" label-for="nota">
                  <b-form-input
                    id="nota"
                    v-model="formState.nota"
                    type="text"
                    placeholder="Nomor nota atau keterangan..."
                    maxlength="255"
                  />
                  <small class="text-muted">Opsional</small>
                </b-form-group>
              </b-col>

              <!-- Spinner -->
              <b-col v-if="isPending" cols="12" class="text-center">
                <b-spinner variant="primary" class="me-2" />
                <span class="text-muted">Menyimpan perubahan...</span>
              </b-col>

              <!-- Actions -->
              <b-col cols="12">
                <div class="d-flex gap-2 justify-content-end mt-3">
                  <b-button
                    variant="outline-secondary"
                    :disabled="isPending"
                    @click="router.push('/keuangan')"
                  >
                    Batal
                  </b-button>
                  <b-button
                    type="submit"
                    variant="primary"
                    :disabled="isPending"
                  >
                    <b-spinner v-if="isPending" small class="me-1" />
                    Simpan Perubahan
                  </b-button>
                </div>
              </b-col>
            </b-row>
          </form>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import { useRoute } from "vue-router";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { getKeuanganById, updateKeuangan } from "@/services/projectKeuanganService";
import { getAllKegiatan } from "@/services/kegiatanService";
import { getAllMitra } from "@/services/mitraService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const queryClient = useQueryClient();

const keuanganId = Number(route.params.id);

const formState = reactive({
  kegiatan_id: 0,
  mitra_id: 0,
  items: "",
  nominal: 0,
  nota: "",
});

const rules = {
  kegiatan_id: {
    required: helpers.withMessage("Kegiatan wajib dipilih.", required),
    minValue: helpers.withMessage("Kegiatan wajib dipilih.", minValue(1)),
  },
  mitra_id: {
    required: helpers.withMessage("Mitra wajib dipilih.", required),
    minValue: helpers.withMessage("Mitra wajib dipilih.", minValue(1)),
  },
  items: {
    required: helpers.withMessage("Items wajib diisi.", required),
  },
  nominal: {
    required: helpers.withMessage("Nominal wajib diisi.", required),
    minValue: helpers.withMessage("Nominal tidak boleh negatif.", minValue(0)),
  },
};

const v$ = useVuelidate(rules, formState);

const {
  data: keuanganData,
  isLoading: isLoadingKeuangan,
  isError: isErrorKeuangan,
} = useQuery({
  queryKey: ["keuangan", keuanganId],
  queryFn: () => getKeuanganById(keuanganId),
  enabled: !!keuanganId,
});

watch(keuanganData, (data) => {
  if (!data) return;
  formState.kegiatan_id = data.kegiatan_id ?? 0;
  formState.mitra_id = data.mitra_id ?? 0;
  formState.items = data.items ?? "";
  formState.nominal = data.nominal ?? 0;
  formState.nota = data.nota ?? "";
});

const { data: kegiatanData, isLoading: isKegiatanLoading } = useQuery({
  queryKey: ["kegiatans-list"],
  queryFn: () => getAllKegiatan({ mode: "list" }),
});
const kegiatanList = computed(() => {
  const list = Array.isArray(kegiatanData.value) ? kegiatanData.value : [];
  return [
    { value: 0, text: "-- Pilih Kegiatan --" },
    ...list.map((k: any) => ({ value: k.id, text: k.nama ?? k.judul })),
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

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    updateKeuangan(keuanganId, {
      kegiatan_id: formState.kegiatan_id,
      mitra_id: formState.mitra_id,
      items: formState.items,
      nominal: formState.nominal,
      nota: formState.nota,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["project-keuangans"] });
    queryClient.invalidateQueries({ queryKey: ["keuangan", keuanganId] });
    showToast("Data keuangan berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/keuangan"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui data keuangan";
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
