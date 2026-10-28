<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter Antrian Whacaster</h5>
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

      <b-row class="g-3">
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="status" @change="resetPage">
            <b-form-select-option value="all">Semua Status</b-form-select-option>
            <b-form-select-option value="pending">Pending</b-form-select-option>
            <b-form-select-option value="processing">Processing</b-form-select-option>
            <b-form-select-option value="sent">Sent</b-form-select-option>
            <b-form-select-option value="failed">Failed</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Jumlah per Halaman</label>
          <b-form-select v-model="limit" @change="resetPage">
            <b-form-select-option :value="10">10</b-form-select-option>
            <b-form-select-option :value="25">25</b-form-select-option>
            <b-form-select-option :value="50">50</b-form-select-option>
            <b-form-select-option :value="100">100</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="4" class="d-flex align-items-end">
          <b-button variant="outline-primary" class="w-100" @click="() => refetch()">
            <i class="bx bx-refresh me-1"></i> Refresh Data
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table Section -->
    <b-row>
      <b-col>
        <UIComponentCard id="whacaster-queue" title="Whacaster Queue">
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2 text-muted">Memuat data queue...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data queue. Silakan coba beberapa saat lagi.
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px">No</th>
                    <th style="width: 150px">Waktu</th>
                    <th style="width: 140px">Nomor HP</th>
                    <th style="width: 110px">Status</th>
                    <th>Pesan</th>
                    <th style="width: 120px">Info Tambahan</th>
                    <th style="width: 70px" class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in queueList" :key="item.id">
                    <td class="small text-muted">{{ offset + index + 1 }}</td>
                    <td class="small">
                      <div>{{ formatDateTime(item.created_at) }}</div>
                      <small class="text-muted font-monospace" style="font-size: 10px">{{ item.id }}</small>
                    </td>
                    <td>
                      <a
                        :href="`https://wa.me/${cleanPhone(item.phone)}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-decoration-none fw-semibold text-success small"
                      >
                        <i class="bx bxl-whatsapp me-1"></i>{{ item.phone }}
                      </a>
                    </td>
                    <td>
                      <span :class="['badge', getStatusBadge(item.status)]">
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <div
                        class="text-truncate"
                        style="max-width: 380px; white-space: pre-wrap; font-size: 12px; max-height: 54px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
                        :title="item.message"
                      >
                        {{ item.message }}
                      </div>
                    </td>
                    <td class="small">
                      <div v-if="item.attempts != null">
                        <span class="text-muted">Percobaan:</span> <strong>{{ item.attempts }}</strong>
                      </div>
                      <div v-if="item.provider_message_id" class="text-truncate font-monospace text-muted" style="max-width: 120px;" :title="item.provider_message_id">
                        ID: {{ item.provider_message_id }}
                      </div>
                      <div v-if="item.error" class="text-danger text-truncate" style="max-width: 120px;" :title="item.error">
                        {{ item.error }}
                      </div>
                    </td>
                    <td class="text-center">
                      <b-button
                        size="sm"
                        variant="soft-info"
                        title="Lihat Detail Pesan"
                        @click="openDetail(item)"
                      >
                        <i class="bx bx-show fs-16"></i>
                      </b-button>
                    </td>
                  </tr>

                  <tr v-if="queueList.length === 0">
                    <td colspan="7" class="text-center text-muted py-4">
                      Tidak ada antrian pesan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <div class="text-muted small">
                Menampilkan {{ queueList.length > 0 ? offset + 1 : 0 }} - {{ Math.min(offset + limit, total) }} dari total {{ total }} antrian
              </div>

              <div class="d-flex gap-2">
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  :disabled="offset === 0 || isFetching"
                  @click="prevPage"
                >
                  <i class="bx bx-chevron-left me-1"></i>Sebelumnya
                </b-button>
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  :disabled="offset + limit >= total || isFetching"
                  @click="nextPage"
                >
                  Selanjutnya<i class="bx bx-chevron-right ms-1"></i>
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

    <!-- Detail Modal -->
    <b-modal
      v-model="showDetailModal"
      title="Detail Antrian Whacaster"
      size="lg"
      hide-footer
    >
      <div v-if="selectedItem">
        <b-row class="mb-3 gy-2">
          <b-col md="6">
            <span class="text-muted d-block small">ID Antrian</span>
            <span class="font-monospace small">{{ selectedItem.id }}</span>
          </b-col>
          <b-col md="6">
            <span class="text-muted d-block small">Waktu Dibuat</span>
            <span class="small">{{ formatDateTime(selectedItem.created_at) }}</span>
          </b-col>
          <b-col md="6">
            <span class="text-muted d-block small">Nomor Tujuan</span>
            <a
              :href="`https://wa.me/${cleanPhone(selectedItem.phone)}`"
              target="_blank"
              class="fw-semibold text-success small"
            >
              <i class="bx bxl-whatsapp me-1"></i>{{ selectedItem.phone }}
            </a>
          </b-col>
          <b-col md="6">
            <span class="text-muted d-block small">Status</span>
            <span :class="['badge', getStatusBadge(selectedItem.status)]">
              {{ selectedItem.status }}
            </span>
          </b-col>
          <b-col md="6" v-if="selectedItem.attempts != null">
            <span class="text-muted d-block small">Jumlah Percobaan</span>
            <span class="small">{{ selectedItem.attempts }}</span>
          </b-col>
          <b-col md="6" v-if="selectedItem.provider_message_id">
            <span class="text-muted d-block small">Provider Message ID</span>
            <span class="font-monospace small">{{ selectedItem.provider_message_id }}</span>
          </b-col>
          <b-col md="12" v-if="selectedItem.error">
            <div class="alert alert-danger py-2 mt-2 mb-0 small">
              <strong>Error:</strong> {{ selectedItem.error }}
            </div>
          </b-col>
        </b-row>

        <label class="form-label fw-semibold">Isi Pesan WhatsApp</label>
        <div class="p-3 bg-light rounded border" style="white-space: pre-wrap; font-size: 13px; line-height: 1.6; max-height: 350px; overflow-y: auto;">
          {{ selectedItem.message }}
        </div>
      </div>
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import {
  getWhacasterQueue,
  type WhacasterQueueItem,
} from "@/services/activityLogService";
import { formatDateTime } from "@/helpers/format";

const status = ref("all");
const limit = ref(25);
const offset = ref(0);

const selectedItem = ref<WhacasterQueueItem | null>(null);
const showDetailModal = ref(false);

const hasActiveFilters = computed(() => status.value !== "all");

const clearFilters = () => {
  status.value = "all";
  resetPage();
};

const resetPage = () => {
  offset.value = 0;
};

const prevPage = () => {
  offset.value = Math.max(0, offset.value - limit.value);
};

const nextPage = () => {
  offset.value += limit.value;
};

const { data, isLoading, isError, isFetching, refetch } = useQuery({
  queryKey: computed(() => ["whacaster-queue", status.value, limit.value, offset.value]),
  queryFn: () =>
    getWhacasterQueue({
      status: status.value,
      limit: limit.value,
      offset: offset.value,
    }),
});

const queueList = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta?.total ?? 0);

const cleanPhone = (phone: string) => {
  if (!phone) return "";
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) {
    p = "62" + p.slice(1);
  }
  return p;
};

const getStatusBadge = (st: string) => {
  switch (st) {
    case "sent":
      return "bg-success";
    case "failed":
      return "bg-danger";
    case "processing":
      return "bg-info";
    case "pending":
      return "bg-warning text-dark";
    default:
      return "bg-secondary";
  }
};

const openDetail = (item: WhacasterQueueItem) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};
</script>

