<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="mitra-form-edit"
          :title="`Edit Mitra${mitraData ? ': ' + mitraData.nama : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingMitra" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data mitra...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data mitra.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchMitra">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Mitra" label-for="nama">
                <b-form-input
                  id="nama"
                  v-model="v$.nama.$model"
                  type="text"
                  placeholder="e.g., Ponpes Taruna Ummah"
                  :state="v$.nama.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.nama.$error">
                  Nama mitra wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Status -->
            <b-col md="6">
              <b-form-group label="Status" label-for="status">
                <b-form-select
                  id="status"
                  v-model="v$.status.$model"
                  :state="v$.status.$error ? false : null"
                >
                  <option value="" disabled>Pilih status...</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.status.$error">
                  Status wajib dipilih.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Email -->
            <b-col md="6">
              <b-form-group label="Email" label-for="email">
                <b-form-input
                  id="email"
                  v-model="formState.email"
                  type="email"
                  placeholder="e.g., mitra@example.com"
                  maxlength="255"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Kontak -->
            <b-col md="6">
              <b-form-group label="Kontak" label-for="kontak">
                <b-form-input
                  id="kontak"
                  v-model="formState.kontak"
                  type="text"
                  placeholder="e.g., 08123456789"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Alamat -->
            <b-col md="12">
              <b-form-group label="Alamat" label-for="alamat">
                <b-form-textarea
                  id="alamat"
                  v-model="formState.alamat"
                  placeholder="Alamat lengkap mitra..."
                  rows="2"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- PJ -->
            <b-col md="6">
              <b-form-group label="Penanggung Jawab" label-for="pj">
                <b-form-input
                  id="pj"
                  v-model="formState.pj"
                  type="text"
                  placeholder="e.g., Ahmad Fauzi"
                  maxlength="255"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Nomer -->
            <b-col md="6">
              <b-form-group label="Nomor" label-for="nomer">
                <b-form-input
                  id="nomer"
                  v-model="formState.nomer"
                  type="text"
                  placeholder="e.g., 08123456789"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Kode Wilayah -->
            <b-col md="6">
              <b-form-group label="Kode Wilayah" label-for="kode-wilayah">
                <b-form-input
                  id="kode-wilayah"
                  v-model.number="formState.kode_wilayah"
                  type="number"
                  placeholder="e.g., 5985"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Logo -->
            <b-col md="6">
              <b-form-group label="Logo" label-for="logo">
                <!-- Preview logo existing -->
                <div v-if="existingLogoUrl && !logoPreview" class="mb-2">
                  <p class="text-muted small mb-1">Logo saat ini:</p>
                  <img
                    :src="existingLogoUrl"
                    alt="Logo Saat Ini"
                    class="img-thumbnail"
                    style="
                      max-height: 120px;
                      max-width: 120px;
                      object-fit: cover;
                    "
                  />
                </div>

                <b-form-file
                  id="logo"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleLogoChange"
                  :placeholder="
                    existingLogoUrl
                      ? 'Ganti logo (opsional)...'
                      : 'Pilih file logo...'
                  "
                />
                <small class="text-muted">
                  {{
                    existingLogoUrl
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
                  style="max-height: 120px; max-width: 120px; object-fit: cover"
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

            <b-col cols="12"
              ><hr class="mt-3" />
              <h5 class="my-1 fw-semibold text-info">Info Bank</h5></b-col
            >
            <!-- Bank Reference -->
            <b-col md="6">
              <b-form-group label="Bank Referensi" label-for="bank-ref">
                <SearchSelect
                  id="bank-ref"
                  :modelValue="String(formState.bank_refferences_id || 0)"
                  @update:modelValue="
                    (val: any) => {
                      formState.bank_refferences_id =
                        val === '0' || !val ? null : Number(val);
                    }
                  "
                  @search="
                    (query: string) => {
                      bankSearchQuery = query;
                    }
                  "
                  :options="bankRefOptionsWithSelected"
                  :isLoading="isBankLoading"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Account Holder Name -->
            <b-col md="6">
              <b-form-group
                label="Nama Pemilik Rekening"
                label-for="account-behalf"
              >
                <b-form-input
                  id="account-behalf"
                  v-model="formState.account_behalf"
                  type="text"
                  placeholder="e.g., Ahmad Fauzi"
                  maxlength="255"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Account Number -->
            <b-col md="6">
              <b-form-group label="Nomor Rekening" label-for="account-number">
                <b-form-input
                  id="account-number"
                  v-model="formState.account_number"
                  type="text"
                  placeholder="e.g., 1234567890"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
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
                  @click="router.push('/mitra')"
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
import { reactive, ref, computed, watch, onMounted } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import { useSearchSelect } from "@/composables/useSearchSelect";
import { getMitraById, updateMitra } from "@/services/mitraService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const mitraId = computed(() => Number(route.params.id));

// ── Image state ────────────────────────────────────────────────────────────
const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);
const existingLogoUrl = ref<string | null>(null);

// ── Bank Ref SearchSelect ──────────────────────────────────────────────────
const {
  searchQuery: bankSearchQuery,
  options: bankRefOptions,
  isLoading: isBankLoading,
} = useSearchSelect({
  queryKey: "bank-references-search",
  fetchFn: getAllBankReferences,
  optionsMapper: (bank: any) => ({
    value: bank.id,
    text: `${bank.name}${bank.code && bank.code !== "-" ? ` (${bank.code})` : ""}`,
  }),
  placeholder: "Cari bank...",
  limit: 10,
});

const bankRefOptionsWithSelected = computed(() => {
  const options = bankRefOptions.value ?? [];
  if (!formState.bank_refferences_id) return options;

  const selectedId = Number(formState.bank_refferences_id);
  const alreadyExists = options.some(
    (opt: any) => Number(opt.value) === selectedId,
  );
  if (alreadyExists) return options;

  const rawMitra = mitraData.value as any;
  const bankName =
    rawMitra?.bank_reference?.name ??
    rawMitra?.bank_references?.name ??
    rawMitra?.bank_reference_name ??
    `Bank #${selectedId}`;

  return [...options, { value: selectedId, text: bankName }];
});

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  nama: "",
  status: "" as string,
  email: "",
  alamat: "",
  kontak: "",
  kode_wilayah: null as number | null,
  pj: "",
  nomer: "",
  account_behalf: "",
  account_number: "",
  bank_refferences_id: null as number | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  nama: { required },
  status: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch mitra by ID ──────────────────────────────────────────────────────
const {
  data: mitraData,
  isLoading: isFetchingMitra,
  isError: fetchError,
  refetch: refetchMitra,
} = useQuery({
  queryKey: ["mitra", mitraId],
  queryFn: () => getMitraById(mitraId.value),
  enabled: computed(() => !!mitraId.value),
});

// ── Pre-fill form saat data tersedia ──────────────────────────────────────
watch(
  mitraData,
  (data) => {
    if (!data) return;

    formState.nama = data.nama ?? "";
    formState.status = data.status ?? "";
    formState.email = data.email ?? "";
    formState.alamat = data.alamat ?? "";
    formState.kontak = data.kontak ?? "";
    formState.kode_wilayah = data.kode_wilayah ?? null;
    formState.pj = data.pj ?? "";
    formState.nomer = data.nomer ?? "";
    formState.account_behalf = data.account_behalf ?? "";
    formState.account_number = data.account_number ?? "";
    formState.bank_refferences_id = data.bank_refferences_id ?? null;

    existingLogoUrl.value = data.logo_url ?? null;

    formReady.value = true;
  },
  { immediate: true },
);

// ── Logo handler ───────────────────────────────────────────────────────────
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

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateMitraPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => updateMitra(mitraId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["mitra"] });
    queryClient.invalidateQueries({ queryKey: ["mitra", mitraId] });
    showToast("Mitra berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/mitra"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui mitra";
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

  const formData = new FormData();

  formData.append("_method", "PUT");
  formData.append("nama", formState.nama.trim());
  formData.append("status", formState.status);

  if (formState.email?.trim()) formData.append("email", formState.email.trim());
  if (formState.alamat?.trim())
    formData.append("alamat", formState.alamat.trim());
  if (formState.kontak?.trim())
    formData.append("kontak", formState.kontak.trim());
  if (formState.pj?.trim()) formData.append("pj", formState.pj.trim());
  if (formState.nomer?.trim()) formData.append("nomer", formState.nomer.trim());
  if (formState.kode_wilayah)
    formData.append("kode_wilayah", String(formState.kode_wilayah));
  if (formState.account_behalf?.trim())
    formData.append("account_behalf", formState.account_behalf.trim());
  if (formState.account_number?.trim())
    formData.append("account_number", formState.account_number.trim());
  if (formState.bank_refferences_id)
    formData.append("bank_refferences_id", String(formState.bank_refferences_id));

  // Logo hanya dikirim jika user memilih file baru
  if (logoFile.value) formData.append("logo", logoFile.value);

  updateMitraPayload(formData);
};
</script>
