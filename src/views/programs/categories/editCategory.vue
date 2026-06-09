<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="category-form-edit"
          :title="`Edit Kategori${categoryData ? ': ' + categoryData.name : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingCategory" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data kategori...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data kategori.</p>
            <b-button
              variant="outline-primary"
              size="sm"
              @click="refetchCategory"
            >
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
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
                <!-- Preview gambar existing -->
                <div v-if="existingImageUrl && !imagePreview" class="mb-2">
                  <p class="text-muted small mb-1">Gambar saat ini:</p>
                  <img
                    :src="existingImageUrl"
                    alt="Gambar Saat Ini"
                    class="img-thumbnail"
                    style="max-height: 140px; max-width: 140px; object-fit: cover"
                  />
                </div>

                <b-form-file
                  id="image"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleImageChange"
                  :placeholder="
                    existingImageUrl
                      ? 'Ganti gambar (opsional)...'
                      : 'Pilih file gambar...'
                  "
                />
                <small class="text-muted">
                  {{
                    existingImageUrl
                      ? "Kosongkan jika tidak ingin mengganti gambar."
                      : "JPG/PNG/WebP, maks 2MB"
                  }}
                </small>
              </b-form-group>

              <!-- Preview gambar baru -->
              <div v-if="imagePreview" class="mt-2">
                <p class="text-muted small mb-1">Preview gambar baru:</p>
                <img
                  :src="imagePreview"
                  alt="Preview Gambar Baru"
                  class="img-thumbnail"
                  style="max-height: 140px; max-width: 140px; object-fit: cover"
                />
                <div class="mt-1">
                  <b-button
                    variant="outline-secondary"
                    size="sm"
                    @click="clearNewImage"
                  >
                    <i class="bx bx-x me-1"></i>Batalkan ganti gambar
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
import { getCategoryById, updateCategory } from "@/services/categoryService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const categoryId = computed(() => Number(route.params.id));

// ── Image state ────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  name: "",
  slug: "",
  is_utama: "1",
  is_active: "1",
  akun_penerimaan_id: null as number | null,
  akun_pengeluaran_id: null as number | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  name: { required },
  slug: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch category by ID ───────────────────────────────────────────────────
const {
  data: categoryData,
  isLoading: isFetchingCategory,
  isError: fetchError,
  refetch: refetchCategory,
} = useQuery({
  queryKey: ["program-category", categoryId],
  queryFn: () => getCategoryById(categoryId.value),
  enabled: computed(() => !!categoryId.value),
});

// ── Pre-fill form saat data tersedia ──────────────────────────────────────
watch(
  categoryData,
  (data) => {
    if (!data) return;

    formState.name = data.name ?? "";
    formState.slug = data.slug ?? "";
    formState.is_utama = data.is_utama ?? "1";
    formState.is_active = data.is_active ?? "1";
    formState.akun_penerimaan_id = data.akun_penerimaan_id ?? null;
    formState.akun_pengeluaran_id = data.akun_pengeluaran_id ?? null;

    existingImageUrl.value = data.image_url ?? null;

    formReady.value = true;
  },
  { immediate: true },
);

// ── Image handler ──────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
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

const clearNewImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateCategoryPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => updateCategory(categoryId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-categories"] });
    queryClient.invalidateQueries({ queryKey: ["program-category", categoryId] });
    showToast("Kategori berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/category"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui kategori";
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
  formData.append("name", formState.name.trim());
  formData.append("slug", formState.slug.trim());
  formData.append("is_utama", formState.is_utama);
  formData.append("is_active", formState.is_active);

  if (formState.akun_penerimaan_id)
    formData.append("akun_penerimaan_id", String(formState.akun_penerimaan_id));
  if (formState.akun_pengeluaran_id)
    formData.append(
      "akun_pengeluaran_id",
      String(formState.akun_pengeluaran_id),
    );

  // Gambar hanya dikirim jika user memilih file baru
  if (imageFile.value) formData.append("image", imageFile.value);

  updateCategoryPayload(formData);
};
</script>
