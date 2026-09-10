<template>
  <b-offcanvas
    v-model="showOffcanvas"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 680px"
    @hide="$emit('hide')"
  >
    <!-- Header -->
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-category me-1 text-primary"></i>
          Detail Tema
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isFetchingTema" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat data tema...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="alert alert-danger m-3">
      <div class="d-flex align-items-center justify-content-between">
        <span>Gagal memuat detail tema.</span>
        <b-button size="sm" variant="outline-danger" @click="refetchTema">
          <i class="bx bx-refresh me-1"></i>Coba Lagi
        </b-button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="temaData" class="pb-4">
      <!-- Info Header Tema -->
      <div class="p-3 bg-light rounded border mb-4">
        <div class="d-flex gap-3 align-items-start">
          <img
            v-if="temaImageUrl"
            :src="temaImageUrl"
            :alt="temaData.judul"
            class="rounded border"
            style="width: 72px; height: 72px; object-fit: cover; flex-shrink: 0"
            onerror="this.style.display = 'none'"
          />
          <div
            v-else
            class="rounded border bg-white d-flex align-items-center justify-content-center text-muted"
            style="width: 72px; height: 72px; flex-shrink: 0"
          >
            <i class="bx bx-image-alt fs-24"></i>
          </div>

          <div class="flex-grow-1 min-w-0">
            <h5 class="fw-bold mb-1 text-truncate">{{ temaData.judul }}</h5>
            <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
              <span class="badge bg-secondary font-monospace">
                slug: {{ temaData.slug }}
              </span>
              <span class="badge bg-info">
                {{ attachedPrograms.length }} Program Terhubung
              </span>
            </div>
            <p v-if="temaData.description" class="text-muted small mb-0">
              {{ temaData.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section: Tambah Program ke Tema -->
      <div class="card border mb-4">
        <div class="card-header bg-soft-primary py-2">
          <h6
            class="card-title mb-0 fs-14 fw-semibold text-primary d-flex align-items-center"
          >
            <i class="bx bx-plus-circle me-1 fs-16"></i>
            Tambah Program ke Tema
          </h6>
        </div>
        <div class="card-body p-3">
          <p class="text-muted small mb-3">
            Pilih satu atau lebih program untuk ditautkan ke tema
            <strong>{{ temaData.judul }}</strong
            >.
          </p>

          <div v-if="isProgramLoading" class="text-muted small py-2">
            <b-spinner small class="me-1" />Memuat daftar program...
          </div>

          <div v-else>
            <div class="mb-3">
              <ChoicesSelect
                :key="`choices-add-prog-${temaId}-${choicesKey}`"
                :id="`tema-attach-program-select-${temaId}`"
                :modelValue="selectedProgramIdsToAdd.map(String)"
                @update:modelValue="handleProgramSelectionChange"
                :options="availableProgramOptions"
                :choice-options="{
                  removeItemButton: true,
                  placeholderValue: 'Cari dan pilih program...',
                  searchPlaceholderValue: 'Ketik nama program...',
                }"
                multiple
              />
              <small class="text-muted d-block mt-1">
                Program yang sudah terhubung tidak ditampilkan dalam daftar
                pilihan.
              </small>
            </div>

            <div class="d-flex justify-content-end">
              <b-button
                variant="success"
                size="sm"
                :disabled="
                  isAttachPending || selectedProgramIdsToAdd.length === 0
                "
                @click="handleAttachPrograms"
              >
                <b-spinner v-if="isAttachPending" small class="me-1" />
                <i v-else class="bx bx-plus me-1"></i>
                Tambahkan
                {{
                  selectedProgramIdsToAdd.length
                    ? `(${selectedProgramIdsToAdd.length}) Program`
                    : "Program"
                }}
              </b-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Daftar Program Terkait -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6
          class="fw-semibold text-uppercase text-muted mb-0"
          style="font-size: 12px; letter-spacing: 0.5px"
        >
          <i class="bx bx-list-ul me-1"></i>
          Daftar Program Terkait
          <span class="badge bg-primary ms-1">{{
            attachedPrograms.length
          }}</span>
        </h6>
      </div>

      <!-- Empty State -->
      <div
        v-if="attachedPrograms.length === 0"
        class="text-center py-4 px-3 border rounded bg-light"
      >
        <i class="bx bx-folder-open fs-36 text-muted mb-2 d-block"></i>
        <h6 class="fw-semibold text-muted mb-1">Belum Ada Program</h6>
        <p class="text-muted small mb-0">
          Tema ini belum memiliki program terkait. Gunakan form di atas untuk
          menambahkan program.
        </p>
      </div>

      <!-- List Cards Program -->
      <div v-else class="d-flex flex-column gap-2">
        <div
          v-for="prog in attachedPrograms"
          :key="prog.id"
          class="p-3 rounded border bg-white shadow-sm"
        >
          <div class="d-flex gap-3 align-items-start">
            <!-- Thumbnail Program -->
            <img
              v-if="prog.image"
              :src="prog.image"
              :alt="prog.judul"
              class="rounded border"
              style="
                width: 58px;
                height: 58px;
                object-fit: cover;
                flex-shrink: 0;
              "
              onerror="this.style.display = 'none'"
            />
            <div
              v-else
              class="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
              style="width: 58px; height: 58px; flex-shrink: 0"
            >
              <i class="bx bx-donate-heart fs-20"></i>
            </div>

            <!-- Program Info -->
            <div class="flex-grow-1 min-w-0">
              <h6 class="mb-1 fs-14 text-wrap">{{ prog.judul }}</h6>

              <div class="d-flex flex-wrap gap-1 align-items-center mb-2">
                <div
                  v-if="prog.mitra?.name"
                  class="text-muted small d-flex align-items-center gap-1"
                >
                  <i class="bx bx-building-house"></i>
                  <span>{{ prog.mitra.name }}</span>
                </div>
                <span
                  v-if="prog.status"
                  class="ms-1"
                  :class="[
                    'badge',
                    prog.status === 'PUBLISH'
                      ? 'bg-success'
                      : prog.status === 'DRAFT'
                        ? 'bg-warning'
                        : 'bg-secondary',
                  ]"
                >
                  {{ prog.status }}
                </span>
              </div>
            </div>

            <!-- Tombol Hapus Program dari Tema -->
            <div class="flex-shrink-0">
              <b-button
                variant="outline-danger"
                size="sm"
                class="d-flex align-items-center gap-1"
                title="Hapus dari tema ini"
                :disabled="isDeletingId === prog.id"
                @click="handleDeleteProgram(prog)"
              >
                <b-spinner v-if="isDeletingId === prog.id" small />
                <i v-else class="bx bx-trash fs-14"></i>
                <span class="d-none d-sm-inline">Hapus</span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import {
  getTemaById,
  attachProgramsToTema,
  deleteProgramFromTema,
} from "@/services/temaService";
import { getAllPrograms } from "@/services/programService";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    temaId: number;
  }>(),
  {
    modelValue: false,
    temaId: 0,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  hide: [];
  updated: [];
}>();

const queryClient = useQueryClient();

const showOffcanvas = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const selectedProgramIdsToAdd = ref<number[]>([]);
const choicesKey = ref(0);
const isDeletingId = ref<number | null>(null);

// ── Fetch Tema Detail ───────────────────────────────────────────────────────
const {
  data: temaData,
  isLoading: isFetchingTema,
  isError: fetchError,
  refetch: refetchTema,
} = useQuery({
  queryKey: computed(() => ["tema-detail", props.temaId]),
  queryFn: () => getTemaById(props.temaId),
  enabled: computed(() => props.modelValue && props.temaId > 0),
});

// ── Fetch All Programs for Dropdown ─────────────────────────────────────────
const { data: allProgramsData, isLoading: isProgramLoading } = useQuery({
  queryKey: ["programs-all"],
  queryFn: () => getAllPrograms({ mode: "list" }),
  enabled: computed(() => props.modelValue),
});

const allPrograms = computed<any[]>(() => allProgramsData.value ?? []);

const attachedPrograms = computed<any[]>(() => {
  if (!temaData.value?.programs) return [];
  return Array.isArray(temaData.value.programs) ? temaData.value.programs : [];
});

const attachedProgramIds = computed<Set<number>>(() => {
  return new Set(attachedPrograms.value.map((p) => Number(p.id)));
});

// Opsi program yang belum terhubung dengan tema ini
const availableProgramOptions = computed(() => {
  return allPrograms.value
    .filter((p: any) => !attachedProgramIds.value.has(Number(p.id)))
    .map((p: any) => ({
      value: String(p.id),
      text: p.title || p.judul,
    }));
});

const temaImageUrl = computed(() => {
  if (!temaData.value?.image) return null;
  if (temaData.value.image.startsWith("http")) {
    return temaData.value.image;
  }
  return `${import.meta.env.VITE_API_BASE_URL}/storage/${temaData.value.image}`;
});

// Reset form saat modal dibuka/ditutup
watch(
  [() => props.modelValue, () => props.temaId],
  ([isOpen]) => {
    if (!isOpen) {
      selectedProgramIdsToAdd.value = [];
      isDeletingId.value = null;
    } else {
      selectedProgramIdsToAdd.value = [];
      choicesKey.value++;
    }
  },
  { immediate: true },
);

watch(
  () => attachedPrograms.value.length,
  () => {
    // Refresh choices options when attached programs list changes
    choicesKey.value++;
  },
);

const handleProgramSelectionChange = (values: string[]) => {
  selectedProgramIdsToAdd.value = values
    .map(Number)
    .filter((id: number) => Number.isFinite(id));
};

// ── Mutation: Attach Program ke Tema ─────────────────────────────────────────
const { mutate: mutateAttach, isPending: isAttachPending } = useMutation({
  mutationFn: () => {
    // Gabungkan program_ids yang sudah ada dengan yang baru ditambahkan
    const existingIds = attachedPrograms.value.map((p: any) => Number(p.id));
    const mergedIds = Array.from(
      new Set([...existingIds, ...selectedProgramIdsToAdd.value]),
    );

    return attachProgramsToTema(props.temaId, {
      program_ids: mergedIds,
    });
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["tema-detail", props.temaId],
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: ["tema"],
      exact: false,
    });

    toast("Program berhasil ditambahkan ke tema", {
      type: "success",
      position: "top-center",
    });

    selectedProgramIdsToAdd.value = [];
    choicesKey.value++;
    emit("updated");
  },
  onError: (err: any) => {
    const msg =
      err?.response?.data?.message || "Gagal menambahkan program ke tema";
    toast(msg, { type: "error", position: "top-center" });
  },
});

const handleAttachPrograms = () => {
  if (selectedProgramIdsToAdd.value.length === 0) {
    toast("Pilih minimal 1 program untuk ditambahkan", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  mutateAttach();
};

// ── Delete Program dari Tema ────────────────────────────────────────────────
const handleDeleteProgram = async (program: any) => {
  const result = await Swal.fire({
    title: "Hapus Program dari Tema?",
    text: `Apakah Anda yakin ingin melepas program "${program.judul}" dari tema ini?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef5f5f",
    cancelButtonColor: "#6c757d",
  });

  if (!result.isConfirmed) return;

  isDeletingId.value = program.id;

  try {
    await deleteProgramFromTema(props.temaId, program.id);

    await queryClient.invalidateQueries({
      queryKey: ["tema-detail", props.temaId],
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: ["tema"],
      exact: false,
    });

    toast(`Program "${program.judul}" berhasil dihapus dari tema`, {
      type: "success",
      position: "top-center",
    });

    choicesKey.value++;
    emit("updated");
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || "Gagal menghapus program dari tema";
    toast(msg, { type: "error", position: "top-center" });
  } finally {
    isDeletingId.value = null;
  }
};
</script>
