<template>
  <div class="d-flex flex-column" style="min-height: 100vh">
    <b-row>
      <!-- Pipeline stage menu -->
      <b-col xxl="2" lg="3" class="d-flex flex-column" style="min-height: 0">
        <PipelineSidebar />
      </b-col>
      <b-col>
        <UIComponentCard
          :title="`Edit Template${templateData ? ' — ' + templateData.name : ''}`"
        >
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data template...</span>
          </div>

          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data template.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <b-row v-else-if="formReady" class="g-3">
            <b-col cols="12">
              <span :class="['badge', typeBadgeClass(formState.type)]">{{
                typeLabel(formState.type)
              }}</span>
            </b-col>

            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Template" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
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
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Pipeline Stage — hanya untuk type crm -->
            <b-col v-if="formState.type === 'crm'" cols="12">
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

            <!-- Variable — hanya untuk type system, freeform sesuai template -->
            <b-col v-if="formState.type === 'system'" cols="12">
              <b-form-group label="Variable" label-for="variable">
                <b-form-input
                  id="variable"
                  v-model="formState.variable"
                  placeholder="XnamadonaturX, XnamaprogramX, ..."
                />
                <small class="text-muted"
                  >Daftar variable yang dipakai pada isi, pisahkan dengan
                  koma</small
                >
              </b-form-group>
            </b-col>

            <!-- Section separator -->
            <b-col cols="12"
              ><hr class="my-1" />
              <h6 class="text-muted fw-semibold mb-2">Isi Pesan</h6></b-col
            >

            <!-- Keterangan Variable — hanya untuk type crm (daftar variable tetap) -->
            <b-col v-if="formState.type === 'crm'" cols="12">
              <div class="bg-light rounded p-3 mb-1">
                <p class="small fw-semibold mb-2">
                  <i class="bx bx-code-block me-1"></i>Variable yang bisa
                  dipakai pada isi pesan (klik untuk menambahkan)
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
              <b-form-group label="Isi Pesan" label-for="isi">
                <b-form-textarea
                  id="isi"
                  v-model="v$.isi.$model"
                  :state="v$.isi.$error ? false : null"
                  rows="8"
                />
                <b-form-invalid-feedback v-if="v$.isi.$error">
                  {{ v$.isi.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Loading + Actions -->
            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" /><span
                class="text-muted"
                >Menyimpan perubahan...</span
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
                  <b-spinner v-if="isPending" small class="me-1" />Simpan
                  Perubahan
                </b-button>
              </div>
            </b-col>
          </b-row>
        </UIComponentCard>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import {
  getCrmChatTemplateDetail,
  updateCrmChatTemplate,
  getPipeline,
} from "@/services/crmService";
import {
  CRM_TEMPLATE_VARIABLES,
  typeBadgeClass,
  typeLabel,
} from "./components/data";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const queryClient = useQueryClient();

const templateId = computed(() => Number(route.params.id));
const formReady = ref(false);

const formState = reactive({
  name: "",
  slug: "",
  isi: "",
  type: "crm",
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

const {
  data: templateData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: computed(() => ["crm-wa-template-detail", templateId.value]),
  queryFn: () => getCrmChatTemplateDetail(templateId.value),
  enabled: computed(() => !!templateId.value),
});

watch(
  templateData,
  (data) => {
    if (!data) return;
    formState.name = data.name ?? "";
    formState.slug = data.slug ?? "";
    formState.isi = data.isi ?? "";
    formState.type = data.type ?? "crm";
    formState.variable = data.variable ?? "";
    formState.pipeline_stage_ids = (data.pipeline_stages ?? []).map(
      (s: any) => s.id,
    );
    formReady.value = true;
  },
  { immediate: true },
);

const { data: stageData, isLoading: isStageLoading } = useQuery({
  queryKey: ["crm-pipeline-stages"],
  queryFn: () => getPipeline(),
  enabled: computed(() => formState.type === "crm"),
});
const stageOptions = computed(() =>
  ((stageData.value ?? []) as any[]).map((s) => ({
    value: s.id,
    text: s.label,
  })),
);

const insertVariable = (code: string) => {
  formState.isi = formState.isi ? `${formState.isi} ${code}` : code;
};

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const payload: any = {
      name: formState.name.trim(),
      isi: formState.isi,
      type: formState.type,
    };

    if (formState.slug.trim()) {
      payload.slug = formState.slug.trim();
    }

    if (formState.type === "system") {
      payload.variable = formState.variable;
    } else {
      payload.pipeline_stage_ids = formState.pipeline_stage_ids;
    }

    return updateCrmChatTemplate(templateId.value, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["crm-wa-templates"] });
    queryClient.invalidateQueries({
      queryKey: ["crm-wa-template-detail", templateId.value],
    });
    showToast("Template berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push({ name: "crm-wa-template" }), 1500);
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal memperbarui template", {
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
