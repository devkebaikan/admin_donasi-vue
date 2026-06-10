<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="image-form-create"
          title="Tambah Page Setting Image"
        >
          <b-row class="g-3">
            <!-- Upload Gambar -->
            <b-col cols="12">
              <b-form-group label="Gambar" label-for="image">
                <!-- <div
                  class="border rounded p-3 text-center cursor-pointer position-relative"
                  :class="v$.image.$error ? 'border-danger' : 'border-dashed'"
                  style="min-height: 160px; background: #f8f9fa"
                  @click="triggerFileInput"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="d-none"
                    @change="handleImageChange"
                  />
                  <div
                    v-if="imagePreview"
                    class="position-relative d-inline-block"
                  >
                    <img
                      :src="imagePreview"
                      alt="preview"
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
                      @click.stop="clearImage"
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
                </div> -->
                <ImageUpload
                  v-model="formState.image"
                  :max-size-mb="5"
                  accept="image/*"
                  placeholder="Upload Banner"
                />
                <div v-if="v$.image.$error" class="invalid-feedback d-block">
                  Gambar wajib diupload.
                </div>
              </b-form-group>
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
              <span class="text-muted">Menyimpan gambar...</span>
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
                  Simpan Gambar
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
import { createImage } from "@/services/imageService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ImageUpload from "@/components/ImageUpload.vue";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const formState = reactive({
  name: "",
  link: "",
  image: null as File | null,
});

const rules = {
  image: { required },
};

const v$ = useVuelidate(rules, formState);

const triggerFileInput = () => fileInput.value?.click();

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  formState.image = file;
  v$.value.image.$touch();

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  formState.image = null;
  imagePreview.value = null;
  if (fileInput.value) fileInput.value.value = "";
  v$.value.image.$reset();
};

const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    if (formState.image) formData.append("image", formState.image);
    if (formState.name.trim()) formData.append("name", formState.name.trim());
    if (formState.link.trim()) formData.append("link", formState.link.trim());
    return createImage(formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["setting-images"] });
    showToast("Gambar berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/image"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan gambar";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Upload gambar terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  submitCreate();
};
</script>
