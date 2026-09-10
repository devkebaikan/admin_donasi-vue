<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="tema-form-create" title="Tambah Tema Baru">
          <b-row class="g-3">
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
                  Slug wajib diisi (gunakan huruf kecil dan strip)
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
              <b-form-group label="Gambar Tema *" label-for="image">
                <b-form-file
                  id="image"
                  @change="handleImageChange"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  placeholder="Pilih file gambar..."
                  :state="v$.image.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.image.$error">
                  Gambar wajib dipilih (JPG/PNG/WebP/GIF, maks 2MB)
                </b-form-invalid-feedback>
                <small class="text-muted">
                  JPG/PNG/WebP/GIF, maksimal 2MB
                </small>
              </b-form-group>

              <div v-if="imagePreview" class="mt-2">
                <img
                  :src="imagePreview"
                  alt="preview"
                  class="img-thumbnail"
                  style="max-width: 200px; height: auto"
                />
                <b-button
                  size="sm"
                  variant="danger"
                  class="ms-2"
                  @click="clearImage"
                >
                  <i class="bx bx-trash me-1"></i>Hapus
                </b-button>
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
                  <i class="bx bx-save me-1"></i>Simpan Tema
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
import { createTema } from "@/services/temaService";
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
  judul: "",
  slug: "",
  description: "",
  image: null as File | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = {
  judul: { required },
  slug: { required },
  image: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Image handler ──────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  formState.image = file;

  if (file) {
    // Validasi ukuran file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran gambar tidak boleh lebih dari 2MB", {
        type: "error",
        position: "top-center",
      });
      imageFile.value = null;
      formState.image = null;
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

const clearImage = () => {
  imageFile.value = null;
  formState.image = null;
  imagePreview.value = null;
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: createTemaPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => createTema(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tema"] });
    showToast("Tema berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/tema"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan tema";
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

  formData.append("judul", formState.judul.trim());
  formData.append("slug", formState.slug.trim());

  if (formState.description?.trim()) {
    formData.append("description", formState.description.trim());
  }

  if (imageFile.value) {
    formData.append("image", imageFile.value);
  }

  createTemaPayload(formData);
};
</script>
