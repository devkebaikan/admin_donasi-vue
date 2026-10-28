<template>
  <VerticalLayout>
    <!-- Filter Section -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter Activity Logs</h5>
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
          <label class="form-label fw-semibold">Pencarian</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari tabel, endpoint, error..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Action</label>
          <b-form-select v-model="selectedAction" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Action</b-form-select-option>
            </template>
            <b-form-select-option value="create">create</b-form-select-option>
            <b-form-select-option value="update">update</b-form-select-option>
            <b-form-select-option value="delete">delete</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Nama Tabel</label>
          <b-form-input
            v-model="selectedTable"
            placeholder="e.g. program_kegiatan"
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsSuccess" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Status</b-form-select-option>
            </template>
            <b-form-select-option value="true">Sukses</b-form-select-option>
            <b-form-select-option value="false">Gagal</b-form-select-option>
          </b-form-select>
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">User ID</label>
          <b-form-input
            v-model="selectedUserId"
            type="number"
            placeholder="Filter User ID..."
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Record ID</label>
          <b-form-input
            v-model="selectedRecordId"
            type="number"
            placeholder="Filter Record ID..."
            debounce="500"
            @update:model-value="resetPage"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Dari Tanggal</label>
          <b-form-input v-model="dateFrom" type="date" @change="resetPage" />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Sampai Tanggal</label>
          <b-form-input v-model="dateTo" type="date" @change="resetPage" />
        </b-col>
      </b-row>
    </b-card>

    <!-- Table Section -->
    <b-row>
      <b-col>
        <UIComponentCard id="activity-logs" title="Activity Logs">
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2 text-muted">Memuat activity log...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat activity log. Silakan coba beberapa saat lagi.
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px">No</th>
                    <th style="width: 140px">Waktu</th>
                    <th style="width: 100px">User</th>
                    <th style="width: 90px">Action</th>
                    <th>Tabel & Record</th>
                    <th>Endpoint</th>
                    <th style="width: 80px">Status</th>
                    <th style="width: 80px">Durasi</th>
                    <th style="width: 70px" class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in logList" :key="item.id">
                    <td class="small text-muted">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td class="small">
                      <div>{{ formatDateTime(item.created_at) }}</div>
                      <small class="text-muted font-monospace" style="font-size: 11px">#{{ item.id }}</small>
                    </td>
                    <td>
                      <span v-if="item.user_id" class="badge bg-secondary">
                        UID: {{ item.user_id }}
                      </span>
                      <span v-else class="text-muted small">System / Guest</span>
                    </td>
                    <td>
                      <span :class="['badge', getActionBadge(item.action)]">
                        {{ item.action }}
                      </span>
                    </td>
                    <td>
                      <div class="fw-semibold small font-monospace text-primary">
                        {{ item.table_name || "-" }}
                      </div>
                      <small v-if="item.record_id" class="text-muted">
                        Record ID: <strong>{{ item.record_id }}</strong>
                      </small>
                    </td>
                    <td class="small">
                      <div class="d-flex align-items-center gap-1">
                        <span v-if="item.method" :class="['badge badge-sm', getMethodBadge(item.method)]">
                          {{ item.method }}
                        </span>
                        <span class="text-truncate d-inline-block font-monospace" style="max-width: 220px;" :title="item.endpoint">
                          {{ item.endpoint || "-" }}
                        </span>
                      </div>
                      <div v-if="item.ip_address" class="text-muted" style="font-size: 10px;">
                        IP: {{ item.ip_address }}
                      </div>
                    </td>
                    <td>
                      <span :class="['badge', item.is_success ? 'bg-success' : 'bg-danger']">
                        {{ item.is_success ? "Sukses" : "Gagal" }}
                      </span>
                    </td>
                    <td class="small text-muted">
                      {{ item.duration_ms != null ? item.duration_ms + " ms" : "-" }}
                    </td>
                    <td class="text-center">
                      <b-button
                        size="sm"
                        variant="soft-info"
                        title="Lihat Detail Log"
                        @click="openDetail(item)"
                      >
                        <i class="bx bx-show fs-16"></i>
                      </b-button>
                    </td>
                  </tr>

                  <tr v-if="logList.length === 0">
                    <td colspan="9" class="text-center text-muted py-4">
                      Tidak ada activity log yang ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <div class="text-muted small">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total: {{ totalRows }} log)
              </div>

              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
                align="right"
                class="mb-0"
              />
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
      title="Detail Activity Log"
      size="xl"
      hide-footer
    >
      <div v-if="selectedItem">
        <b-row class="mb-3 gy-2">
          <b-col md="4">
            <span class="text-muted d-block small">ID Log</span>
            <span class="font-monospace small">#{{ selectedItem.id }}</span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Waktu</span>
            <span class="small">{{ formatDateTime(selectedItem.created_at) }}</span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Status</span>
            <span :class="['badge', selectedItem.is_success ? 'bg-success' : 'bg-danger']">
              {{ selectedItem.is_success ? "Sukses" : "Gagal" }}
            </span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">User ID</span>
            <span class="small fw-semibold">{{ selectedItem.user_id ?? "System / Guest" }}</span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Action</span>
            <span :class="['badge', getActionBadge(selectedItem.action)]">
              {{ selectedItem.action }}
            </span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Tabel & Record ID</span>
            <span class="small font-monospace">{{ selectedItem.table_name }} (ID: {{ selectedItem.record_id ?? '-' }})</span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Method & Endpoint</span>
            <span class="small font-monospace">
              <span class="badge bg-secondary me-1">{{ selectedItem.method }}</span>
              {{ selectedItem.endpoint }}
            </span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">Durasi</span>
            <span class="small">{{ selectedItem.duration_ms != null ? selectedItem.duration_ms + " ms" : "-" }}</span>
          </b-col>
          <b-col md="4">
            <span class="text-muted d-block small">IP Address</span>
            <span class="small font-monospace">{{ selectedItem.ip_address || "-" }}</span>
          </b-col>
          <b-col md="12" v-if="selectedItem.user_agent">
            <span class="text-muted d-block small">User Agent</span>
            <span class="small text-muted font-monospace">{{ selectedItem.user_agent }}</span>
          </b-col>
          <b-col md="12" v-if="selectedItem.error">
            <div class="alert alert-danger py-2 mt-2 mb-0 small">
              <strong>Error:</strong> {{ selectedItem.error }}
            </div>
          </b-col>
        </b-row>

        <b-tabs content-class="mt-2" small>
          <b-tab title="New Values" active>
            <pre class="log-json">{{ prettyJson(selectedItem.new_values) }}</pre>
          </b-tab>
          <b-tab title="Old Values" v-if="selectedItem.old_values">
            <pre class="log-json">{{ prettyJson(selectedItem.old_values) }}</pre>
          </b-tab>
        </b-tabs>
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
  getActivityLogs,
  type ActivityLogItem,
} from "@/services/activityLogService";
import { formatDateTime } from "@/helpers/format";

const searchQuery = ref("");
const selectedAction = ref("");
const selectedTable = ref("");
const selectedIsSuccess = ref("");
const selectedUserId = ref("");
const selectedRecordId = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const currentPage = ref(1);
const perPage = ref(25);

const selectedItem = ref<ActivityLogItem | null>(null);
const showDetailModal = ref(false);

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedAction.value ||
      selectedTable.value ||
      selectedIsSuccess.value !== "" ||
      selectedUserId.value ||
      selectedRecordId.value ||
      dateFrom.value ||
      dateTo.value
    )
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedAction.value = "";
  selectedTable.value = "";
  selectedIsSuccess.value = "";
  selectedUserId.value = "";
  selectedRecordId.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  resetPage();
};

const resetPage = () => {
  currentPage.value = 1;
};

const { data, isLoading, isError, isFetching } = useQuery({
  queryKey: computed(() => [
    "activity-logs",
    searchQuery.value,
    selectedAction.value,
    selectedTable.value,
    selectedIsSuccess.value,
    selectedUserId.value,
    selectedRecordId.value,
    dateFrom.value,
    dateTo.value,
    currentPage.value,
    perPage.value,
  ]),
  queryFn: () =>
    getActivityLogs({
      search: searchQuery.value || undefined,
      action: selectedAction.value || undefined,
      table_name: selectedTable.value || undefined,
      is_success:
        selectedIsSuccess.value === ""
          ? undefined
          : selectedIsSuccess.value === "true",
      user_id: selectedUserId.value || undefined,
      record_id: selectedRecordId.value || undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
      page: currentPage.value,
      limit: perPage.value,
    }),
});

const logList = computed(() => data.value?.data ?? []);
const totalRows = computed(() => data.value?.meta?.total ?? 0);
const totalPages = computed(() => data.value?.meta?.last_page ?? 1);

const getActionBadge = (act: string) => {
  switch (act?.toLowerCase()) {
    case "create":
      return "bg-success";
    case "update":
      return "bg-warning text-dark";
    case "delete":
      return "bg-danger";
    default:
      return "bg-info text-dark";
  }
};

const getMethodBadge = (m: string) => {
  switch (m?.toUpperCase()) {
    case "GET":
      return "bg-primary";
    case "POST":
      return "bg-success";
    case "PUT":
    case "PATCH":
      return "bg-warning text-dark";
    case "DELETE":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const openDetail = (item: ActivityLogItem) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};

const prettyJson = (val: any) => {
  if (val === null || val === undefined) return "-";
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
};
</script>

<style scoped>
.log-json {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  max-height: 450px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

