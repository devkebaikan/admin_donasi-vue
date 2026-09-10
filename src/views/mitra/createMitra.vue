<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="mitra-form-create" title="Tambah Mitra Baru">
          <b-row class="g-3">
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
                  style="max-height: 120px; max-width: 120px; object-fit: cover"
                />
              </div>
            </b-col>

            <b-col cols="12"
              ><hr class="mt-3" />
              <h5 class="my-1 fw-semibold text-info">Info Bank</h5></b-col
            >
            <!-- Bank Reference -->
            <b-col md="6">
              <b-form-group label="Bank Referensi" label-for="bank-ref">
                <ChoicesSelect
                  id="form-bank-id"
                  :modelValue="String(formState.bank_references_id || 0)"
                  @update:modelValue="
                    (val: any) => {
                      formState.bank_references_id =
                        val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="bankRefOptions"
                  :isLoading="isBankLoading"
                  :key="bankRefOptions.length"
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
              <span class="text-muted">Menyimpan mitra...</span>
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
                  Simpan Mitra
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
import { reactive, ref, onMounted, computed } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createMitra } from "@/services/mitraService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

// ── Image state ────────────────────────────────────────────────────────────
const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);

// bank ref option
const { data: bankData, isLoading: isBankLoading } = useQuery({
  queryKey: ["bank-references-list"],
  queryFn: () => getAllBankReferences({ mode: "list" }),
});

const bankRefOptions = computed(() => {
  const raw = bankData.value;
  const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
  return [
    { value: 0, text: "-- Pilih Bank --" },
    ...list.map((b: any) => ({
      value: b.id,
      text: `${b.name}`,
    })),
  ];
});

// ── Form state ─────────────────────────────────────────────────────────────
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
  bank_references_id: null as number | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  nama: { required },
  status: { required },
};

const v$ = useVuelidate(rules, formState);

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

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: createMitraPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => createMitra(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["mitra"] });
    showToast("Mitra berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/mitra"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan mitra";
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
  if (formState.bank_references_id)
    formData.append("bank_references_id", String(formState.bank_references_id));
  if (logoFile.value) formData.append("logo", logoFile.value);

  createMitraPayload(formData);
};
</script>
