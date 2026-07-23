<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Tipe Transaksi">
          <b-row class="g-3">
            <b-col md="6">
              <b-form-group label="Nama" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                  placeholder="e.g., Donasi"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  {{ v$.name.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Slug" label-for="slug">
                <b-form-input
                  id="slug"
                  v-model="v$.slug.$model"
                  :state="v$.slug.$error ? false : null"
                  maxlength="255"
                  placeholder="e.g., donation"
                />
                <b-form-invalid-feedback v-if="v$.slug.$error">
                  {{ v$.slug.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan...</span>
            </b-col>

            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/transaction-type')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />Simpan
                  Tipe Transaksi
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
import { useRouter } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createTransactionType } from "@/services/transactionTypeService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const formState = reactive({ name: "", slug: "" });

const rules = {
  name: { required: helpers.withMessage("Nama wajib diisi", required) },
  slug: { required: helpers.withMessage("Slug wajib diisi", required) },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    createTransactionType({
      name: formState.name.trim(),
      slug: formState.slug.trim(),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["transaction-types"] });
    showToast("Tipe transaksi berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/transaction-type"), 1500);
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal menyimpan", {
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
