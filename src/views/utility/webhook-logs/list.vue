<template>
  <VerticalLayout>
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter</h5>
          <b-button
            v-if="hasActiveFilters"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>Reset Filter
          </b-button>
        </div>
      </template>
      <b-row>
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Source</label>
          <b-form-select v-model="source" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Source</b-form-select-option>
            </template>
            <b-form-select-option v-for="s in sourceOptions" :key="s" :value="s">
              {{ s }}
            </b-form-select-option>
          </b-form-select>
        </b-col>
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Event</label>
          <b-form-input
            v-model="event"
            placeholder="e.g., midtrans_settlement"
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>
      </b-row>
    </b-card>

    <b-row>
      <b-col>
        <UIComponentCard id="webhook-logs" title="Webhook Logs">
          <div v-if="isCanManage" class="d-flex justify-content-end mb-3">
            <b-button variant="outline-danger" size="sm" @click="openCleanupModal">
              <i class="bx bx-trash me-1"></i>Bersihkan Log Lama
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data webhook log...</p>
          </div>
          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data webhook log.
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Source</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.id">
                    <td class="small">{{ formatDate(item.created_at || item.processed_at) }}</td>
                    <td><span class="fw-semibold">{{ item.source }}</span></td>
                    <td class="small text-muted">{{ item.event }}</td>
                    <td>
                      <span :class="['badge', item.is_success ? 'bg-success' : 'bg-danger']">
                        {{ item.is_success ? "Sukses" : "Gagal" }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div class="d-flex gap-2 justify-content-center">
                        <button
                          class="btn btn-sm btn-soft-info"
                          title="Detail"
                          @click="openDetail(item.id)"
                        >
                          <i class="bx bx-show fs-16"></i>
                        </button>
                        <button
                          v-if="isCanResend"
                          class="btn btn-sm btn-soft-primary"
                          title="Resend"
                          @click="confirmResend(item.id)"
                        >
                          <i class="bx bx-repost fs-16"></i>
                        </button>
                        <button
                          v-if="isCanDelete"
                          class="btn btn-sm btn-soft-danger"
                          title="Hapus"
                          @click="confirmDelete(item.id)"
                        >
                          <i class="bx bx-trash fs-16"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="items.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">Tidak ada data.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">Total: {{ total }} webhook log</div>
              <div class="d-flex gap-2">
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  :disabled="offset === 0"
                  @click="prevPage"
                >
                  Sebelumnya
                </b-button>
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  :disabled="offset + limit >= total"
                  @click="nextPage"
                >
                  Selanjutnya
                </b-button>
              </div>
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted"><b-spinner small class="me-1" />Memperbarui...</small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>

    <LogDetailModal
      v-model="showDetailModal"
      :log="selectedLog"
      :is-loading="isLoadingDetail"
      :can-resend="isCanResend"
      :is-resending="isResending"
      @resend="handleResendConfirmed"
    />

    <b-modal v-model="showCleanupModal" title="Bersihkan Log Lama" @ok="handleCleanupConfirmed">
      <p>Hapus semua webhook log sebelum tanggal:</p>
      <b-form-input v-model="cleanupBeforeDate" type="date" />
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import LogDetailModal from "@/components/LogDetailModal.vue";
import {
  getAllWebhookLogs,
  getWebhookLogById,
  deleteWebhookLog,
  resendWebhookLog,
  cleanupWebhookLogs,
} from "@/services/webhookLogService";
import { hasPermission } from "@/helpers/permission";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const isCanManage = hasPermission("utility:manage");
const isCanResend = hasPermission("utility:manage");
const isCanDelete = hasPermission("utility:delete");

const sourceOptions = ["whacaster", "midtrans", "mesin_otomatis", "erp", "xendit", "flip"];

const source = ref("");
const event = ref("");
const offset = ref(0);
const limit = ref(20);

const hasActiveFilters = computed(() => !!(source.value || event.value));
const clearFilters = () => {
  source.value = "";
  event.value = "";
  resetPage();
};
const resetPage = () => (offset.value = 0);
const nextPage = () => (offset.value += limit.value);
const prevPage = () => (offset.value = Math.max(0, offset.value - limit.value));

const queryParams = computed(() => ({
  source: source.value || undefined,
  event: event.value || undefined,
  limit: limit.value,
  offset: offset.value,
}));

const { data, isLoading, isError, isFetching } = useQuery({
  queryKey: ["webhook-logs", queryParams],
  queryFn: () => getAllWebhookLogs(queryParams.value),
});

const items = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta?.total ?? 0);

const formatDate = (value: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });
};

// ── Detail ─────────────────────────────────────────────────────────────────
const showDetailModal = ref(false);
const selectedLog = ref<any>(null);
const isLoadingDetail = ref(false);

const openDetail = async (id: number) => {
  showDetailModal.value = true;
  isLoadingDetail.value = true;
  selectedLog.value = null;
  try {
    selectedLog.value = await getWebhookLogById(id);
  } catch {
    showToast("Gagal memuat detail webhook log", { type: "error", position: "top-center" });
    showDetailModal.value = false;
  } finally {
    isLoadingDetail.value = false;
  }
};

// ── Resend ─────────────────────────────────────────────────────────────────
const isResending = ref(false);
const { mutate: resendMutate } = useMutation({
  mutationFn: (id: number) => resendWebhookLog(id),
  onMutate: () => {
    isResending.value = true;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    showToast("Webhook berhasil di-resend", { type: "success", position: "top-center" });
    showDetailModal.value = false;
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal resend webhook";
    showToast(msg, { type: "error", position: "top-center" });
  },
  onSettled: () => {
    isResending.value = false;
  },
});

const confirmResend = (id: number) => {
  if (confirm("Resend webhook ini melalui pipeline pemrosesan yang sama?")) {
    resendMutate(id);
  }
};
const handleResendConfirmed = (id: number) => resendMutate(id);

// ── Delete ─────────────────────────────────────────────────────────────────
const { mutate: deleteMutate } = useMutation({
  mutationFn: (id: number) => deleteWebhookLog(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    showToast("Webhook log berhasil dihapus", { type: "success", position: "top-center" });
  },
  onError: () => {
    showToast("Gagal menghapus webhook log", { type: "error", position: "top-center" });
  },
});

const confirmDelete = (id: number) => {
  if (confirm("Hapus webhook log ini? Tindakan tidak bisa dibatalkan.")) {
    deleteMutate(id);
  }
};

// ── Cleanup ────────────────────────────────────────────────────────────────
const showCleanupModal = ref(false);
const cleanupBeforeDate = ref("");

const openCleanupModal = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  cleanupBeforeDate.value = d.toISOString().slice(0, 10);
  showCleanupModal.value = true;
};

const handleCleanupConfirmed = async () => {
  if (!cleanupBeforeDate.value) return;
  try {
    const result = await cleanupWebhookLogs(cleanupBeforeDate.value);
    queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    showToast(`${result.deleted_count} webhook log berhasil dihapus`, {
      type: "success",
      position: "top-center",
    });
  } catch {
    showToast("Gagal membersihkan webhook log", { type: "error", position: "top-center" });
  }
};
</script>