<template>
  <PipelineLayout>
    <UIComponentCard title="Buat Benefit">
      <b-row class="g-3">
        <b-col cols="12">
          <b-form-group label="Judul Benefit" label-for="judul">
            <b-form-input
              id="judul"
              v-model="v$.judul.$model"
              :state="v$.judul.$error ? false : null"
              maxlength="255"
              placeholder="Contoh: E-Book Panduan Wakaf Produktif"
            />
            <b-form-invalid-feedback v-if="v$.judul.$error">
              {{ v$.judul.$errors[0].$message }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col md="6">
          <b-form-group label="Jenis Benefit" label-for="jenis">
            <b-form-select
              id="jenis"
              v-model="v$.jenis.$model"
              :state="v$.jenis.$error ? false : null"
            >
              <b-form-select-option value="">Pilih jenis</b-form-select-option>
              <b-form-select-option value="ebook">Ebook</b-form-select-option>
              <b-form-select-option value="kelas">Kelas</b-form-select-option>
              <b-form-select-option value="event">Event</b-form-select-option>
              <b-form-select-option value="recap">Recap</b-form-select-option>
            </b-form-select>
            <b-form-invalid-feedback v-if="v$.jenis.$error">
              {{ v$.jenis.$errors[0].$message }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col md="6">
          <b-form-group label="Periode" label-for="periode">
            <b-form-input
              id="periode"
              v-model="formState.periode"
              placeholder="Contoh: Juni 2026"
            />
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <b-form-group label="Deskripsi" label-for="deskripsi">
            <b-form-textarea
              id="deskripsi"
              v-model="formState.deskripsi"
              rows="4"
              placeholder="Deskripsi singkat benefit"
            />
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <b-form-group label="Link" label-for="link">
            <b-form-input
              id="link"
              v-model="formState.link"
              placeholder="https://contoh.link"
            />
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <b-form-group label="Pesan Template" label-for="pesan_template">
            <b-form-textarea
              id="pesan_template"
              v-model="v$.pesan_template.$model"
              :state="v$.pesan_template.$error ? false : null"
              rows="6"
              placeholder="Tulis template pesan untuk benefit ini"
            />
            <b-form-invalid-feedback v-if="v$.pesan_template.$error">
              {{ v$.pesan_template.$errors[0].$message }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col md="6">
          <b-form-group label="Emoji" label-for="emoji">
            <b-form-input
              id="emoji"
              v-model="formState.emoji"
              maxlength="4"
              placeholder="Contoh: 📖"
            />
          </b-form-group>
        </b-col>

        <b-col md="6">
          <b-form-group label="Status Publish" label-for="publish">
            <b-form-checkbox id="publish" v-model="formState.publish">
              Terbitkan sekarang
            </b-form-checkbox>
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <b-form-group label="Target Levels" label-for="target-levels">
            <ChoicesSelect
              id="target-levels"
              :modelValue="formState.target_levels"
              @update:modelValue="
                (value: string[]) => {
                  formState.target_levels = value;
                }
              "
              :options="targetLevelOptions"
              :choice-options="{ removeItemButton: true }"
              multiple
            />
            <small class="text-muted d-block mt-1">
              Pilih level yang boleh menerima benefit ini.
            </small>
          </b-form-group>
        </b-col>

        <b-col v-if="isPending" cols="12" class="text-center">
          <b-spinner variant="primary" class="me-2" />
          <span class="text-muted">Menyimpan...</span>
        </b-col>

        <b-col cols="12" class="d-flex gap-2 justify-content-end">
          <b-button
            variant="outline-secondary"
            :disabled="isPending"
            @click="router.push({ name: 'crm-benefit' })"
          >
            Batal
          </b-button>
          <b-button
            variant="primary"
            :disabled="isPending"
            @click="handleSubmit"
          >
            <b-spinner v-if="isPending" small class="me-1" />Simpan Benefit
          </b-button>
        </b-col>
      </b-row>
    </UIComponentCard>
  </PipelineLayout>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import PipelineLayout from "@/components/PipelineLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { createBenefit } from "@/services/benefitService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const targetLevelOptions = computed(() => [
  { value: "New", text: "New" },
  { value: "General", text: "General" },
  { value: "Bronze", text: "Bronze" },
  { value: "Silver", text: "Silver" },
  { value: "Gold", text: "Gold" },
  { value: "Platinum", text: "Platinum" },
]);

const formState = reactive({
  judul: "",
  jenis: "",
  periode: "",
  deskripsi: "",
  link: "",
  pesan_template: "",
  emoji: "",
  publish: false,
  target_levels: [] as string[],
});

const rules = {
  judul: { required: helpers.withMessage("Judul wajib diisi", required) },
  jenis: { required: helpers.withMessage("Jenis wajib dipilih", required) },
  pesan_template: {
    required: helpers.withMessage("Pesan template wajib diisi", required),
  },
};
const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const payload = {
      judul: formState.judul.trim(),
      jenis: formState.jenis,
      periode: formState.periode.trim() || undefined,
      deskripsi: formState.deskripsi.trim() || undefined,
      link: formState.link.trim() || undefined,
      pesan_template: formState.pesan_template,
      emoji: formState.emoji.trim() || undefined,
      publish: formState.publish,
      target_levels: formState.target_levels,
    };
    return createBenefit(payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["crm-benefits"] });
    showToast("Benefit berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push({ name: "crm-benefit" }), 1200);
  },
  onError: (error: any) => {
    showToast(error?.response?.data?.message ?? "Gagal menambahkan benefit", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  if (!(await v$.value.$validate())) {
    showToast("Lengkapi field wajib", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
