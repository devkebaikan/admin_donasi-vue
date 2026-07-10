<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          :title="`Edit Kegiatan${kegiatanData ? ': ' + kegiatanData.judul : ''}`"
        >
          <!-- Loading -->
          <div v-if="isLoadingKegiatan" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data kegiatan...</span>
          </div>

          <!-- Error -->
          <div v-else-if="isErrorKegiatan" class="alert alert-danger">
            Gagal memuat data. Silakan coba lagi.
          </div>

          <form v-else @submit.prevent="handleSubmit">
            <b-row class="g-3">
              <!-- Judul -->
              <b-col md="8">
                <b-form-group label="Judul" label-for="judul">
                  <b-form-input
                    id="judul"
                    v-model="v$.judul.$model"
                    type="text"
                    placeholder="e.g., Penyaluran Bantuan Tahap #1"
                    :state="v$.judul.$error ? false : null"
                    maxlength="255"
                  />
                  <b-form-invalid-feedback v-if="v$.judul.$error">
                    {{ v$.judul.$errors[0].$message }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <!-- Tipe -->
              <b-col md="4">
                <b-form-group label="Tipe" label-for="type">
                  <b-form-select id="type" v-model="formState.type">
                    <option value="">-- Pilih Tipe --</option>
                    <option value="Progress">Progress</option>
                    <option value="Final">Final</option>
                  </b-form-select>
                </b-form-group>
              </b-col>

              <!-- Tanggal -->
              <b-col md="4">
                <b-form-group label="Tanggal Kegiatan" label-for="date">
                  <b-form-input
                    id="date"
                    v-model="formState.date"
                    type="date"
                  />
                  <small class="text-muted">Opsional</small>
                </b-form-group>
              </b-col>

              <!-- Thumbnail -->
              <b-col cols="12">
                <b-form-group label="Thumbnail" label-for="thumbnail">
                  <!-- Tampilkan gambar lama -->
                  <div
                    v-if="existingThumbnail && !newThumbnailPreview"
                    class="mb-2"
                  >
                    <img
                      :src="existingThumbnail"
                      alt="Thumbnail saat ini"
                      class="rounded"
                      style="max-height: 160px; object-fit: cover"
                    />
                    <div class="mt-1">
                      <b-button
                        size="sm"
                        variant="outline-secondary"
                        @click="fileInput?.click()"
                      >
                        <i class="bx bx-image-alt me-1"></i>Ganti Thumbnail
                      </b-button>
                    </div>
                  </div>

                  <!-- Preview thumbnail baru -->
                  <div v-if="newThumbnailPreview" class="mb-2">
                    <img
                      :src="newThumbnailPreview"
                      alt="Preview thumbnail baru"
                      class="rounded"
                      style="max-height: 160px; object-fit: cover"
                    />
                    <div class="mt-1 d-flex gap-2">
                      <b-button
                        size="sm"
                        variant="outline-secondary"
                        @click="fileInput?.click()"
                      >
                        <i class="bx bx-image-alt me-1"></i>Ganti
                      </b-button>
                      <b-button
                        size="sm"
                        variant="outline-danger"
                        @click="clearNewThumbnail"
                      >
                        <i class="bx bx-x me-1"></i>Batal
                      </b-button>
                    </div>
                  </div>

                  <!-- Input file hidden -->
                  <input
                    id="thumbnail-file"
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    tabindex="-1"
                    aria-label="Upload thumbnail"
                    @change="onFileChange"
                  />

                  <!-- Upload baru jika belum ada gambar sama sekali -->
                  <div v-if="!existingThumbnail && !newThumbnailPreview">
                    <b-button
                      size="sm"
                      variant="outline-primary"
                      @click="fileInput?.click()"
                    >
                      <i class="bx bx-upload me-1"></i>Pilih Thumbnail
                    </b-button>
                    <small class="text-muted ms-2">Opsional</small>
                  </div>
                </b-form-group>
              </b-col>

              <!-- Deskripsi -->
              <b-col cols="12">
                <b-form-group label="Deskripsi" label-for="deskripsi">
                  <QuillEditor
                    theme="snow"
                    style="height: 260px"
                    placeholder="Deskripsi project..."
                    v-model:content="formState.deskripsi"
                    content-type="html"
                  />
                </b-form-group>
                <small class="text-muted">Opsional</small>
              </b-col>

              <!-- Spinner -->
              <b-col v-if="isPending" cols="12" class="text-center">
                <b-spinner variant="primary" class="me-2" />
                <span class="text-muted">Menyimpan perubahan...</span>
              </b-col>

              <!-- Actions -->
              <b-col cols="12">
                <div class="d-flex gap-2 justify-content-end mt-3">
                  <b-button
                    variant="outline-secondary"
                    :disabled="isPending"
                    @click="router.push('/kegiatan')"
                  >
                    Batal
                  </b-button>
                  <b-button
                    type="submit"
                    variant="primary"
                    :disabled="isPending"
                  >
                    <b-spinner v-if="isPending" small class="me-1" />
                    Simpan Perubahan
                  </b-button>
                </div>
              </b-col>
            </b-row>
          </form>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import { useRoute } from "vue-router";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getKegiatanById, updateKegiatan } from "@/services/kegiatanService";
import { getAllMitra } from "@/services/mitraService";
import { getProjects } from "@/services/projectService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const queryClient = useQueryClient();

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const kegiatanId = Number(route.params.id);

const formState = reactive({
  mitra_id: 0,
  project_id: 0,
  judul: "",
  type: "",
  date: "",
  deskripsi: "",
});

const rules = {
  mitra_id: {
    required: helpers.withMessage("Mitra wajib dipilih.", required),
    minValue: helpers.withMessage("Mitra wajib dipilih.", minValue(1)),
  },
  project_id: {
    required: helpers.withMessage("Project wajib dipilih.", required),
    minValue: helpers.withMessage("Project wajib dipilih.", minValue(1)),
  },
  judul: {
    required: helpers.withMessage("Judul wajib diisi.", required),
  },
};

const v$ = useVuelidate(rules, formState);

// Load existing data
const {
  data: kegiatanData,
  isLoading: isLoadingKegiatan,
  isError: isErrorKegiatan,
} = useQuery({
  queryKey: ["kegiatan", kegiatanId],
  queryFn: () => getKegiatanById(kegiatanId),
  enabled: !!kegiatanId,
});

const existingThumbnail = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const newThumbnailFile = ref<File | null>(null);
const newThumbnailPreview = ref<string | null>(null);

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  newThumbnailFile.value = file;
  newThumbnailPreview.value = URL.createObjectURL(file);
};

const clearNewThumbnail = () => {
  newThumbnailFile.value = null;
  newThumbnailPreview.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

// Convert ISO date to YYYY-MM-DD for date input
const toDateOnly = (iso: string | null | undefined): string => {
  if (!iso) return "";
  return iso.split("T")[0];
};

watch(kegiatanData, (data) => {
  if (!data) return;
  formState.mitra_id = data.mitra_id ?? 0;
  formState.project_id = data.project_id ?? 0;
  formState.judul = data.judul ?? "";
  formState.type = data.type ?? "";
  formState.date = toDateOnly(data.date);
  formState.deskripsi = data.deskripsi ?? "";
  existingThumbnail.value = data.thumbnail
    ? `${STORAGE_BASE}${data.thumbnail}`
    : null;
});

// Mitra list
const { data: mitraData, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitras-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});
const mitraList = computed(() => {
  const list = Array.isArray(mitraData.value) ? mitraData.value : [];
  return [
    { value: 0, text: "-- Pilih Mitra --" },
    ...list.map((m: any) => ({ value: m.id, text: m.nama ?? m.name })),
  ];
});

// Project list
const { data: projectData, isLoading: isProjectLoading } = useQuery({
  queryKey: ["projects-list"],
  queryFn: () => getProjects({ mode: "list" }),
});
const projectList = computed(() => {
  const list = Array.isArray(projectData.value) ? projectData.value : [];
  return [
    { value: 0, text: "-- Pilih Project --" },
    ...list.map((p: any) => ({
      value: p.id,
      text: p.judul ?? p.title ?? p.name,
    })),
  ];
});

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("mitra_id", String(formState.mitra_id));
    fd.append("project_id", String(formState.project_id));
    fd.append("judul", formState.judul);
    if (formState.type) fd.append("type", formState.type);
    if (formState.date) fd.append("date", formState.date);
    if (newThumbnailFile.value) fd.append("thumbnail", newThumbnailFile.value);
    if (formState.deskripsi) fd.append("deskripsi", formState.deskripsi);
    return updateKegiatan(kegiatanId, fd);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["kegiatans"] });
    queryClient.invalidateQueries({ queryKey: ["kegiatan", kegiatanId] });
    showToast("Kegiatan berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/kegiatan"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui kegiatan";
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
  mutate();
};
</script>
