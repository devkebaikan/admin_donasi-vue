<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="blog-form-edit"
          :title="`Edit Blog${blogData ? ': ' + blogData.title : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingBlog" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data blog...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data blog.</p>
            <b-button
              variant="outline-primary"
              size="sm"
              @click="refetchBlog"
            >
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
            <!-- Judul -->
            <b-col md="8">
              <b-form-group label="Judul Blog" label-for="title">
                <b-form-input
                  id="title"
                  v-model="v$.title.$model"
                  type="text"
                  placeholder="e.g., Tips Bersedekah di Bulan Ramadhan"
                  :state="v$.title.$error ? false : null"
                  maxlength="100"
                />
                <b-form-invalid-feedback v-if="v$.title.$error">
                  Judul wajib diisi (3–100 karakter).
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Kategori -->
            <b-col md="4">
              <b-form-group label="Kategori" label-for="category">
                <b-form-select
                  id="category"
                  v-model="v$.category_id.$model"
                  :state="v$.category_id.$error ? false : null"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      Pilih kategori...
                    </b-form-select-option>
                  </template>
                  <b-form-select-option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </b-form-select-option>
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.category_id.$error">
                  Kategori wajib dipilih.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Deskripsi -->
            <b-col cols="12">
              <b-form-group label="Deskripsi Singkat" label-for="description">
                <b-form-textarea
                  id="description"
                  v-model="v$.description.$model"
                  rows="3"
                  placeholder="Ringkasan singkat blog..."
                  :state="v$.description.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.description.$error">
                  Deskripsi wajib diisi.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Konten -->
            <b-col cols="12">
              <b-form-group label="Konten Blog" label-for="content">
                <div
                  :class="[
                    'quill-wrapper',
                    v$.content.$error ? 'is-invalid' : '',
                  ]"
                >
                  <QuillEditor
                    theme="snow"
                    :toolbar="toolbarOptions"
                    style="height: 300px"
                    placeholder="Tulis konten blog di sini..."
                    v-model:content="formState.content"
                    content-type="html"
                    @update:content="v$.content.$touch()"
                  />
                </div>
                <div v-if="v$.content.$error" class="invalid-feedback d-block">
                  Konten wajib diisi.
                </div>
              </b-form-group>
            </b-col>

            <!-- Gambar -->
            <b-col md="6">
              <b-form-group label="Gambar Blog" label-for="image">
                <!-- Preview gambar existing -->
                <div v-if="existingImageUrl && !imagePreview" class="mb-2">
                  <p class="text-muted small mb-1">Gambar saat ini:</p>
                  <img
                    :src="existingImageUrl"
                    alt="Gambar Saat Ini"
                    class="img-thumbnail"
                    style="max-height: 160px; max-width: 160px; object-fit: cover"
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
                  style="max-height: 160px; max-width: 160px; object-fit: cover"
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

            <!-- Status Aktif -->
            <b-col md="3">
              <b-form-group label="Status Aktif" label-for="is-active">
                <b-form-select id="is-active" v-model="formState.is_active">
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </b-form-select>
              </b-form-group>
            </b-col>

            <!-- Tag IDs -->
            <b-col md="3">
              <b-form-group label="Tag IDs" label-for="tag-ids">
                <b-form-input
                  id="tag-ids"
                  v-model="formState.tagIdsRaw"
                  type="text"
                  placeholder="e.g., 1,2,3"
                />
                <small class="text-muted">Opsional, pisahkan dengan koma</small>
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
                  @click="router.push('/blog')"
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
import { reactive, ref, computed, watch, onMounted } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, maxLength } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getBlogById, updateBlog, getBlogCategories } from "@/services/blogService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const blogId = computed(() => Number(route.params.id));

const categories = ref<{ id: number; name: string }[]>([]);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);
const formReady = ref(false);

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

const formState = reactive({
  title: "",
  description: "",
  content: "",
  category_id: null as number | null,
  is_active: "1",
  tagIdsRaw: "",
});

const rules = {
  title: { required, minLength: minLength(3), maxLength: maxLength(100) },
  description: { required },
  content: { required },
  category_id: { required },
};

const v$ = useVuelidate(rules, formState);

onMounted(async () => {
  categories.value = await getBlogCategories();
});

const {
  data: blogData,
  isLoading: isFetchingBlog,
  isError: fetchError,
  refetch: refetchBlog,
} = useQuery({
  queryKey: ["blog", blogId],
  queryFn: () => getBlogById(blogId.value),
  enabled: computed(() => !!blogId.value),
});

watch(
  blogData,
  (data) => {
    if (!data) return;

    formState.title = data.title ?? "";
    formState.description = data.description ?? "";
    formState.content = data.content ?? "";
    formState.category_id = data.category?.id ?? null;
    formState.is_active = data.is_active ? "1" : "0";
    formState.tagIdsRaw = (data.tag_ids ?? []).join(", ");

    existingImageUrl.value = data.image_url ?? null;
    formReady.value = true;
  },
  { immediate: true },
);

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

const { mutate: submitBlog, isPending } = useMutation({
  mutationFn: (payload: FormData) => updateBlog(blogId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["blogs"] });
    queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
    showToast("Blog berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/blog"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui blog";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

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
  formData.append("title", formState.title.trim());
  formData.append("description", formState.description.trim());
  formData.append("content", formState.content);
  formData.append("category_id", String(formState.category_id));
  formData.append("is_active", formState.is_active);

  if (imageFile.value) {
    formData.append("image_url", imageFile.value);
  }

  const tagIds = formState.tagIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && !isNaN(Number(s)));
  tagIds.forEach((id) => formData.append("tag_ids[]", id));

  submitBlog(formData);
};
</script>
