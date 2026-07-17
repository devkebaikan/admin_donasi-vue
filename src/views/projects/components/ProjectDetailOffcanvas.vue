<template>
  <b-offcanvas
    v-model="showDetailOffcanvas"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 680px"
    @hide="$emit('hide')"
  >
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-folder-open me-1 text-primary"></i>
          Detail Project
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <div v-if="isDetailLoading" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat detail project...</p>
    </div>

    <div v-else-if="isDetailError" class="alert alert-danger m-0">
      Gagal memuat detail project. Silakan coba lagi.
    </div>

    <div v-else-if="projectDetail" class="pb-4">
      <!-- Banner Image -->
      <div v-if="projectDetail.image_url" class="mb-3">
        <img
          :src="projectDetail.image_url"
          :alt="projectDetail.judul"
          class="w-100 rounded"
          style="max-height: 220px; object-fit: cover"
        />
      </div>

      <!-- Title -->
      <h5 class="fw-bold mb-2">{{ projectDetail.judul }}</h5>

      <!-- Status + Activity + Request Badges -->
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span :class="['badge', statusBadgeClass(projectDetail.status)]">
          {{ projectDetail.status }}
        </span>
        <span :class="['badge', activityBadgeClass(projectDetail.activity)]">
          {{ projectDetail.activity }}
        </span>
        <span
          v-if="projectDetail.request && projectDetail.request !== 'nothing'"
          class="badge bg-info text-dark"
        >
          {{ projectDetail.request }}
        </span>
      </div>

      <!-- button actions -->
      <div class="d-flex gap-2 mb-3">
        <b-button
          variant="soft-primary"
          size="sm"
          class="flex-fill"
          @click="router.push(`/projects/${projectDetail.id}/edit`)"
        >
          <i class="bx bx-edit-alt fs-16 me-1"></i>Edit
        </b-button>
        <b-button
          variant="soft-info"
          size="sm"
          class="flex-fill"
          @click="router.push(`/project-report?project_id=${projectDetail.id}`)"
        >
          <i class="bx bxs-report fs-16 me-1"></i>Report
        </b-button>
      </div>

      <hr class="my-3" />

      <!-- Info Grid -->
      <h6
        class="fw-semibold text-muted mb-2 text-uppercase"
        style="font-size: 11px; letter-spacing: 0.5px"
      >
        <i class="bx bx-info-circle me-1"></i>Informasi Project
      </h6>
      <b-row class="g-2 mb-3">
        <b-col cols="6">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Alasan</small>
            <span class="fw-semibold small">{{
              projectDetail.reason || "-"
            }}</span>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Jumlah PM</small>
            <span class="fw-semibold small">{{
              projectDetail.jumlah_pm || "-"
            }}</span>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Waktu Pelaksanaan</small>
            <span class="fw-semibold small">{{
              formatDate(projectDetail.waktu_pelaksanaan)
            }}</span>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Lokasi</small>
            <a
              v-if="projectDetail.lat && projectDetail.lng"
              :href="`https://maps.google.com/?q=${projectDetail.lat},${projectDetail.lng}`"
              target="_blank"
              rel="noopener noreferrer"
              class="fw-semibold small"
            >
              {{ projectDetail.lat }}, {{ projectDetail.lng }}
              <i class="bx bx-map ms-1"></i>
            </a>
            <span v-else class="small text-muted">-</span>
          </div>
        </b-col>
      </b-row>

      <hr class="my-3" />

      <!-- Financial -->
      <h6
        class="fw-semibold text-muted mb-2 text-uppercase"
        style="font-size: 11px; letter-spacing: 0.5px"
      >
        <i class="bx bx-money me-1"></i>Informasi Keuangan
      </h6>
      <!-- Progress bar -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-muted fw-medium"> Progress Alokasi Dana </small>

          <small class="fw-semibold text-success">
            {{ allocationProgress.toFixed(1) }}%
          </small>
        </div>

        <div class="progress" style="height: 10px">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            :style="{ width: `${allocationProgress}%` }"
            :aria-valuenow="allocationProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">
            {{ formatCurrency(projectDetail.total_alokasi) }}
          </small>

          <small class="text-muted">
            {{ formatCurrency(projectDetail.nominal_acc) }}
          </small>
        </div>
      </div>

      <b-row class="g-2 mb-3">
        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Nominal Diajukan</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.nominal_ajuan) }}
            </span>
          </div>
        </b-col>
        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Nominal Disetujui</small>
            <span class="fw-semibold font-monospace small text-success">
              {{ formatCurrency(projectDetail.nominal_acc) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Claim Donasi</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.claimed_donasi) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Total Alokasi</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_alokasi) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Total Allocated</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_allocated) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Total Disbursed</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_disbursed) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Transfer ke Mitra</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_tf_ke_mitra) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Pemakaian Mitra</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_pakai_mitra) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Refund Mitra</small>
            <span class="fw-semibold font-monospace small">
              {{ formatCurrency(projectDetail.total_refund_mitra) }}
            </span>
          </div>
        </b-col>

        <b-col cols="4">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Sisa Dana Mitra</small>
            <span class="fw-semibold font-monospace small text-primary">
              {{ formatCurrency(projectDetail.sisa_dana_mitra) }}
            </span>
          </div>
        </b-col>
      </b-row>

      <hr class="my-3" />

      <!-- Pengaju -->
      <h6
        class="fw-semibold text-muted mb-2 text-uppercase"
        style="font-size: 11px; letter-spacing: 0.5px"
      >
        <i class="bx bx-user me-1"></i>Pengaju
      </h6>
      <div
        v-if="projectDetail.user"
        class="d-flex align-items-center gap-3 mb-3"
      >
        <div
          class="avatar-sm bg-primary bg-soft rounded-circle d-flex align-items-center justify-content-center"
          style="width: 40px; height: 40px; flex-shrink: 0"
        >
          <i class="bx bx-user fs-20 text-white"></i>
        </div>
        <div>
          <div class="fw-semibold">{{ projectDetail.user.name }}</div>
          <small class="text-muted">
            <i class="bx bx-phone me-1"></i>
            <a
              :href="`https://wa.me/${projectDetail.user.phone}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ projectDetail.user.phone }}
            </a>
          </small>
        </div>
      </div>

      <hr class="my-3" />

      <!-- Mitras -->
      <h6
        class="fw-semibold text-muted mb-2 text-uppercase"
        style="font-size: 11px; letter-spacing: 0.5px"
      >
        <i class="bx bx-buildings me-1"></i>Mitra ({{
          projectDetail.mitras?.length ?? 0
        }})
      </h6>
      <div
        v-if="projectDetail.mitras?.length"
        class="d-flex flex-column gap-2 mb-3"
      >
        <div
          v-for="mitra in projectDetail.mitras"
          :key="mitra.id"
          class="d-flex align-items-center gap-3 bg-light rounded p-2"
        >
          <img
            v-if="mitra.image_url"
            :src="mitra.image_url"
            :alt="mitra.nama"
            class="rounded-circle"
            style="width: 40px; height: 40px; object-fit: cover; flex-shrink: 0"
          />
          <div
            class="avatar-sm bg-secondary bg-soft rounded-circle d-flex align-items-center justify-content-center"
            v-else
            style="width: 40px; height: 40px; flex-shrink: 0"
          >
            <i class="bx bx-buildings fs-18 text-secondary"></i>
          </div>
          <div>
            <div class="fw-semibold small">{{ mitra.nama }}</div>
            <small class="text-muted">
              <a
                :href="`https://wa.me/${mitra.wa}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="bx bxl-whatsapp text-success me-1"></i>{{ mitra.wa }}
              </a>
            </small>
          </div>
        </div>
      </div>
      <p v-else class="text-muted small fst-italic mb-3">
        Tidak ada mitra terkait.
      </p>

      <hr class="my-3" />

      <!-- Programs -->
      <h6
        class="fw-semibold text-muted mb-2 text-uppercase"
        style="font-size: 11px; letter-spacing: 0.5px"
      >
        <i class="bx bx-heart me-1"></i>Program Terkait ({{
          projectDetail.programs?.length ?? 0
        }})
      </h6>
      <div
        v-if="projectDetail.programs?.length"
        class="d-flex flex-column gap-2 mb-3"
      >
        <div
          v-for="program in projectDetail.programs"
          :key="program.id"
          class="d-flex align-items-start gap-3 bg-light rounded p-2"
        >
          <img
            v-if="program.name"
            :src="`https://cdn.aksiberbagi.com/programs/${program.name}`"
            :alt="program.description"
            class="rounded"
            style="width: 56px; height: 42px; object-fit: cover; flex-shrink: 0"
          />
          <div>
            <div class="fw-semibold small">{{ program.description }}</div>
            <small class="text-muted">
              <a
                :href="`https://don.aksiberbagi.com/donasi/${program.slug}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                /{{ program.slug }}
                <i class="bx bx-link-external ms-1"></i>
              </a>
            </small>
          </div>
        </div>
      </div>
      <p v-else class="text-muted small fst-italic mb-3">
        Tidak ada program terkait.
      </p>

      <hr class="my-3" />

      <!-- Dates -->
      <div class="d-flex gap-3 mb-3">
        <div>
          <small class="text-muted d-block">Dibuat</small>
          <small class="fw-semibold">{{
            formatDateTime(projectDetail.created_at)
          }}</small>
        </div>
        <div>
          <small class="text-muted d-block">Diperbarui</small>
          <small class="fw-semibold">{{
            formatDateTime(projectDetail.updated_at)
          }}</small>
        </div>
      </div>

      <hr class="my-3" />
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getProjectById } from "@/services/projectService";
import { formatCurrency, formatDate, formatDateTime } from "@/helpers/format";
import router from "@/router";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    selectedId: number;
  }>(),
  {
    modelValue: false,
    selectedId: 0,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  hide: [];
}>();

const showDetailOffcanvas = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const {
  data: projectDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["project-detail", props.selectedId]),
  queryFn: () => getProjectById(props.selectedId),
  enabled: computed(() => props.selectedId > 0),
});

const allocationProgress = computed(() => {
  if (!projectDetail.value) return 0;

  const nominalAcc = Number(projectDetail.value.nominal_acc ?? 0);
  const totalAlokasi = Number(
    projectDetail.value.total_alokasi === 0
      ? projectDetail.value.total_tf_ke_mitra
      : projectDetail.value.total_alokasi,
  );

  if (nominalAcc <= 0) return 0;

  return Math.min((totalAlokasi / nominalAcc) * 100, 100);
});

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-secondary",
  diajukan: "bg-warning text-dark",
  diterima: "bg-success",
  ditolak: "bg-danger",
};

const ACTIVITY_BADGE: Record<string, string> = {
  inactive: "bg-secondary",
  "active open": "bg-success",
  "active close": "bg-secondary",
  selesai: "bg-primary",
};

const statusBadgeClass = (status: string) =>
  STATUS_BADGE[status] ?? "bg-secondary";
const activityBadgeClass = (activity: string) =>
  ACTIVITY_BADGE[activity] ?? "bg-secondary";
</script>
