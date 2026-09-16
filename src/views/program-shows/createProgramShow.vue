<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="program-show-form-create" title="Tambah Program Show">
          <b-row class="g-3">
            <!-- Pilih Program -->
            <b-col cols="12">
              <b-form-group label="Program" label-for="program">
                <b-input-group>
                  <span class="input-group-text">
                    <i class="bx bx-search"></i>
                  </span>
                  <b-form-input
                    id="program"
                    v-model="programQuery"
                    type="text"
                    placeholder="Cari nama program..."
                    debounce="400"
                    :class="{ 'is-invalid': v$.program_id.$error }"
                    @focus="showDropdown = true"
                  />
                </b-input-group>

                <div
                  v-if="showDropdown && (isSearching || programOptions.length)"
                  class="border rounded mt-1"
                  style="max-height: 220px; overflow-y: auto"
                >
                  <div v-if="isSearching" class="p-2 text-muted small">
                    <b-spinner small class="me-1" />Mencari program...
                  </div>
                  <button
                    v-for="p in programOptions"
                    :key="p.id"
                    type="button"
                    class="dropdown-item d-flex align-items-center gap-2 p-2 w-100 text-start border-0 bg-transparent"
                    @click="selectProgram(p)"
                  >
                    <img
                      v-if="p.image"
                      :src="p.image"
                      alt=""
                      width="32"
                      height="32"
                      style="object-fit: cover; border-radius: 4px"
                    />
                    <span>{{ p.title }}</span>
                  </button>
                  <div
                    v-if="!isSearching && !programOptions.length"
                    class="p-2 text-muted small"
                  >
                    Tidak ada program ditemukan.
                  </div>
                </div>

                <!-- Program terpilih -->
                <div
                  v-if="selectedProgram"
                  class="mt-2 d-flex align-items-center gap-2 border rounded p-2"
                >
                  <img
                    v-if="selectedProgram.image"
                    :src="selectedProgram.image"
                    alt=""
                    width="36"
                    height="36"
                    style="object-fit: cover; border-radius: 4px"
                  />
                  <span class="flex-grow-1">{{ selectedProgram.title }}</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="clearProgram"
                  >
                    <i class="bx bx-x"></i>
                  </button>
                </div>

                <div v-if="v$.program_id.$error" class="invalid-feedback d-block">
                  Program wajib dipilih.
                </div>
              </b-form-group>
            </b-col>

            <!-- Pilih Type -->
            <b-col md="6">
              <b-form-group label="Type" label-for="type">
                <b-form-select
                  id="type"
                  v-model="formState.type"
                  :options="typeOptions"
                  :class="{ 'is-invalid': v$.type.$error }"
                />
                <div v-if="v$.type.$error" class="invalid-feedback d-block">
                  Type wajib dipilih.
                </div>
              </b-form-group>
            </b-col>

            <!-- Spinner saat submit -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan program show...</span>
            </b-col>

            <!-- Tombol Submit -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  @click="router.push('/program-show')"
                  :disabled="isPending"
                >
                  Batal
                </b-button>
                <b-button variant="primary" @click="handleSubmit" :disabled="isPending">
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Program Show
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
import { reactive, ref, watch } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import {
  createProgramShow,
  searchPrograms,
  PROGRAM_SHOW_TYPES,
  type ProgramBrief,
  type ProgramShowType,
} from "@/services/programShowService";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

const typeOptions = PROGRAM_SHOW_TYPES.map((t) => ({
  value: t.value,
  text: t.label,
}));

const formState = reactive({
  program_id: null as number | null,
  type: "" as ProgramShowType | "",
});

const rules = {
  program_id: { required },
  type: { required },
};

const v$ = useVuelidate(rules, formState);

// ── Program search/select ──────────────────────────────────────────────
const programQuery = ref("");
const programOptions = ref<ProgramBrief[]>([]);
const selectedProgram = ref<ProgramBrief | null>(null);
const showDropdown = ref(false);
const isSearching = ref(false);

watch(programQuery, async (q) => {
  if (selectedProgram.value) return; // skip search kalau baru saja pilih
  isSearching.value = true;
  try {
    programOptions.value = await searchPrograms(q);
  } catch {
    programOptions.value = [];
  } finally {
    isSearching.value = false;
  }
});

const selectProgram = (p: ProgramBrief) => {
  selectedProgram.value = p;
  formState.program_id = p.id;
  programQuery.value = p.title;
  showDropdown.value = false;
  v$.value.program_id.$touch();
};

const clearProgram = () => {
  selectedProgram.value = null;
  formState.program_id = null;
  programQuery.value = "";
  programOptions.value = [];
  v$.value.program_id.$reset();
};

// ── Submit ──────────────────────────────────────────────────────────────
const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: () =>
    createProgramShow({
      program_id: formState.program_id as number,
      type: formState.type as ProgramShowType,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-shows"] });
    showToast("Program show berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/program-show"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan program show";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Lengkapi program dan type terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  submitCreate();
};
</script>