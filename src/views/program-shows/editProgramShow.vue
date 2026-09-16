<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="program-show-form-edit"
          :title="`Edit Program Show${programShowData ? ': ' + (programShowData.program?.title ?? '#' + programShowData.id) : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingData" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data program show...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data program show.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchData">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <b-row v-else-if="formReady" class="g-3">
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
              </b-form-group>
            </b-col>

            <!-- Pilih Type -->
            <b-col md="6">
              <b-form-group label="Type" label-for="type">
                <b-form-select
                  id="type"
                  v-model="formState.type"
                  :options="typeOptions"
                />
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
                  @click="router.push('/program-show')"
                  :disabled="isPending"
                >
                  Batal
                </b-button>
                <b-button variant="primary" @click="handleSubmit" :disabled="isPending">
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
import { reactive, ref, computed, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import {
  getProgramShowById,
  updateProgramShow,
  searchPrograms,
  PROGRAM_SHOW_TYPES,
  type ProgramBrief,
  type ProgramShowType,
} from "@/services/programShowService";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const typeOptions = PROGRAM_SHOW_TYPES.map((t) => ({
  value: t.value,
  text: t.label,
}));

const programShowId = computed(() => Number(route.params.id));

const formReady = ref(false);
const formState = reactive({
  type: "" as ProgramShowType | "",
});

// ── Fetch existing data ──────────────────────────────────────────────────
const {
  data: programShowData,
  isLoading: isFetchingData,
  isError: fetchError,
  refetch: refetchData,
} = useQuery({
  queryKey: ["program-shows", programShowId],
  queryFn: () => getProgramShowById(programShowId.value),
  enabled: computed(() => !!programShowId.value),
});

// ── Program search/select ──────────────────────────────────────────────
const programQuery = ref("");
const programOptions = ref<ProgramBrief[]>([]);
const selectedProgram = ref<ProgramBrief | null>(null);
const showDropdown = ref(false);
const isSearching = ref(false);

watch(
  programShowData,
  (data) => {
    if (!data) return;

    formState.type = (data.type as ProgramShowType) ?? "";

    if (data.program) {
      selectedProgram.value = data.program;
      programQuery.value = data.program.title;
    }

    formReady.value = true;
  },
  { immediate: true },
);

watch(programQuery, async (q) => {
  if (selectedProgram.value && q === selectedProgram.value.title) return;
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
  programQuery.value = p.title;
  showDropdown.value = false;
};

const clearProgram = () => {
  selectedProgram.value = null;
  programQuery.value = "";
  programOptions.value = [];
};

// ── Submit ──────────────────────────────────────────────────────────────
const { mutate: submitUpdate, isPending } = useMutation({
  mutationFn: () =>
    updateProgramShow(programShowId.value, {
      program_id: selectedProgram.value?.id,
      type: formState.type ? (formState.type as ProgramShowType) : undefined,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["program-shows"] });
    queryClient.invalidateQueries({ queryKey: ["program-shows", programShowId] });
    showToast("Program show berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/program-show"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui program show";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;

  if (!selectedProgram.value) {
    showToast("Pilih program terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  submitUpdate();
};
</script>