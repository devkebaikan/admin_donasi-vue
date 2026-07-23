<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          :title="`Edit Kategori Blog${categoryData ? ': ' + categoryData.nama : ''}`"
        >
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data...</span>
          </div>

          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data kategori blog.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <b-row v-else class="g-3">
            <b-col md="6">
              <b-form-group label="Nama" label-for="nama">
                <b-form-input
                  id="nama"
                  v-model="v$.nama.$model"
                  :state="v$.nama.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.nama.$error">
                  {{ v$.nama.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan perubahan...</span>
            </b-col>

            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/blog-category')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />Simpan
                  Perubahan
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
import { reactive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import {
  getBlogCategoryById,
  updateBlogCategory,
} from "@/services/blogCategoryService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const id = Number(route.params.id);
const formState = reactive({ nama: "" });

const rules = {
  nama: { required: helpers.withMessage("Nama wajib diisi", required) },
};

const v$ = useVuelidate(rules, formState);

const {
  data: categoryData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["blog-categories", id],
  queryFn: () => getBlogCategoryById(id),
  enabled: computed(() => !!id),
});

watch(
  categoryData,
  (val) => {
    if (!val) return;
    formState.nama = val.nama ?? "";
  },
  { immediate: true },
);

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    updateBlogCategory(id, { nama: formState.nama.trim() }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    showToast("Kategori blog berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/blog-category"), 1500);
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal menyimpan perubahan", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  if (!(await v$.value.$validate())) {
    showToast("Lengkapi field wajib", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
