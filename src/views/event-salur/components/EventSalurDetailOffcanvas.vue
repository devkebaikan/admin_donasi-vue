<template>
  <b-offcanvas
    v-model="showOffcanvas"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 800px"
    @hide="$emit('hide')"
  >
    <!-- Header -->
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-calendar-event me-1 text-primary"></i>
          Detail Event Salur
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isFetchingEvent" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat data event salur...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="alert alert-danger m-3">
      <div class="d-flex align-items-center justify-content-between">
        <span>Gagal memuat detail event salur.</span>
        <b-button size="sm" variant="outline-danger" @click="refetchEvent">
          <i class="bx bx-refresh me-1"></i>Coba Lagi
        </b-button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="eventSalurData" class="pb-4">
      <!-- Info Header Event Salur -->
      <div class="p-3 bg-light rounded border mb-4">
        <div class="d-flex gap-3 align-items-start mb-3">
          <img
            v-if="eventImageUrl"
            :src="eventImageUrl"
            :alt="eventSalurData.judul"
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
            <h5 class="fw-bold mb-1 text-truncate">
              {{ eventSalurData.judul }}
            </h5>
            <div class="d-flex flex-wrap gap-2 align-items-center mb-1">
              <span class="badge bg-secondary font-monospace">
                slug: {{ eventSalurData.slug }}
              </span>
              <span
                :class="[
                  'badge',
                  eventSalurData.status === 'PUBLISH'
                    ? 'bg-success'
                    : eventSalurData.status === 'DRAFT'
                      ? 'bg-warning'
                      : 'bg-secondary',
                ]"
              >
                {{ eventSalurData.status }}
              </span>
            </div>
            <div
              v-if="
                eventSalurData.tanggal_mulai || eventSalurData.tanggal_selesai
              "
              class="text-muted small d-flex align-items-center gap-1 mt-1"
            >
              <i class="bx bx-calendar"></i>
              <span>
                {{ formatDate(eventSalurData.tanggal_mulai) }} —
                {{ formatDate(eventSalurData.tanggal_selesai) }}
              </span>
            </div>
          </div>
        </div>

        <p
          v-if="eventSalurData.description"
          class="text-muted small mb-3 border-top pt-2"
        >
          {{ eventSalurData.description }}
        </p>

        <!-- Stats Counter -->
        <div class="row g-2 text-center pt-1 border-top">
          <div class="col-4">
            <div class="p-2 bg-white rounded border">
              <small class="text-muted d-block" style="font-size: 11px"
                >Project</small
              >
              <strong class="fs-15 text-primary">
                {{ attachedProjects.length }}
              </strong>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 bg-white rounded border">
              <small class="text-muted d-block" style="font-size: 11px"
                >Program</small
              >
              <strong class="fs-15 text-info">
                {{ eventSalurData.stats?.programs_count ?? totalProgramsCount }}
              </strong>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 bg-white rounded border">
              <small class="text-muted d-block" style="font-size: 11px"
                >Terkumpul</small
              >
              <strong class="fs-14 text-success font-monospace">
                {{ formatCurrency(eventSalurData.stats?.terkumpul_total ?? 0) }}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Tambah Project ke Event Salur -->
      <div class="card border mb-4">
        <div class="card-header bg-soft-primary py-2">
          <h6
            class="card-title mb-0 fs-14 fw-semibold text-primary d-flex align-items-center"
          >
            <i class="bx bx-plus-circle me-1 fs-16"></i>
            Tambah Project ke Event Salur
          </h6>
        </div>
        <div class="card-body p-3">
          <p class="text-muted small mb-3">
            Cari dan pilih project untuk ditautkan ke event
            <strong>{{ eventSalurData.judul }}</strong
            >.
          </p>

          <div class="mb-3">
            <label class="form-label text-muted small fw-semibold"
              >Pilih Project *</label
            >
            <SearchSelect
              :id="`event-salur-project-search-${eventSalurId}`"
              :modelValue="String(selectedProjectId || 0)"
              @update:modelValue="
                (val) => {
                  selectedProjectId = val === '0' ? '' : Number(val);
                }
              "
              @search="
                (query: string) => {
                  projectSearchQuery = query;
                }
              "
              :options="filteredProjectOptions"
              :isLoading="isProjectLoading"
            />
            <small class="text-muted d-block mt-1">
              Ketik minimal 3 karakter untuk mencari project.
            </small>
          </div>

          <div class="d-flex justify-content-end">
            <b-button
              variant="success"
              size="sm"
              :disabled="isAttachPending || !selectedProjectId"
              @click="handleAttachProject"
            >
              <b-spinner v-if="isAttachPending" small class="me-1" />
              <i v-else class="bx bx-plus me-1"></i>
              Tambahkan Project
            </b-button>
          </div>
        </div>
      </div>

      <!-- Section: Daftar Project Terkait -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6
          class="fw-semibold text-uppercase text-muted mb-0"
          style="font-size: 12px; letter-spacing: 0.5px"
        >
          <i class="bx bx-list-ul me-1"></i>
          Daftar Project Terkait
          <span class="badge bg-primary ms-1">{{
            attachedProjects.length
          }}</span>
        </h6>
      </div>

      <!-- Empty State -->
      <div
        v-if="attachedProjects.length === 0"
        class="text-center py-4 px-3 border rounded bg-light"
      >
        <i class="bx bx-folder-open fs-36 text-muted mb-2 d-block"></i>
        <h6 class="fw-semibold text-muted mb-1">Belum Ada Project</h6>
        <p class="text-muted small mb-0">
          Event salur ini belum memiliki project terkait. Gunakan form pencarian
          di atas untuk menambahkan project.
        </p>
      </div>

      <!-- List Cards Project -->
      <div v-else class="d-flex flex-column gap-3">
        <div
          v-for="project in attachedProjects"
          :key="project.id"
          class="p-3 rounded border bg-white shadow-sm"
        >
          <div class="d-flex gap-3 align-items-start">
            <!-- Thumbnail Project -->
            <img
              v-if="project.image"
              :src="getProjectImageUrl(project.image)"
              :alt="project.judul"
              class="rounded border"
              style="
                width: 64px;
                height: 64px;
                object-fit: cover;
                flex-shrink: 0;
              "
              onerror="this.style.display = 'none'"
            />
            <div
              v-else
              class="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
              style="width: 64px; height: 64px; flex-shrink: 0"
            >
              <i class="bx bx-folder fs-24"></i>
            </div>

            <!-- Project Info -->
            <div class="flex-grow-1 min-w-0">
              <h6 class="fw-bold mb-1 fs-14 text-wrap">{{ project.judul }}</h6>

              <div class="d-flex flex-wrap gap-1 align-items-center mb-2">
                <span
                  v-if="project.status"
                  :class="['badge', projectStatusBadge(project.status)]"
                >
                  {{ project.status }}
                </span>
                <span
                  v-if="project.activity"
                  :class="['badge', projectActivityBadge(project.activity)]"
                >
                  {{ project.activity }}
                </span>
                <span
                  v-if="project.waktu_pelaksanaan"
                  class="badge bg-light text-muted border"
                >
                  <i class="bx bx-time me-1"></i
                  >{{ formatDate(project.waktu_pelaksanaan) }}
                </span>
              </div>

              <!-- Nominal Ajuan & ACC -->
              <div class="row g-1 small mb-2 text-muted">
                <div v-if="project.nominal_ajuan" class="col-sm-6">
                  <span>Ajuan: </span>
                  <strong class="text-dark">{{
                    formatCurrency(project.nominal_ajuan)
                  }}</strong>
                </div>
                <div v-if="project.nominal_acc" class="col-sm-6">
                  <span>Acc: </span>
                  <strong class="text-success">{{
                    formatCurrency(project.nominal_acc)
                  }}</strong>
                </div>
              </div>

              <!-- Program Terkait -->
              <div
                v-if="project.programs && project.programs.length > 0"
                class="bg-light p-2 rounded border small"
              >
                <div
                  class="text-muted fw-semibold mb-1"
                  style="font-size: 11px"
                >
                  <i class="bx bx-donate-heart me-1"></i>Program:
                </div>
                <div
                  v-for="prog in project.programs"
                  :key="prog.id"
                  class="text-truncate text-muted"
                >
                  • {{ prog.judul }}
                  <span v-if="prog.mitra?.name" class="text-primary small">
                    ({{ prog.mitra.name }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Tombol Hapus Project dari Event Salur -->
            <div class="flex-shrink-0">
              <b-button
                variant="outline-danger"
                size="sm"
                class="d-flex align-items-center gap-1"
                title="Hapus project dari event salur ini"
                :disabled="isDeletingId === project.id"
                @click="handleDeleteProject(project)"
              >
                <b-spinner v-if="isDeletingId === project.id" small />
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
import SearchSelect from "@/components/SearchSelect.vue";
import { useSearchSelect } from "@/composables/useSearchSelect";
import {
  getEventSalurById,
  attachProjectsToEventSalur,
  deleteProjectFromEventSalur,
} from "@/services/eventSalurService";
import { getProjects } from "@/services/projectService";
import { formatCurrency, formatDate } from "@/helpers/format";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    eventSalurId: number;
  }>(),
  {
    modelValue: false,
    eventSalurId: 0,
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

const selectedProjectId = ref<number | string>("");
const isDeletingId = ref<number | null>(null);

// ── Fetch Event Salur Detail ────────────────────────────────────────────────
const {
  data: eventSalurData,
  isLoading: isFetchingEvent,
  isError: fetchError,
  refetch: refetchEvent,
} = useQuery({
  queryKey: computed(() => ["event-salur-detail", props.eventSalurId]),
  queryFn: () => getEventSalurById(props.eventSalurId),
  enabled: computed(() => props.modelValue && props.eventSalurId > 0),
});

const attachedProjects = computed<any[]>(() => {
  if (!eventSalurData.value?.projects) return [];
  return Array.isArray(eventSalurData.value.projects)
    ? eventSalurData.value.projects
    : [];
});

const attachedProjectIds = computed<Set<number>>(() => {
  return new Set(attachedProjects.value.map((p) => Number(p.id)));
});

const totalProgramsCount = computed(() => {
  return attachedProjects.value.reduce((acc, p) => {
    return acc + (Array.isArray(p.programs) ? p.programs.length : 0);
  }, 0);
});

const eventImageUrl = computed(() => {
  if (!eventSalurData.value?.image) return null;
  if (eventSalurData.value.image.startsWith("http")) {
    return eventSalurData.value.image;
  }
  return `${import.meta.env.VITE_API_BASE_URL}/storage/${eventSalurData.value.image}`;
});

const getProjectImageUrl = (image: string) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_BASE_URL}/storage/${image}`;
};

// ── SearchSelect untuk Project ──────────────────────────────────────────────
const {
  searchQuery: projectSearchQuery,
  options: rawProjectOptions,
  isLoading: isProjectLoading,
} = useSearchSelect({
  queryKey: "event-salur-projects-search",
  fetchFn: getProjects,
  optionsMapper: (project: any) => ({
    value: project.id,
    text: project.judul,
  }),
  placeholder: "Cari judul project...",
  limit: 10,
});

// Filter opsi agar project yang sudah terhubung tidak muncul di dropdown
const filteredProjectOptions = computed(() => {
  return (rawProjectOptions.value ?? []).filter((opt: any) => {
    return opt.value === 0 || !attachedProjectIds.value.has(Number(opt.value));
  });
});

// Reset selection saat offcanvas buka/tutup
watch(
  [() => props.modelValue, () => props.eventSalurId],
  ([isOpen]) => {
    if (!isOpen) {
      selectedProjectId.value = "";
      isDeletingId.value = null;
    } else {
      selectedProjectId.value = "";
    }
  },
  { immediate: true },
);

// ── Status Badges ───────────────────────────────────────────────────────────
const projectStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    draft: "bg-secondary",
    diajukan: "bg-warning text-dark",
    diterima: "bg-success",
    ditolak: "bg-danger",
  };
  return map[status?.toLowerCase()] ?? "bg-light text-dark";
};

const projectActivityBadge = (activity: string) => {
  const map: Record<string, string> = {
    "active open": "bg-success",
    "active close": "bg-info text-dark",
    inactive: "bg-warning text-dark",
    selesai: "bg-secondary",
  };
  return map[activity?.toLowerCase()] ?? "bg-light text-dark";
};

// ── Mutation: Attach Project ke Event Salur ─────────────────────────────────
const { mutate: mutateAttach, isPending: isAttachPending } = useMutation({
  mutationFn: () => {
    const existingIds = attachedProjects.value.map((p: any) => Number(p.id));
    const mergedIds = Array.from(
      new Set([...existingIds, Number(selectedProjectId.value)]),
    );

    return attachProjectsToEventSalur(props.eventSalurId, {
      project_ids: mergedIds,
    });
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["event-salur-detail", props.eventSalurId],
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: ["event-salur"],
      exact: false,
    });

    toast("Project berhasil ditambahkan ke event salur", {
      type: "success",
      position: "top-center",
    });

    selectedProjectId.value = "";
    emit("updated");
  },
  onError: (err: any) => {
    const msg =
      err?.response?.data?.message ||
      "Gagal menambahkan project ke event salur";
    toast(msg, { type: "error", position: "top-center" });
  },
});

const handleAttachProject = () => {
  if (!selectedProjectId.value) {
    toast("Pilih project terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  mutateAttach();
};

// ── Delete Project dari Event Salur ─────────────────────────────────────────
const handleDeleteProject = async (project: any) => {
  const result = await Swal.fire({
    title: "Hapus Project dari Event?",
    text: `Apakah Anda yakin ingin melepas project "${project.judul}" dari event salur ini?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef5f5f",
    cancelButtonColor: "#6c757d",
  });

  if (!result.isConfirmed) return;

  isDeletingId.value = project.id;

  try {
    await deleteProjectFromEventSalur(props.eventSalurId, project.id);

    await queryClient.invalidateQueries({
      queryKey: ["event-salur-detail", props.eventSalurId],
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: ["event-salur"],
      exact: false,
    });

    toast(`Project "${project.judul}" berhasil dihapus dari event salur`, {
      type: "success",
      position: "top-center",
    });

    emit("updated");
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      "Gagal menghapus project dari event salur";
    toast(msg, { type: "error", position: "top-center" });
  } finally {
    isDeletingId.value = null;
  }
};
</script>
