<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="bank-ref-form-edit"
          :title="`Edit Bank Reference${bankData ? ': ' + bankData.name : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data bank reference...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data bank reference.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
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
                <!-- Preview logo existing -->
                <div v-if="existingImageUrl && !logoPreview" class="mb-2">
                  <p class="text-muted small mb-1">Logo saat ini:</p>
                  <img
                    :src="existingImageUrl"
                    alt="Logo Saat Ini"
                    class="img-thumbnail"
                    style="
                      max-height: 120px;
                      max-width: 120px;
                      object-fit: contain;
                    "
                  />
                </div>

                <b-form-file
                  id="logo"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleLogoChange"
                  :placeholder="
                    existingImageUrl
                      ? 'Ganti logo (opsional)...'
                      : 'Pilih file logo...'
                  "
                />
                <small class="text-muted">
                  {{
                    existingImageUrl
                      ? "Kosongkan jika tidak ingin mengganti logo."
                      : "Opsional — JPG/PNG/WebP, maks 2MB"
                  }}
                </small>
              </b-form-group>

              <!-- Preview logo baru -->
              <div v-if="logoPreview" class="mt-2">
                <p class="text-muted small mb-1">Preview logo baru:</p>
                <img
                  :src="logoPreview"
                  alt="Preview Logo Baru"
                  class="img-thumbnail"
                  style="
                    max-height: 120px;
                    max-width: 120px;
                    object-fit: contain;
                  "
                />
                <div class="mt-1">
                  <b-button
                    variant="outline-secondary"
                    size="sm"
                    @click="clearNewLogo"
                  >
                    <i class="bx bx-x me-1"></i>Batalkan ganti logo
                  </b-button>
                </div>
              </div>
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
  getBankReferenceById,
  updateBankReference,
} from "@/services/bankReferenceService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const bankId = computed(() => Number(route.params.id));
const formReady = ref(false);
const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);

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

const {
  data: bankData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["bank-references", bankId],
  queryFn: () => getBankReferenceById(bankId.value),
  enabled: computed(() => !!bankId.value),
});

watch(
  bankData,
  (data) => {
    if (!data) return;

    formState.name = data.name ?? "";
    formState.code = data.code ?? "";
    formState.type = data.type ?? "bank";
    formState.bank_provider = data.bank_provider ?? "";
    formState.is_active = data.is_active ? "1" : "0";
    existingImageUrl.value = data.image ? `${STORAGE_BASE}${data.image}` : null;

    formReady.value = true;
  },
  { immediate: true },
);

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

const clearNewLogo = () => {
  logoFile.value = null;
  logoPreview.value = null;
};

const { mutate: submitUpdate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", formState.name.trim());
    formData.append("code", formState.code.trim().toUpperCase());
    formData.append("type", formState.type);
    formData.append("is_active", formState.is_active);
    if (formState.bank_provider.trim())
      formData.append("bank_provider", formState.bank_provider.trim());
    if (logoFile.value) formData.append("image", logoFile.value);
    return updateBankReference(bankId.value, formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["bank-references"] });
    queryClient.invalidateQueries({ queryKey: ["bank-references", bankId] });
    showToast("Bank reference berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/bank-reference"), 1500);
  },
  onError: (err: any) => {
    const msg =
      err?.response?.data?.message ?? "Gagal memperbarui bank reference";
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

  submitUpdate();
};
</script>
