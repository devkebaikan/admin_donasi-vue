<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Kegiatan">
          <b-row class="g-3">
            <!-- Mitra -->
            <!-- <b-col md="6">
              <b-form-group label="Mitra" label-for="mitra-id">
                <ChoicesSelect
                  id="mitra-id"
                  :modelValue="String(formState.mitra_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.mitra_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="mitraList"
                  :isLoading="isMitraLoading"
                  :key="mitraList.length"
                />
                <div v-if="v$.mitra_id.$error" class="invalid-feedback d-block">
                  {{ v$.mitra_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col> -->

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

            <!-- Project -->
            <b-col md="6">
              <b-form-group label="Project" label-for="project-id">
                <SearchSelect
                  id="project-id"
                  :modelValue="String(formState.project_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.project_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  @search="
                    (query: string) => {
                      projectSearchQuery = query;
                    }
                  "
                  :options="projectList"
                  :isLoading="isProjectLoading"
                />
                <div
                  v-if="v$.project_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.project_id.$errors[0].$message }}
                </div>
              </b-form-group>

              <small v-if="formState.mitra_name"
                >Mitra : {{ formState.mitra_name }} -
                {{ formState.mitra_id }}</small
              >
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
                <b-form-input id="date" v-model="formState.date" type="date" />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Thumbnail -->
            <b-col cols="12">
              <b-form-group label="Thumbnail" label-for="thumbnail">
                <ImageUpload id="thumbnail" v-model="formState.thumbnail" />
                <small class="text-muted">Opsional</small>
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
              <span class="text-muted">Menyimpan data...</span>
            </b-col>

            <!-- Actions -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end mt-3">
                <b-button
                  type="button"
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
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Kegiatan
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
import { computed, reactive, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
// import ChoicesSelect from "@/components/ChoicesSelect.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import { createKegiatan } from "@/services/kegiatanService";
import { getAllMitra } from "@/services/mitraService";
import { getProjects, getProjectById } from "@/services/projectService";
import router from "@/router";
import { useRoute } from "vue-router";
import { useSearchSelect } from "@/composables/useSearchSelect";

const route = useRoute();

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  mitra_id: "",
  project_id: 0,
  judul: "",
  type: "",
  date: "",
  thumbnail: null as File | null,
  deskripsi: "",
  mitra_name: "",
});

watch(
  () => route.query.project_id,
  (id) => {
    formState.project_id = id ? Number(id) : 0;
  },
  { immediate: true },
);

watch(
  () => formState.project_id,
  async (projectId) => {
    if (projectId && projectId > 0) {
      const project = await getProjectById(projectId);
      if (project) {
        if (project.mitra_utama !== null) {
          formState.mitra_id = project.mitra_utama.id;
          formState.mitra_name = project.mitra_utama.nama;
        } else {
          formState.mitra_id = "";
          formState.mitra_name = "";
        }
      }
    }
  },
  { immediate: true },
);

const rules = {
  mitra_id: {},
  project_id: {
    required: helpers.withMessage("Project wajib dipilih.", required),
    minValue: helpers.withMessage("Project wajib dipilih.", minValue(1)),
  },
  judul: {
    required: helpers.withMessage("Judul wajib diisi.", required),
  },
};

const v$ = useVuelidate(rules, formState);

// Mitra list
// const { data: mitraData, isLoading: isMitraLoading } = useQuery({
//   queryKey: ["mitras-list"],
//   queryFn: () => getAllMitra({ mode: "list" }),
// });

// const mitraList = computed(() => {
//   const list = Array.isArray(mitraData.value) ? mitraData.value : [];
//   return [
//     { value: 0, text: "-- Pilih Mitra --" },
//     ...list.map((m: any) => ({ value: m.id, text: m.nama ?? m.name })),
//   ];
// });

// project search select
const {
  searchQuery: projectSearchQuery,
  options: projectList,
  isLoading: isProjectLoading,
} = useSearchSelect({
  queryKey: "projects",
  fetchFn: getProjects,
  optionsMapper: (project: any) => ({
    value: project.id,
    text: project.judul ?? project.title ?? project.name,
  }),
  placeholder: "Cari project...",
  limit: 10,
});

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const fd = new FormData();
    fd.append("mitra_id", String(formState.mitra_id));
    fd.append("project_id", String(formState.project_id));
    fd.append("judul", formState.judul);
    if (formState.type) fd.append("type", formState.type);
    if (formState.date) fd.append("date", formState.date);
    if (formState.thumbnail) fd.append("thumbnail", formState.thumbnail);
    if (formState.deskripsi) fd.append("deskripsi", formState.deskripsi);
    return createKegiatan(fd);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["kegiatans"] });
    showToast("Kegiatan berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/kegiatan"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menyimpan kegiatan";
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
  // console.log(formState);
};
</script>
