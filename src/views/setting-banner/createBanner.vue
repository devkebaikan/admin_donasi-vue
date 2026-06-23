<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Banner">
          <b-row class="g-3">
            <!-- Upload Gambar -->
            <b-col cols="12">
              <b-form-group label="Gambar Banner" label-for="image">
                <ImageUpload
                  v-model="formState.image"
                  :max-size-mb="5"
                  accept="image/*"
                  placeholder="Upload Banner"
                />
                <div v-if="v$.image.$error" class="invalid-feedback d-block">
                  Gambar banner wajib diupload.
                </div>
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
              <span class="text-muted">Menyimpan banner...</span>
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
                  Simpan Banner
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
import { reactive } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import { createBanner } from "@/services/bannerService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  image: null as File | null,
  link: "",
  is_new_tab: false,
});

const rules = {
  image: { required },
};

const v$ = useVuelidate(rules, formState);

const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    if (formState.image) formData.append("image", formState.image);
    if (formState.link.trim()) formData.append("link", formState.link.trim());
    formData.append("is_new_tab", formState.is_new_tab ? "1" : "0");
    return createBanner(formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["setting-banners"] });
    showToast("Banner berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/banners"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan banner";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Upload gambar banner terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  submitCreate();
};
</script>
