<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="image-form-edit"
          :title="`Edit Gambar${imageData ? ': ' + (imageData.name || '#' + imageData.id) : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data gambar...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data gambar.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Gambar saat ini / Upload baru -->
            <b-col cols="12">
              <b-form-group label="Gambar" label-for="image">
                <!-- Tampilkan gambar saat ini jika tidak ada file baru -->
                <div v-if="existingImageUrl && !newImagePreview" class="mb-2">
                  <p class="text-muted small mb-1">Gambar saat ini:</p>
                  <div class="position-relative d-inline-block">
                    <img
                      :src="existingImageUrl"
                      alt="current"
                      style="
                        max-height: 160px;
                        max-width: 100%;
                        border-radius: 4px;
                        border: 1px solid #dee2e6;
                      "
                    />
                  </div>
                  <div class="mt-2">
                    <b-button
                      variant="outline-primary"
                      size="sm"
                      @click="triggerFileInput"
                    >
                      <i class="bx bx-upload me-1"></i>Ganti Gambar
                    </b-button>
                  </div>
                </div>

                <!-- Area upload gambar baru -->
                <div
                  v-if="!existingImageUrl || newImagePreview"
                  class="border rounded p-3 text-center cursor-pointer position-relative"
                  style="min-height: 160px; background: #f8f9fa"
                  @click="!newImagePreview && triggerFileInput()"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="d-none"
                    @change="handleImageChange"
                  />
                  <div
                    v-if="newImagePreview"
                    class="position-relative d-inline-block"
                  >
                    <img
                      :src="newImagePreview"
                      alt="new preview"
                      style="
                        max-height: 140px;
                        max-width: 100%;
                        border-radius: 4px;
                      "
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0"
                      style="transform: translate(50%, -50%)"
                      @click.stop="clearNewImage"
                    >
                      <i class="bx bx-x"></i>
                    </button>
                  </div>
                  <div v-else class="py-3">
                    <i
                      class="bx bx-cloud-upload fs-1 text-muted d-block mb-2"
                    ></i>
                    <p class="text-muted mb-1">Klik untuk upload gambar</p>
                    <small class="text-muted"
                      >JPEG, PNG, WEBP, GIF — maks. 2MB</small
                    >
                  </div>
                </div>

                <!-- Input file hidden jika ada gambar existing (untuk ganti) -->
                <input
                  v-if="existingImageUrl && !newImagePreview"
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="d-none"
                  @change="handleImageChange"
                />
              </b-form-group>

              <!-- <ImageUpload
                v-model="newImageFile"
                :existing-image="existingImageUrl"
              /> -->
            </b-col>

            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama / Label (opsional)" label-for="name">
                <b-form-input
                  id="name"
                  v-model="formState.name"
                  type="text"
                  placeholder="e.g., Home Banner 1"
                  maxlength="255"
                />
              </b-form-group>
            </b-col>

            <!-- Link -->
            <b-col md="6">
              <b-form-group label="Link (opsional)" label-for="link">
                <b-form-input
                  id="link"
                  v-model="formState.link"
                  type="text"
                  placeholder="e.g., bahagiakanyatim"
                  maxlength="255"
                />
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
                  @click="router.push('/image')"
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
import { useRouter, useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getImageById, updateImage } from "@/services/imageService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ImageUpload from "@/components/ImageUpload.vue";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const imageId = computed(() => Number(route.params.id));

const formReady = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const newImageFile = ref<File | null>(null);
const newImagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);

const formState = reactive({
  name: "",
  link: "",
});

const {
  data: imageData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["setting-images", imageId],
  queryFn: () => getImageById(imageId.value),
  enabled: computed(() => !!imageId.value),
});

watch(
  imageData,
  (data) => {
    if (!data) return;

    formState.name = data.name ?? "";
    formState.link = data.link && data.link !== "No Link" ? data.link : "";
    existingImageUrl.value = data.image ? `${STORAGE_BASE}${data.image}` : null;

    formReady.value = true;
  },
  { immediate: true },
);

const triggerFileInput = () => fileInput.value?.click();

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  newImageFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    newImagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearNewImage = () => {
  newImageFile.value = null;
  newImagePreview.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const { mutate: submitUpdate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (newImageFile.value) formData.append("image", newImageFile.value);
    if (formState.name.trim()) formData.append("name", formState.name.trim());
    if (formState.link.trim()) formData.append("link", formState.link.trim());
    return updateImage(imageId.value, formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["setting-images"] });
    queryClient.invalidateQueries({ queryKey: ["setting-images", imageId] });
    showToast("Gambar berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/image"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui gambar";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  submitUpdate();
};
</script>
