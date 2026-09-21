<template>
  <VerticalLayout>
    <!-- Filter Section -->
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
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari service, endpoint, reference..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Service</label>
          <b-form-input
            v-model="selectedService"
            type="text"
            placeholder="e.g., midtrans, whacaster..."
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsSuccess" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua</b-form-select-option>
            </template>
            <b-form-select-option value="true">Sukses</b-form-select-option>
            <b-form-select-option value="false">Gagal</b-form-select-option>
          </b-form-select>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="third-party-logs" title="Third Party Logs">
          <div v-if="isCanManage" class="d-flex justify-content-end mb-3">
            <b-button variant="outline-danger" size="sm" @click="openCleanupModal">
              <i class="bx bx-trash me-1"></i>Bersihkan Log Lama
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data log...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data log: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="hasActiveFilters"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
            >
              <span class="text-muted small">Active filters:</span>

              <b-badge
                v-if="selectedService"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Service: {{ selectedService }}
                <i class="bx bx-x cursor-pointer" @click="selectedService = ''"></i>
              </b-badge>

              <b-badge
                v-if="selectedIsSuccess !== ''"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Status: {{ selectedIsSuccess === "true" ? "Sukses" : "Gagal" }}
                <i class="bx bx-x cursor-pointer" @click="selectedIsSuccess = ''"></i>
              </b-badge>

              <b-badge
                v-if="searchQuery"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Search: "{{ searchQuery }}"
                <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
              </b-badge>
            </div>

            <GridJsTable
              id="table-third-party-logs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }} log)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
                align="right"
              />
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted">
                <b-spinner small class="me-1" />Memperbarui...
              </small>
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
      <p>Hapus semua third party log sebelum tanggal:</p>
      <b-form-input v-model="cleanupBeforeDate" type="date" />
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import LogDetailModal from "@/components/LogDetailModal.vue";
import { useThirdPartyLogTable } from "../components/data";
import {
  getThirdPartyLogById,
  resendThirdPartyLog,
  cleanupThirdPartyLogs,
} from "@/services/thirdPartyLogService";
import { hasPermission } from "@/helpers/permission";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const isCanManage = hasPermission("utility:manage");
const isCanResend = hasPermission("utility:manage");

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedService,
  selectedIsSuccess,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useThirdPartyLogTable();

const hasActiveFilters = computed(
  () => !!(selectedService.value || selectedIsSuccess.value || searchQuery.value),
);

const clearFilters = () => {
  selectedService.value = "";
  selectedIsSuccess.value = "";
  searchQuery.value = "";
  resetPage();
};

// ── Detail modal ───────────────────────────────────────────────────────────
const showDetailModal = ref(false);
const selectedLog = ref<any>(null);
const isLoadingDetail = ref(false);

const openDetail = async (id: number) => {
  showDetailModal.value = true;
  isLoadingDetail.value = true;
  selectedLog.value = null;
  try {
    selectedLog.value = await getThirdPartyLogById(id);
  } catch {
    showToast("Gagal memuat detail log", { type: "error", position: "top-center" });
    showDetailModal.value = false;
  } finally {
    isLoadingDetail.value = false;
  }
};

// ── Resend ─────────────────────────────────────────────────────────────────
const isResending = ref(false);

const { mutate: resendMutate } = useMutation({
  mutationFn: (id: number) => resendThirdPartyLog(id),
  onMutate: () => {
    isResending.value = true;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["third-party-logs"] });
    showToast("Request berhasil di-resend", { type: "success", position: "top-center" });
    if (showDetailModal.value) selectedLog.value = data;
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal resend request";
    showToast(msg, { type: "error", position: "top-center" });
  },
  onSettled: () => {
    isResending.value = false;
  },
});

const handleResendConfirmed = (id: number) => resendMutate(id);

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
    const result = await cleanupThirdPartyLogs(cleanupBeforeDate.value);
    queryClient.invalidateQueries({ queryKey: ["third-party-logs"] });
    showToast(`${result.deleted_count} log berhasil dihapus`, {
      type: "success",
      position: "top-center",
    });
  } catch {
    showToast("Gagal membersihkan log", { type: "error", position: "top-center" });
  }
};

// ── Delegated click handling for table actions ─────────────────────────────
const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const detailBtn = target.closest<HTMLElement>(
    '#table-third-party-logs .detail-btn[data-action="detail"]',
  );
  const resendBtn = target.closest<HTMLElement>(
    '#table-third-party-logs .resend-btn[data-action="resend"]',
  );
  const deleteBtn = target.closest<HTMLElement>(
    '#table-third-party-logs .delete-btn[data-action="delete"]',
  );

  if (detailBtn) {
    const id = detailBtn.getAttribute("data-id");
    if (id) openDetail(Number(id));
  }
  if (resendBtn) {
    const id = resendBtn.getAttribute("data-id");
    if (id && confirm("Resend request ini ke third party?")) resendMutate(Number(id));
  }
  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>