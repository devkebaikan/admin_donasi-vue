<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          :title="`Edit Banner${bannerData ? ' #' + bannerData.id : ''}`"
        >
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data banner...</span>
          </div>

          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data banner.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <b-row v-else-if="formReady" class="g-3">
            <!-- Gambar -->
            <b-col cols="12">
              <b-form-group label="Gambar Banner" label-for="image">
                <!-- Tampilkan gambar saat ini jika belum ganti -->
                <div v-if="existingImageUrl && !newImagePreview" class="mb-2">
                  <p class="text-muted small mb-1">Gambar saat ini:</p>
                  <div class="position-relative d-inline-block">
                    <img
                      :src="existingImageUrl"
                      alt="current banner"
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
                      >JPEG, PNG, WEBP, GIF — maks. 5MB</small
                    >
                  </div>
                </div>

                <!-- Hidden input saat ada gambar existing (untuk ganti) -->
                <input
                  v-if="existingImageUrl && !newImagePreview"
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="d-none"
                  @change="handleImageChange"
                />
              </b-form-group>
            </b-col>

            <!-- Link -->
            <b-col cols="12" md="8">
              <b-form-group label="Link" label-for="link">
                <b-form-input
                  id="link"
                  v-model="formState.link"
                  type="text"
                  placeholder="Contoh: bangunsumberairbersih"
                  maxlength="500"
                />
                <div class="form-text text-muted">
                  Slug program atau URL lengkap
                </div>
              </b-form-group>
            </b-col>

            <!-- Is New Tab -->
            <b-col cols="12" md="4">
              <b-form-group label="Buka di Tab Baru" label-for="is_new_tab">
                <div class="d-flex align-items-center mt-2">
                  <b-form-checkbox
                    id="is_new_tab"
                    v-model="formState.is_new_tab"
                    switch
                    size="lg"
                  >
                    {{ formState.is_new_tab ? "Ya" : "Tidak" }}
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan perubahan...</span>
            </b-col>

            <!-- Actions -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/banners')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
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
import { useRoute } from "vue-router";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getBannerById, updateBanner } from "@/services/bannerService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const queryClient = useQueryClient();

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const bannerId = computed(() => Number(route.params.id));

const formReady = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const newImageFile = ref<File | null>(null);
const newImagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);

const formState = reactive({
  link: "",
  is_new_tab: false,
});

const {
  data: bannerData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["setting-banners", bannerId],
  queryFn: () => getBannerById(bannerId.value),
  enabled: computed(() => !!bannerId.value),
});

watch(
  bannerData,
  (data) => {
    if (!data) return;
    formState.link = data.link ?? "";
    formState.is_new_tab = data.is_new_tab ?? false;
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
    if (formState.link.trim()) formData.append("link", formState.link.trim());
    formData.append("is_new_tab", formState.is_new_tab ? "1" : "0");
    return updateBanner(bannerId.value, formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["setting-banners"] });
    queryClient.invalidateQueries({
      queryKey: ["setting-banners", bannerId.value],
    });
    showToast("Banner berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/banners"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui banner";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  submitUpdate();
};
</script>
