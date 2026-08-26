<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Edit Laporan Project">
          <div v-if="isDetailLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data...</p>
          </div>
          <div v-else-if="isDetailError" class="alert alert-danger">
            Gagal memuat data. Silakan coba lagi.
          </div>

          <b-row v-else class="g-3">
            <!-- Project -->
            <!-- <b-col md="6">
              <b-form-group label="Project" label-for="project-id">
                <ChoicesSelect
                  id="project-id"
                  :modelValue="String(formState.project_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.project_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="projectOptions"
                  :isLoading="isProjectLoading"
                  :key="
                    'proj-' + projectOptions.length + '-' + formState.project_id
                  "
                />
                <div
                  v-if="v$.project_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.project_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col> -->

            <!-- Kegiatan -->
            <b-col md="6">
              <b-form-group label="Kegiatan" label-for="kegiatan-id">
                <ChoicesSelect
                  id="kegiatan-id"
                  :modelValue="String(formState.kegiatan_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.kegiatan_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="kegiatanOptions"
                  :isLoading="isKegiatanLoading"
                  :key="
                    'keg-' +
                    kegiatanOptions.length +
                    '-' +
                    formState.kegiatan_id
                  "
                />
                <div
                  v-if="v$.kegiatan_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.kegiatan_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col>

            <!-- Type -->
            <!-- <b-col md="4">
              <b-form-group label="Tipe" label-for="type">
                <b-form-select
                  id="type"
                  v-model="v$.type.$model"
                  :state="v$.type.$error ? false : null"
                >
                  <template #first>
                    <b-form-select-option value=""
                      >-- Pilih Tipe --</b-form-select-option
                    >
                  </template>
                  <b-form-select-option value="Progress"
                    >Progress</b-form-select-option
                  >
                  <b-form-select-option value="Final"
                    >Final</b-form-select-option
                  >
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.type.$error">
                  {{ v$.type.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col> -->

            <!-- Mitra IDs -->
            <!-- <b-col md="8">
              <b-form-group label="Mitra IDs" label-for="mitra-ids">
                <b-form-textarea
                  id="mitra-ids"
                  v-model="formState.mitra_ids"
                  placeholder="Pisahkan dengan koma atau JSON array"
                  rows="2"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col> -->

            <!-- Section: Media -->
            <b-col cols="12"
              ><hr class="my-1" />
              <h6 class="text-muted fw-semibold mb-3">Media</h6></b-col
            >

            <!-- Thumbnail -->
            <b-col md="6">
              <b-form-group label="Thumbnail" label-for="thumbnail">
                <b-form-file
                  id="thumbnail"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleThumbnailChange"
                  placeholder="Pilih file thumbnail baru..."
                />
                <small class="text-muted"
                  >Opsional — JPG/PNG/WebP, maks 2MB</small
                >
              </b-form-group>

              <div v-if="thumbnailPreview" class="mt-2">
                <img
                  :src="thumbnailPreview"
                  alt="Thumbnail preview"
                  class="img-thumbnail"
                  style="
                    max-height: 150px;
                    max-width: 200px;
                    object-fit: contain;
                  "
                />
              </div>
            </b-col>

            <!-- WA Image -->
            <b-col md="6">
              <b-form-group label="WhatsApp Image" label-for="wa-image">
                <b-form-file
                  id="wa-image"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleWaImageChange"
                  placeholder="Pilih file gambar baru..."
                />
                <small class="text-muted"
                  >Opsional — JPG/PNG/WebP, maks 2MB</small
                >
              </b-form-group>

              <div v-if="waImagePreview" class="mt-2">
                <img
                  :src="waImagePreview"
                  alt="WhatsApp image preview"
                  class="img-thumbnail"
                  style="
                    max-height: 150px;
                    max-width: 200px;
                    object-fit: contain;
                  "
                />
              </div>
            </b-col>

            <!-- Instagram Link -->
            <b-col md="6">
              <b-form-group label="Instagram Link" label-for="link-ig">
                <b-form-input
                  id="link-ig"
                  v-model="formState.link_ig"
                  type="url"
                  maxlength="255"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Instagram Embed -->
            <b-col md="6">
              <b-form-group label="Instagram Embed" label-for="embed-ig">
                <b-form-textarea
                  id="embed-ig"
                  v-model="formState.embed_ig"
                  placeholder="Embed code dari Instagram..."
                  rows="3"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- WhatsApp Caption -->
            <b-col cols="12">
              <b-form-group label="WhatsApp Caption" label-for="wa-caption">
                <b-form-textarea
                  id="wa-caption"
                  v-model="formState.wa_caption"
                  placeholder="Caption untuk WhatsApp..."
                  rows="4"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Loading + Actions -->
            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" /><span
                class="text-muted"
                >Menyimpan...</span
              >
            </b-col>
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.back()"
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
import { computed, reactive, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { getReportById, updateReport } from "@/services/reportService";
import { getProjects } from "@/services/projectService";
import { getAllKegiatan } from "@/services/kegiatanService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const id = computed(() => Number(route.params.id));
const queryClient = useQueryClient();

const thumbnailFile = ref<File | null>(null);
const thumbnailPreview = ref<string | null>(null);
const waImageFile = ref<File | null>(null);
const waImagePreview = ref<string | null>(null);

const formState = reactive({
  project_id: 0,
  kegiatan_id: 0,
  type: "Final",
  mitra_ids: "",
  link_ig: "",
  embed_ig: "",
  wa_caption: "",
});

const rules = {
  project_id: {
    required: helpers.withMessage("Project wajib dipilih", required),
    minValue: helpers.withMessage("Project wajib dipilih", minValue(1)),
  },
  kegiatan_id: {
    required: helpers.withMessage("Kegiatan wajib dipilih", required),
    minValue: helpers.withMessage("Kegiatan wajib dipilih", minValue(1)),
  },
  type: {
    required: helpers.withMessage("Tipe wajib dipilih", required),
  },
};

const v$ = useVuelidate(rules, formState);

const {
  data: reportData,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["reports", id.value]),
  queryFn: () => getReportById(id.value),
  enabled: computed(() => !!id.value),
});

watch(
  () => reportData.value,
  (val) => {
    if (!val) return;

    formState.project_id = val.project_id ?? 0;
    formState.kegiatan_id = val.kegiatan_id ?? 0;
    formState.type = val.type ?? "";
    formState.mitra_ids = String(val.mitra_ids ?? "");
    formState.link_ig = val.link_ig ?? "";
    formState.embed_ig = val.embed_ig ?? "";
    formState.wa_caption = val.wa_caption ?? "";

    thumbnailPreview.value = val.thumbnail_url ?? null;
    waImagePreview.value = val.wa_image ?? null;
  },
  { immediate: true },
);

// ── Dropdown options ──────────────────────────────────────────────────────
const { data: kegiatanData, isLoading: isKegiatanLoading } = useQuery({
  queryKey: ["kegiatans-list", formState.project_id],
  queryFn: () =>
    getAllKegiatan({
      mode: "list",
      project_id: formState.project_id,
    }),
  enabled: computed(() => formState.project_id > 0),
});

const kegiatanOptions = computed(() => {
  const list = Array.isArray(kegiatanData.value) ? kegiatanData.value : [];
  return [
    { value: 0, text: "-- Pilih Kegiatan --" },
    ...list.map((k: any) => ({ value: k.id, text: k.judul })),
  ];
});

// ── File handlers ─────────────────────────────────────────────────────────

const handleThumbnailChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  thumbnailFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleWaImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  waImageFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      waImagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// ── Submit ────────────────────────────────────────────────────────────────

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("project_id", String(formState.project_id));
    formData.append("kegiatan_id", String(formState.kegiatan_id));
    formData.append("type", formState.type);
    if (formState.mitra_ids.trim())
      formData.append("mitra_ids", formState.mitra_ids.trim());
    if (thumbnailFile.value) formData.append("thumbnail", thumbnailFile.value);
    if (waImageFile.value) formData.append("wa_image", waImageFile.value);
    if (formState.link_ig.trim())
      formData.append("link_ig", formState.link_ig.trim());
    if (formState.embed_ig.trim())
      formData.append("embed_ig", formState.embed_ig.trim());
    if (formState.wa_caption.trim())
      formData.append("wa_caption", formState.wa_caption.trim());
    return updateReport(id.value, formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["reports", id.value] });
    showToast("Laporan berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(
      () => router.push(`/project-report?project_id=${formState.project_id}`),
      1500,
    );
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal memperbarui laporan", {
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
  console.log(formState);
};
</script>
