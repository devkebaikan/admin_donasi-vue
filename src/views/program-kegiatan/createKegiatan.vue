<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Kegiatan">
          <b-row class="g-3">
            <!-- Mitra -->
            <b-col md="6">
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
            </b-col>

            <!-- Project -->
            <b-col md="6">
              <b-form-group label="Project" label-for="project-id">
                <ChoicesSelect
                  id="project-id"
                  :modelValue="String(formState.project_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.project_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="projectList"
                  :isLoading="isProjectLoading"
                  :key="projectList.length"
                />
                <div
                  v-if="v$.project_id.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.project_id.$errors[0].$message }}
                </div>
              </b-form-group>
            </b-col>

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
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/kegiatan')"
                >
                  Batal
                </b-button>
                <b-button
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
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import { createKegiatan } from "@/services/kegiatanService";
import { getAllMitra } from "@/services/mitraService";
import { getProjects } from "@/services/projectService";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  mitra_id: 0,
  project_id: 0,
  judul: "",
  type: "",
  date: "",
  thumbnail: null as File | null,
  deskripsi: "",
});

watch(
  () => route.query.project_id,
  (id) => {
    formState.project_id = id ? Number(id) : 0;
  },
  { immediate: true },
);

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
};
</script>
