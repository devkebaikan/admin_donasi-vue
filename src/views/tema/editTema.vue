<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="tema-form-edit"
          :title="`Edit Tema${temaData ? ': ' + temaData.judul : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingTema" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data tema...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data tema.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchTema">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Judul -->
            <b-col md="6">
              <b-form-group label="Judul Tema *" label-for="judul">
                <b-form-input
                  id="judul"
                  v-model="formState.judul"
                  type="text"
                  placeholder="e.g., Ramadhan Bahagia"
                  maxlength="255"
                  :state="v$.judul.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.judul.$error">
                  Judul wajib diisi
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Slug -->
            <b-col md="6">
              <b-form-group label="Slug *" label-for="slug">
                <b-form-input
                  id="slug"
                  v-model="formState.slug"
                  type="text"
                  placeholder="e.g., ramadhan"
                  maxlength="255"
                  :state="v$.slug.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.slug.$error">
                  Slug wajib diisi
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Deskripsi -->
            <b-col md="12">
              <b-form-group label="Deskripsi" label-for="description">
                <b-form-textarea
                  id="description"
                  v-model="formState.description"
                  placeholder="Deskripsi tema (opsional)"
                  rows="3"
                  maxlength="1000"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Gambar -->
            <b-col md="12">
              <b-form-group label="Gambar Tema" label-for="image">
                <b-form-file
                  id="image"
                  @change="handleImageChange"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  placeholder="Pilih file gambar untuk mengubah..."
                />
                <small class="text-muted">
                  JPG/PNG/WebP/GIF, maksimal 2MB (opsional)
                </small>
              </b-form-group>

              <!-- Gambar existing -->
              <div v-if="existingImageUrl && !imagePreview" class="mt-2">
                <label class="fw-semibold text-info mb-2"
                  >Gambar Saat Ini:</label
                >
                <div class="d-flex align-items-end gap-2">
                  <img
                    :src="existingImageUrl"
                    alt="current"
                    class="img-thumbnail"
                    style="max-width: 200px; height: auto"
                  />
                  <b-button
                    size="sm"
                    variant="danger"
                    @click="removeExistingImage"
                  >
                    <i class="bx bx-trash me-1"></i>Hapus
                  </b-button>
                </div>
              </div>

              <!-- Preview gambar baru -->
              <div v-if="imagePreview" class="mt-2">
                <label class="fw-semibold text-success mb-2">
                  Gambar Baru:
                </label>
                <div class="d-flex align-items-end gap-2">
                  <img
                    :src="imagePreview"
                    alt="preview"
                    class="img-thumbnail"
                    style="max-width: 200px; height: auto"
                  />
                  <b-button size="sm" variant="danger" @click="clearNewImage">
                    <i class="bx bx-trash me-1"></i>Batal
                  </b-button>
                </div>
              </div>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan tema...</span>
            </b-col>

            <!-- Tombol Submit -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="secondary"
                  @click="router.back()"
                  :disabled="isPending"
                >
                  <i class="bx bx-arrow-back me-1"></i>Kembali
                </b-button>
                <b-button
                  variant="primary"
                  @click="handleSubmit"
                  :disabled="isPending"
                >
                  <i class="bx bx-save me-1"></i>Simpan Perubahan
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
import { getTemaById, updateTema } from "@/services/temaService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const temaId = computed(() => Number(route.params.id));

// ── Image state ────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);
const imageRemoved = ref(false);

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  judul: "",
  slug: "",
  description: "",
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  judul: { required },
  slug: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Fetch tema by ID ───────────────────────────────────────────────────────
const {
  data: temaData,
  isLoading: isFetchingTema,
  isError: fetchError,
  refetch: refetchTema,
} = useQuery({
  queryKey: ["tema", temaId],
  queryFn: () => getTemaById(temaId.value),
  enabled: computed(() => !!temaId.value),
});

// ── Pre-fill form saat data tersedia ───────────────────────────────────────
watch(
  temaData,
  (data) => {
    if (!data) return;

    formState.judul = data.judul ?? "";
    formState.slug = data.slug ?? "";
    formState.description = data.description ?? "";

    existingImageUrl.value = data.image
      ? `${import.meta.env.VITE_API_BASE_URL}/storage/${data.image}`
      : null;

    formReady.value = true;
  },
  { immediate: true },
);

// ── Image handler ──────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;

  if (file) {
    // Validasi ukuran file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran gambar tidak boleh lebih dari 2MB", {
        type: "error",
        position: "top-center",
      });
      imageFile.value = null;
      return;
    }

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

const removeExistingImage = () => {
  existingImageUrl.value = null;
  imageRemoved.value = true;
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateTemaPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => updateTema(temaId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tema"] });
    queryClient.invalidateQueries({ queryKey: ["tema", temaId] });
    showToast("Tema berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/tema"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui tema";
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
  formData.append("judul", formState.judul.trim());
  formData.append("slug", formState.slug.trim());

  if (formState.description?.trim()) {
    formData.append("description", formState.description.trim());
  }

  if (imageRemoved.value) {
    formData.append("image_removed", "true");
  }

  if (imageFile.value) {
    formData.append("image", imageFile.value);
  }

  updateTemaPayload(formData);
};
</script>
