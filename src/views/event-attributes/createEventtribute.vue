<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Event Attribute">
          <b-row class="g-3">
            <b-col md="6">
              <b-form-group label="Event" label-for="event_id">
                <ChoicesSelect
                  id="event_id"
                  :modelValue="String(formState.event_id || 0)"
                  @update:modelValue="
                    (val: any) => {
                      formState.event_id = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="eventOptions"
                  :isLoading="isEventLoading"
                  :key="eventOptions.length"
                />
                <div v-if="eventError" class="invalid-feedback d-block">
                  {{ eventError }}
                </div>
              </b-form-group>
            </b-col>

            <b-col md="6">
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
                  <b-form-select-option value="text">Text</b-form-select-option>
                  <b-form-select-option value="image"
                    >Image</b-form-select-option
                  >
                  <b-form-select-option value="video"
                    >Video</b-form-select-option
                  >
                  <b-form-select-option value="file">File</b-form-select-option>
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.type.$error">
                  {{ v$.type.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Judul" label-for="title">
                <b-form-input
                  id="title"
                  v-model="v$.title.$model"
                  :state="v$.title.$error ? false : null"
                  maxlength="255"
                  placeholder="e.g., Materi 1"
                />
                <b-form-invalid-feedback v-if="v$.title.$error">
                  {{ v$.title.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Urutan" label-for="sequence">
                <b-form-input
                  id="sequence"
                  v-model.number="v$.sequence.$model"
                  type="number"
                  min="1"
                  :state="v$.sequence.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.sequence.$error">
                  {{ v$.sequence.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Source From" label-for="source_from">
                <b-form-input
                  id="source_from"
                  v-model="formState.source_from"
                  placeholder="e.g., url"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Source" label-for="source">
                <b-form-input
                  id="source"
                  v-model="formState.source"
                  placeholder="e.g., https://youtube.com/..."
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <b-col cols="12">
              <b-form-group label="Deskripsi" label-for="description">
                <b-form-textarea
                  id="description"
                  v-model="formState.description"
                  rows="3"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan...</span>
            </b-col>

            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/event-attribute')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />Simpan
                  Attribute
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
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import {
  createEventAttribute,
  getEvents,
} from "@/services/eventService";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const formState = reactive({
  event_id: 0,
  title: "",
  sequence: 1,
  type: "",
  source_from: "",
  source: "",
  description: "",
});

const eventError = ref("");

const rules = {
  title: { required: helpers.withMessage("Judul wajib diisi", required) },
  sequence: {
    required: helpers.withMessage("Urutan wajib diisi", required),
    minValue: helpers.withMessage("Urutan minimal 1", minValue(1)),
  },
  type: { required: helpers.withMessage("Tipe wajib dipilih", required) },
};

const v$ = useVuelidate(rules, formState);

const { data: eventData, isLoading: isEventLoading } = useQuery({
  queryKey: ["events-list"],
  queryFn: () => getEvents({ mode: "list" }),
});
const eventOptions = computed(() => {
  const list = Array.isArray(eventData.value) ? eventData.value : [];
  return [
    { value: 0, text: "-- Pilih Event --" },
    ...list.map((e: any) => ({ value: e.id, text: e.title })),
  ];
});

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    createEventAttribute({
      event_id: formState.event_id,
      title: formState.title.trim(),
      sequence: formState.sequence,
      type: formState.type,
      ...(formState.source_from.trim()
        ? { source_from: formState.source_from.trim() }
        : {}),
      ...(formState.source.trim() ? { source: formState.source.trim() } : {}),
      ...(formState.description.trim()
        ? { description: formState.description.trim() }
        : {}),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["event-attributes"] });
    showToast("Event attribute berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/event-attribute"), 1500);
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal menyimpan", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;

  eventError.value = formState.event_id ? "" : "Event wajib dipilih.";
  const isValid = await v$.value.$validate();

  if (!isValid || eventError.value) {
    showToast("Lengkapi field wajib", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
