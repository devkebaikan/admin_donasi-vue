<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="category-form-create" title="Tambah Kategori Baru">
          <b-row class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Kategori" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., Masjid & Pondok"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  Nama kategori wajib diisi.
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
                  placeholder="e.g., masjid-pondok"
                  :state="v$.slug.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.slug.$error">
                  Slug wajib diisi.
                </b-form-invalid-feedback>
                <small class="text-muted">Slug unik untuk URL kategori</small>
              </b-form-group>
            </b-col>

            <!-- Is Utama -->
            <b-col md="3">
              <b-form-group label="Kategori Utama" label-for="is-utama">
                <b-form-select id="is-utama" v-model="formState.is_utama">
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </b-form-select>
              </b-form-group>
            </b-col>

            <!-- Is Active -->
            <b-col md="3">
              <b-form-group label="Status Aktif" label-for="is-active">
                <b-form-select id="is-active" v-model="formState.is_active">
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </b-form-select>
              </b-form-group>
            </b-col>

            <!-- Akun Penerimaan -->
            <b-col md="3">
              <b-form-group
                label="ID Akun Penerimaan"
                label-for="akun-penerimaan"
              >
                <b-form-input
                  id="akun-penerimaan"
                  v-model.number="formState.akun_penerimaan_id"
                  type="number"
                  placeholder="ID akun..."
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Akun Pengeluaran -->
            <b-col md="3">
              <b-form-group
                label="ID Akun Pengeluaran"
                label-for="akun-pengeluaran"
              >
                <b-form-input
                  id="akun-pengeluaran"
                  v-model.number="formState.akun_pengeluaran_id"
                  type="number"
                  placeholder="ID akun..."
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Gambar -->
            <b-col md="6">
              <b-form-group label="Gambar Kategori" label-for="image">
                <b-form-file
                  id="image"
                  accept="image/jpeg,image/png,image/webp"
                  :state="v$.image.$error ? false : null"
                  @change="handleImageChange"
                  placeholder="Pilih file gambar..."
                />
                <b-form-invalid-feedback v-if="v$.image.$error">
                  Gambar kategori wajib dipilih.
                </b-form-invalid-feedback>
                <small class="text-muted">JPG/PNG/WebP, maks 2MB</small>
              </b-form-group>

              <div v-if="imagePreview" class="mt-2">
                <img
                  :src="imagePreview"
                  alt="Preview Gambar"
                  class="img-thumbnail"
                  style="max-height: 140px; max-width: 140px; object-fit: cover"
                />
              </div>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan kategori...</span>
            </b-col>

            <!-- Tombol Submit -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  @click="router.push('/category')"
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
                  Simpan Kategori
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
import { createCategory } from "@/services/categoryService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

// ── Image state ────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// ── Form state ─────────────────────────────────────────────────────────────
const formState = reactive({
  name: "",
  slug: "",
  is_utama: "1",
  is_active: "1",
  akun_penerimaan_id: null as number | null,
  akun_pengeluaran_id: null as number | null,
  image: null as File | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  name: { required },
  slug: { required },
  image: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Image handler ──────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  formState.image = file;
  v$.value.image.$touch();
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: createCategoryPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => createCategory(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-categories"] });
    showToast("Kategori berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/category"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan kategori";
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

  formData.append("name", formState.name.trim());
  formData.append("slug", formState.slug.trim());
  formData.append("is_utama", formState.is_utama);
  formData.append("is_active", formState.is_active);
  formData.append("image", imageFile.value as File);

  if (formState.akun_penerimaan_id)
    formData.append("akun_penerimaan_id", String(formState.akun_penerimaan_id));
  if (formState.akun_pengeluaran_id)
    formData.append(
      "akun_pengeluaran_id",
      String(formState.akun_pengeluaran_id),
    );

  createCategoryPayload(formData);
};
</script>
