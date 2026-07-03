<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Tipe Program">
          <b-row class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama" label-for="nama">
                <b-form-input
                  id="nama"
                  v-model="v$.nama.$model"
                  type="text"
                  placeholder="e.g., ZAKAT"
                  :state="v$.nama.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.nama.$error">
                  {{ v$.nama.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Slug -->
            <b-col md="6">
              <b-form-group label="Slug" label-for="slug">
                <b-form-input
                  id="slug"
                  v-model="v$.slug.$model"
                  type="text"
                  placeholder="e.g., zakat"
                  :state="v$.slug.$error ? false : null"
                  maxlength="100"
                />
                <b-form-invalid-feedback v-if="v$.slug.$error">
                  {{ v$.slug.$errors[0].$message }}
                </b-form-invalid-feedback>
                <small class="text-muted">Maks. 100 karakter, unik</small>
              </b-form-group>
            </b-col>

            <!-- Keterangan -->
            <b-col cols="12">
              <b-form-group label="Keterangan" label-for="keterangan">
                <b-form-textarea
                  id="keterangan"
                  v-model="v$.keterangan.$model"
                  rows="3"
                  placeholder="Deskripsi tipe program..."
                  :state="v$.keterangan.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.keterangan.$error">
                  {{ v$.keterangan.$errors[0].$message }}
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
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/program-type')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Tipe
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
import { reactive } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createProgramType } from "@/services/programService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  nama: "",
  slug: "",
  keterangan: "",
});

const rules = {
  nama: {
    required: helpers.withMessage("Nama wajib diisi.", required),
  },
  slug: {
    required: helpers.withMessage("Slug wajib diisi.", required),
    maxLength: helpers.withMessage("Maks. 100 karakter.", maxLength(100)),
  },
  keterangan: {
    required: helpers.withMessage("Keterangan wajib diisi.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    createProgramType({
      nama: formState.nama,
      slug: formState.slug,
      keterangan: formState.keterangan,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-types"] });
    showToast("Tipe program berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/program-type"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menyimpan tipe program";
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
