<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="blog-form-create" title="Tambah Blog Baru">
          <b-row class="g-3">
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
                <ChoicesSelect
                  id="category"
                  :modelValue="v$.category_id.$model !== null ? String(v$.category_id.$model) : undefined"
                  @update:modelValue="(val: string | undefined) => (v$.category_id.$model = val !== undefined ? Number(val) : null)"
                  :options="categoryOptions"
                  :isLoading="categoryLoading"
                  :key="categoryOptions.length"
                />
                <div v-if="v$.category_id.$error" class="invalid-feedback d-block">
                  Kategori wajib dipilih.
                </div>
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
                <b-form-file
                  id="image"
                  accept="image/jpeg,image/png,image/webp"
                  :state="v$.image.$error ? false : null"
                  @change="handleImageChange"
                  placeholder="Pilih file gambar..."
                />
                <b-form-invalid-feedback v-if="v$.image.$error">
                  Gambar blog wajib dipilih.
                </b-form-invalid-feedback>
                <small class="text-muted">JPG/PNG/WebP, maks 2MB</small>
              </b-form-group>

              <div v-if="imagePreview" class="mt-2">
                <img
                  :src="imagePreview"
                  alt="Preview Gambar"
                  class="img-thumbnail"
                  style="max-height: 160px; max-width: 160px; object-fit: cover"
                />
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
              <span class="text-muted">Menyimpan blog...</span>
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
                  Simpan Blog
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
import { reactive, ref, onMounted, computed } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, maxLength } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createBlog, getBlogCategories } from "@/services/blogService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ChoicesSelect from "@/components/ChoicesSelect.vue";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

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
  image: null as File | null,
  tagIdsRaw: "",
});

const rules = {
  title: { required, minLength: minLength(3), maxLength: maxLength(100) },
  description: { required },
  content: { required },
  category_id: { required },
  image: { required },
};

const v$ = useVuelidate(rules, formState);

const { data: categories, isLoading: categoryLoading } = useQuery({
  queryKey: ["blog-categories"],
  queryFn: getBlogCategories,
});

const categoryOptions = computed(() => {
  if (!categories.value) return [];

  return [
    { value: null, text: "Pilih kategori..." },
    ...categories.value.map((item: any) => ({
      value: item.value,
      text: item.label,
    })),
  ];
});

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

const { mutate: submitBlog, isPending } = useMutation({
  mutationFn: (payload: FormData) => createBlog(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["blogs"] });
    showToast("Blog berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/blog"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan blog";
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
  formData.append("title", formState.title.trim());
  formData.append("description", formState.description.trim());
  formData.append("content", formState.content);
  formData.append("category_id", String(formState.category_id));
  formData.append("is_active", formState.is_active);
  formData.append("image_url", imageFile.value as File);

  const tagIds = formState.tagIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && !isNaN(Number(s)));
  tagIds.forEach((id) => formData.append("tag_ids[]", id));

  submitBlog(formData);
};
</script>
