<template>
  <PipelineLayout>
    <UIComponentCard title="Buat Template WA">
      <b-row class="g-3">
        <b-col cols="12">
          <div class="alert alert-info d-flex align-items-center gap-2 mb-0">
            <i class="bx bx-info-circle fs-18"></i>
            <span class="small mb-0">
              Template baru hanya bisa dibuat dengan tipe
              <strong>CRM</strong>. Template tipe <strong>System</strong> tidak
              bisa dibuat dari sini.
            </span>
          </div>
        </b-col>

        <!-- Nama -->
        <b-col md="6">
          <b-form-group label="Nama Template *" label-for="name">
            <b-form-input
              id="name"
              v-model="v$.name.$model"
              :state="v$.name.$error ? false : null"
              maxlength="255"
              placeholder="Contoh: FollowUpMenunggu"
            />
            <b-form-invalid-feedback v-if="v$.name.$error">
              {{ v$.name.$errors[0].$message }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <!-- Slug -->
        <b-col md="6">
          <b-form-group label="Slug" label-for="slug">
            <b-form-input
              id="slug"
              v-model="formState.slug"
              maxlength="100"
              placeholder="Contoh: followUpMenunggu"
            />
            <small class="text-muted"
              >Opsional, dibuat otomatis dari nama jika dikosongkan</small
            >
          </b-form-group>
        </b-col>

        <!-- Pipeline Stage -->
        <b-col cols="12">
          <b-form-group
            label="Stage Pipeline Terkait"
            label-for="pipeline-stage-ids"
          >
            <small class="text-muted d-block mb-2">
              Template akan tersedia untuk dikirim pada stage pipeline yang
              dipilih (opsional)
            </small>
            <div v-if="isStageLoading" class="text-muted small">
              <b-spinner small class="me-1" />Memuat stage pipeline...
            </div>
            <ChoicesSelect
              v-else
              id="pipeline-stage-ids"
              :modelValue="formState.pipeline_stage_ids.map(String)"
              @update:modelValue="
                (val: string[]) => {
                  formState.pipeline_stage_ids = val.map(Number);
                }
              "
              :options="stageOptions"
              :choice-options="{ removeItemButton: true }"
              multiple
            />
          </b-form-group>
        </b-col>

        <!-- Variable -->
        <!-- <b-col cols="12">
          <b-form-group label="Variable" label-for="variable">
            <b-form-input
              id="variable"
              v-model="formState.variable"
              placeholder="Contoh: XnamadonaturX, XnominalX, ..."
            />
            <small class="text-muted"
              >Opsional, daftar variable yang dipakai (pisahkan dengan koma). Otomatis terdeteksi dari isi pesan jika dikosongkan.</small
            >
          </b-form-group>
        </b-col> -->

        <!-- Gambar / Image -->
        <b-col cols="12">
          <b-form-group label="Gambar" label-for="image">
            <b-form-file
              id="image"
              ref="fileInputRef"
              accept="image/jpeg,image/png,image/webp,image/gif"
              placeholder="Pilih file gambar..."
              drop-placeholder="Drop gambar di sini..."
              @change="handleImageChange"
            />
            <small class="text-muted d-block mt-1">
              Opsional — JPG, PNG, WEBP, GIF (Maks. 2MB)
            </small>

            <!-- Preview Gambar -->
            <div v-if="imagePreview" class="mt-2 position-relative d-inline-block">
              <p class="text-muted small mb-1">Preview Gambar:</p>
              <img
                :src="imagePreview"
                alt="Preview Template"
                class="img-thumbnail"
                style="max-height: 160px; max-width: 100%; object-fit: contain"
              />
              <div class="mt-1">
                <b-button
                  variant="outline-danger"
                  size="sm"
                  @click="clearImage"
                >
                  <i class="bx bx-trash me-1"></i>Hapus Gambar
                </b-button>
              </div>
            </div>
          </b-form-group>
        </b-col>

        <!-- Section separator -->
        <b-col cols="12"
          ><hr class="my-1" />
          <h6 class="text-muted fw-semibold mb-2">Isi Pesan *</h6></b-col
        >

        <!-- Keterangan Variable -->
        <b-col cols="12">
          <div class="bg-light rounded p-3 mb-1">
            <p class="small fw-semibold mb-2">
              <i class="bx bx-code-block me-1"></i>Variable yang bisa dipakai
              pada isi pesan (klik untuk menambahkan)
            </p>
            <div class="d-flex flex-wrap gap-2">
              <b-badge
                v-for="v in CRM_TEMPLATE_VARIABLES"
                :key="v.code"
                variant="light"
                class="text-dark font-monospace cursor-pointer border"
                :title="v.description"
                @click="insertVariable(v.code)"
              >
                {{ v.code }}
              </b-badge>
            </div>
            <ul class="small text-muted mt-2 mb-0 ps-3">
              <li v-for="v in CRM_TEMPLATE_VARIABLES" :key="v.code">
                <span class="font-monospace">{{ v.code }}</span> —
                {{ v.description }}
              </li>
            </ul>
          </div>
        </b-col>

        <!-- Isi -->
        <b-col cols="12">
          <b-form-group label="Isi Pesan *" label-for="isi">
            <b-form-textarea
              id="isi"
              v-model="v$.isi.$model"
              :state="v$.isi.$error ? false : null"
              rows="15"
              placeholder="Tulis isi pesan WhatsApp di sini, gunakan variable di atas sesuai kebutuhan..."
            />
            <b-form-invalid-feedback v-if="v$.isi.$error">
              {{ v$.isi.$errors[0].$message }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <!-- Loading + Actions -->
        <b-col v-if="isPending" cols="12" class="text-center">
          <b-spinner variant="primary" class="me-2" /><span class="text-muted"
            >Menyimpan...</span
          >
        </b-col>
        <b-col cols="12">
          <div class="d-flex gap-2 justify-content-end">
            <b-button
              variant="outline-secondary"
              :disabled="isPending"
              @click="router.push({ name: 'crm-wa-template' })"
            >
              Batal
            </b-button>
            <b-button
              variant="primary"
              :disabled="isPending"
              @click="handleSubmit"
            >
              <b-spinner v-if="isPending" small class="me-1" />Simpan Template
            </b-button>
          </div>
        </b-col>
      </b-row>
    </UIComponentCard>
  </PipelineLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import PipelineLayout from "@/components/PipelineLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { createCrmChatTemplate, getPipeline } from "@/services/crmService";
import { CRM_TEMPLATE_VARIABLES } from "./components/data";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const fileInputRef = ref<any>(null);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const formState = reactive({
  name: "",
  slug: "",
  isi: "",
  variable: "",
  pipeline_stage_ids: [] as number[],
});

const rules = {
  name: {
    required: helpers.withMessage("Nama template wajib diisi", required),
  },
  isi: { required: helpers.withMessage("Isi pesan wajib diisi", required) },
};
const v$ = useVuelidate(rules, formState);

const { data: stageData, isLoading: isStageLoading } = useQuery({
  queryKey: ["crm-pipeline-stages"],
  queryFn: () => getPipeline(),
});
const stageOptions = computed(() =>
  ((stageData.value ?? []) as any[]).map((s) => ({
    value: s.id,
    text: s.label,
  })),
);

const extractVariables = (content: string): string => {
  const matches = content.match(/X[a-zA-Z0-9_]+X/g);
  return matches ? Array.from(new Set(matches)).join(", ") : "";
};

const insertVariable = (code: string) => {
  formState.isi = formState.isi ? `${formState.isi} ${code}` : code;
  const currentVars = formState.variable
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!currentVars.includes(code)) {
    currentVars.push(code);
    formState.variable = currentVars.join(", ");
  }
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    showToast("Format gambar harus JPG, PNG, WEBP, atau GIF", {
      type: "error",
      position: "top-center",
    });
    input.value = "";
    return;
  }

  const maxSizeBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSizeBytes) {
    showToast("Ukuran gambar maksimal 2MB", {
      type: "error",
      position: "top-center",
    });
    input.value = "";
    return;
  }

  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  if (fileInputRef.value) {
    if (fileInputRef.value.$el?.querySelector("input[type=file]")) {
      fileInputRef.value.$el.querySelector("input[type=file]").value = "";
    } else if (fileInputRef.value.value !== undefined) {
      fileInputRef.value.value = "";
    }
  }
};

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("name", formState.name.trim());
    if (formState.slug.trim()) {
      formData.append("slug", formState.slug.trim());
    }
    formData.append("isi", formState.isi);
    formData.append("type", "crm");

    const variableVal =
      formState.variable.trim() || extractVariables(formState.isi);
    if (variableVal) {
      formData.append("variable", variableVal);
    }

    if (formState.pipeline_stage_ids.length > 0) {
      formData.append(
        "pipeline_stage_ids",
        JSON.stringify(formState.pipeline_stage_ids),
      );
    }

    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }

    return createCrmChatTemplate(formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["crm-wa-templates"] });
    showToast("Template berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push({ name: "crm-wa-template" }), 1500);
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal menambahkan template", {
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
