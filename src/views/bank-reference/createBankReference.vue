<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="bank-ref-form-create"
          title="Tambah Bank Reference"
        >
          <b-row class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Bank" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., Bank Central Asia"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  Nama bank wajib diisi.
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
                  placeholder="e.g., BCA"
                  :state="v$.code.$error ? false : null"
                  maxlength="50"
                  style="text-transform: uppercase"
                />
                <b-form-invalid-feedback v-if="v$.code.$error">
                  Kode wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Tipe -->
            <b-col md="6">
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
                  <b-form-select-option value="bank">Bank</b-form-select-option>
                  <b-form-select-option value="e_wallet"
                    >E-Wallet</b-form-select-option
                  >
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.type.$error">
                  Tipe wajib dipilih.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Bank Provider -->
            <b-col md="6">
              <b-form-group
                label="Bank Provider (opsional)"
                label-for="bank_provider"
              >
                <b-form-input
                  id="bank_provider"
                  v-model="formState.bank_provider"
                  type="text"
                  placeholder="e.g., Xendit"
                  maxlength="100"
                />
              </b-form-group>
            </b-col>

            <!-- Status -->
            <b-col md="6">
              <b-form-group label="Status" label-for="is_active">
                <b-form-select id="is_active" v-model="formState.is_active">
                  <b-form-select-option value="1">Aktif</b-form-select-option>
                  <b-form-select-option value="0"
                    >Nonaktif</b-form-select-option
                  >
                </b-form-select>
              </b-form-group>
            </b-col>

            <!-- Logo -->
            <b-col md="6">
              <b-form-group label="Logo" label-for="logo">
                <b-form-file
                  id="logo"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleLogoChange"
                  placeholder="Pilih file logo..."
                />
                <small class="text-muted"
                  >Opsional — JPG/PNG/WebP, maks 2MB</small
                >
              </b-form-group>

              <div v-if="logoPreview" class="mt-2">
                <img
                  :src="logoPreview"
                  alt="Preview Logo"
                  class="img-thumbnail"
                  style="
                    max-height: 120px;
                    max-width: 120px;
                    object-fit: contain;
                  "
                />
              </div>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan data...</span>
            </b-col>

            <!-- Tombol Submit -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  @click="router.push('/bank-reference')"
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
                  Simpan
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
import { reactive, ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createBankReference } from "@/services/bankReferenceService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);

const formState = reactive({
  name: "",
  code: "",
  type: "",
  bank_provider: "",
  is_active: "1",
});

const rules = {
  name: { required },
  code: { required },
  type: { required },
};

const v$ = useVuelidate(rules, formState);

const handleLogoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  logoFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    logoPreview.value = null;
  }
};

const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("name", formState.name.trim());
    formData.append("code", formState.code.trim().toUpperCase());
    formData.append("type", formState.type);
    formData.append("is_active", formState.is_active);
    if (formState.bank_provider.trim())
      formData.append("bank_provider", formState.bank_provider.trim());
    if (logoFile.value) formData.append("image", logoFile.value);
    return createBankReference(formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["bank-references"] });
    showToast("Bank reference berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/bank-reference"), 1500);
  },
  onError: (err: any) => {
    const msg =
      err?.response?.data?.message ?? "Gagal menambahkan bank reference";
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

  submitCreate();
};
</script>
