<template>
  <b-offcanvas
    v-model="isVisible"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 720px"
    @hide="emit('hide')"
  >
    <!-- Header -->
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-calendar-event me-1 text-primary"></i>
          Detail Event
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isDetailLoading" class="text-center py-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat detail event...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="isDetailError" class="alert alert-danger m-0">
      <div class="d-flex align-items-center justify-content-between">
        <span>Gagal memuat detail event. Silakan coba lagi.</span>
        <b-button size="sm" variant="outline-danger" @click="refetchDetail">
          <i class="bx bx-refresh me-1"></i>Coba Lagi
        </b-button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="eventDetail" class="pb-4">
      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs border-bottom mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'detail' }"
            @click="activeTab = 'detail'"
            type="button"
          >
            <i class="bx bx-info-circle me-1"></i>Detail Event
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'participants' }"
            @click="activeTab = 'participants'"
            type="button"
          >
            <i class="bx bx-group me-1"></i>Peserta
            <span
              v-if="participantsList && participantsList.length"
              class="badge bg-primary ms-1"
            >
              {{ participantsList.length }}
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'transactions' }"
            @click="activeTab = 'transactions'"
            type="button"
          >
            <i class="bx bx-receipt me-1"></i>Transaksi
            <span
              v-if="transactionsList && transactionsList.length"
              class="badge bg-secondary ms-1"
            >
              {{ transactionsList.length }}
            </span>
          </button>
        </li>
      </ul>

      <!-- ================= TAB 1: DETAIL EVENT ================= -->
      <div v-if="activeTab === 'detail'" class="tab-content">
        <!-- Banner Image -->
        <div v-if="eventBannerUrl" class="mb-3">
          <img
            :src="eventBannerUrl"
            :alt="eventDetail.title"
            class="w-100 rounded border"
            style="max-height: 220px; object-fit: cover"
          />
        </div>

        <!-- Title & Badges -->
        <h5 class="fw-bold mb-2">{{ eventDetail.title }}</h5>

        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
          <span :class="['badge', statusBadgeClass(eventDetail.status)]">
            {{ eventDetail.status === 'active' ? 'Aktif' : eventDetail.status === 'inactive' ? 'Nonaktif' : eventDetail.status }}
          </span>
          <span :class="['badge', modeBadgeClass(eventDetail.mode)]">
            <i class="bx" :class="eventDetail.mode === 'online' ? 'bx-video' : 'bx-map-pin'"></i>
            {{ eventDetail.mode }}
          </span>
          <span v-if="eventDetail.event_type?.name" class="badge bg-light text-dark border">
            {{ eventDetail.event_type.name }}
          </span>
          <span v-if="eventDetail.reg_only" class="badge bg-info-subtle text-info border border-info-subtle">
            Reg Only
          </span>
        </div>

        <!-- Action Edit Button -->
        <div class="d-flex gap-2 mb-3">
          <b-button
            variant="soft-primary"
            size="sm"
            class="flex-fill"
            @click="handleEdit"
          >
            <i class="bx bx-edit-alt fs-16 me-1"></i>Edit Event
          </b-button>
          <b-button
            v-if="eventDetail.wa_grup"
            variant="soft-success"
            size="sm"
            class="flex-fill"
            :href="eventDetail.wa_grup"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="bx bxl-whatsapp fs-16 me-1"></i>Grup WhatsApp
          </b-button>
        </div>

        <hr class="my-3" />

        <!-- Info Grid -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-calendar me-1"></i>Informasi & Jadwal
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2 h-100">
              <small class="text-muted d-block">Harga Tiket</small>
              <span class="fw-semibold small">
                {{ eventDetail.price ? formatCurrency(eventDetail.price) : 'Gratis' }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2 h-100">
              <small class="text-muted d-block">Kuota Peserta</small>
              <span class="fw-semibold small">
                {{ eventDetail.quota ?? '-' }}
                <span v-if="eventDetail.available_quota !== undefined" class="text-muted">
                  (Sisa: {{ eventDetail.available_quota }})
                </span>
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2 h-100">
              <small class="text-muted d-block">Waktu Mulai</small>
              <span class="fw-semibold small">
                {{ formatDateTime(eventDetail.datetime) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2 h-100">
              <small class="text-muted d-block">Waktu Selesai</small>
              <span class="fw-semibold small">
                {{ formatDateTime(eventDetail.due_datetime) }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Lokasi</small>
              <span class="fw-semibold small">
                <i class="bx bx-map me-1 text-primary"></i>
                {{ eventDetail.location || '-' }}
              </span>
            </div>
          </b-col>
         
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block"><i class="bx bx-link me-1"></i> Link</small>
              <span class="fw-semibold small">
                <a
                  :href="`https://linkup.beramalbersama.com/event/${eventDetail.slug}`"
                  target="_blank"
                  class="text-primary small text-truncate d-inline-block"
                  style="max-width: 90%;"
                >
                  https://linkup.beramalbersama.com/event/{{ eventDetail.slug }}
                </a>
              </span>
            </div>
          </b-col>
        </b-row>

        <!-- Mitra Info -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-buildings me-1"></i>Mitra Penyelenggara
        </h6>
        <div class="bg-light rounded p-3 mb-3 border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="fw-bold">{{ eventDetail.mitra?.nama || '-' }}</div>
              <small v-if="eventDetail.mitra?.wa" class="text-muted">
                <i class="bx bxl-whatsapp me-1 text-success"></i>
                {{ eventDetail.mitra.wa }}
              </small>
            </div>
            <a
              v-if="eventDetail.mitra?.wa"
              :href="formatWaLink(eventDetail.mitra.wa)"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-soft-success"
            >
              <i class="bx bxl-whatsapp me-1"></i>Chat Mitra
            </a>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="eventDetail.summary" class="mb-3">
          <h6
            class="fw-semibold text-muted mb-1 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            <i class="bx bx-align-left me-1"></i>Ringkasan
          </h6>
          <p class="text-muted small mb-0 p-2 bg-light rounded">
            {{ eventDetail.summary }}
          </p>
        </div>

        <!-- Description -->
        <div v-if="eventDetail.description" class="mb-3">
          <h6
            class="fw-semibold text-muted mb-1 text-uppercase"
            style="font-size: 11px; letter-spacing: 0.5px"
          >
            <i class="bx bx-detail me-1"></i>Deskripsi
          </h6>
          <div
            class="border rounded p-3 bg-light small event-description"
            v-html="eventDetail.description"
          ></div>
        </div>
      </div>

      <!-- ================= TAB 2: PESERTA ================= -->
      <div v-if="activeTab === 'participants'" class="tab-content">
        <!-- Participant Loading -->
        <div v-if="isParticipantsLoading" class="text-center py-5">
          <b-spinner variant="primary" />
          <p class="mt-2 text-muted">Memuat daftar peserta...</p>
        </div>

        <!-- Participant Error -->
        <div v-else-if="isParticipantsError" class="alert alert-danger m-0">
          <div class="d-flex align-items-center justify-content-between">
            <span>Gagal memuat peserta. Silakan coba lagi.</span>
            <b-button size="sm" variant="outline-danger" @click="refetchParticipants">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>
        </div>

        <!-- Participants Content -->
        <div v-else>
          <!-- Summary Cards -->
          <b-row class="g-2 mb-3">
            <b-col cols="6">
              <div class="border rounded p-2 bg-light text-center">
                <small class="text-muted d-block">Total Pendaftar</small>
                <span class="fs-5 fw-bold text-primary">
                  {{ participantsList.length }}
                </span>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="border rounded p-2 bg-light text-center">
                <small class="text-muted d-block">Total Tiket / Qty</small>
                <span class="fs-5 fw-bold text-success">
                  {{ totalTickets }}
                </span>
              </div>
            </b-col>
          </b-row>

          <!-- Empty State -->
          <div
            v-if="!participantsList || participantsList.length === 0"
            class="text-center py-5 border rounded bg-light"
          >
            <i class="bx bx-user-x fs-1 text-muted d-block mb-2"></i>
            <h6 class="fw-semibold text-muted mb-1">Belum Ada Peserta</h6>
            <p class="text-muted small mb-0">
              Belum ada peserta yang mendaftar pada event ini.
            </p>
          </div>

          <!-- Participants List -->
          <div v-else class="d-flex flex-column gap-3">
            <div
              v-for="(item, idx) in participantsList"
              :key="idx"
              class="border rounded p-3 bg-white shadow-sm"
            >
              <!-- User Info Row -->
              <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                  <div
                    class="avatar-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                    style="width: 38px; height: 38px; flex-shrink: 0"
                  >
                    {{ (item.user?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="fw-semibold fs-14">
                      {{ item.user?.name || 'Anonim' }}
                    </div>
                    <div class="text-muted small d-flex flex-wrap align-items-center gap-2">
                      <span v-if="item.user?.email">
                        <i class="bx bx-envelope me-1"></i>{{ item.user.email }}
                      </span>
                      <a
                        v-if="item.user?.phone"
                        :href="formatWaLink(item.user.phone)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-decoration-none text-success"
                      >
                        <i class="bx bxl-whatsapp me-1"></i>{{ item.user.phone }}
                      </a>
                    </div>
                  </div>
                </div>

                <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                  {{ item.quantity ?? 1 }} Tiket
                </span>
              </div>

              <!-- Transactions for this participant -->
              <div
                v-if="item.transactions && item.transactions.length"
                class="mt-2 pt-2 border-top"
              >
                <small class="text-muted fw-semibold d-block mb-1">
                  <i class="bx bx-receipt me-1"></i>Transaksi Terkait:
                </small>
                <div class="d-flex flex-column gap-1">
                  <div
                    v-for="tx in item.transactions"
                    :key="tx.id"
                    class="d-flex align-items-center justify-content-between bg-light rounded px-2 py-1 small"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <span class="font-monospace fw-semibold text-primary">
                        {{ tx.invoice }}
                      </span>
                      <span class="text-muted">
                        {{ formatDate(tx.date) }}
                      </span>
                    </div>
                    <span class="badge bg-secondary-subtle text-secondary">
                      Qty: {{ tx.quantity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= TAB 3: TRANSAKSI ================= -->
      <div v-if="activeTab === 'transactions'" class="tab-content">
        <div v-if="isTransactionsLoading" class="text-center py-5">
          <b-spinner variant="primary" />
          <p class="mt-2 text-muted">Memuat transaksi...</p>
        </div>

        <div v-else-if="!transactionsList || transactionsList.length === 0"
          class="text-center py-5 border rounded bg-light"
        >
          <i class="bx bx-receipt fs-1 text-muted d-block mb-2"></i>
          <p class="text-muted small mb-0">Belum ada transaksi untuk event ini.</p>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <!-- Summary -->
          <div class="d-flex gap-2 mb-2">
            <div class="border rounded p-2 bg-light text-center flex-fill">
              <small class="text-muted d-block">Total Transaksi</small>
              <span class="fw-bold fs-5 text-primary">{{ transactionsList.length }}</span>
            </div>
            <div class="border rounded p-2 bg-light text-center flex-fill">
              <small class="text-muted d-block">Paid</small>
              <span class="fw-bold fs-5 text-success">
                {{ transactionsList.filter((t: any) => t.status === 'Paid').length }}
              </span>
            </div>
            <div class="border rounded p-2 bg-light text-center flex-fill">
              <small class="text-muted d-block">Canceled</small>
              <span class="fw-bold fs-5 text-danger">
                {{ transactionsList.filter((t: any) => t.status === 'Canceled').length }}
              </span>
            </div>
          </div>

          <!-- List -->
          <div
            v-for="tx in transactionsList"
            :key="tx.id"
            class="border rounded p-3 bg-white d-flex align-items-center justify-content-between gap-2"
          >
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="fw-semibold small text-truncate">{{ tx.user?.name || 'Anonim' }}</span>
                <span class="text-muted small">·</span>
                <span class="text-muted small">{{ tx.payment_method?.bank_name ?? '-' }}</span>
              </div>
              <div class="font-monospace text-muted" style="font-size: 11px">{{ tx.invoice }}</div>
            </div>
            <div class="text-end flex-shrink-0">
              <div class="fw-semibold small">{{ tx.total ? formatCurrency(tx.total) : 'Gratis' }}</div>
              <span
                class="badge"
                :class="tx.status === 'Paid' ? 'bg-success' : tx.status === 'Canceled' ? 'bg-danger' : 'bg-warning text-dark'"
              >
                {{ tx.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getEventById, getEventParticipants, getEventTransactions } from "@/services/eventService";
import { formatCurrency, formatDateTime, formatDate } from "@/helpers/format";
import router from "@/router";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  eventId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "hide"]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const activeTab = ref<"detail" | "participants" | "transactions">("detail");

// Reset to detail tab whenever eventId changes
watch(
  () => props.eventId,
  () => {
    activeTab.value = "detail";
  },
);

// ── Event Detail Query ─────────────────────────────────────────
const {
  data: eventDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
  refetch: refetchDetail,
} = useQuery({
  queryKey: computed(() => ["event-detail", props.eventId]),
  queryFn: () => getEventById(props.eventId),
  enabled: computed(() => props.modelValue && props.eventId > 0),
});

// ── Event Participants Query ───────────────────────────────────
const {
  data: participantsList,
  isLoading: isParticipantsLoading,
  isError: isParticipantsError,
  refetch: refetchParticipants,
} = useQuery({
  queryKey: computed(() => ["event-participants", props.eventId]),
  queryFn: () => getEventParticipants(props.eventId),
  enabled: computed(
    () => props.modelValue && props.eventId > 0 && activeTab.value === "participants",
  ),
});

// ── Event Transactions Query ───────────────────────────────────
const {
  data: transactionsList,
  isLoading: isTransactionsLoading,
} = useQuery({
  queryKey: computed(() => ["event-transactions", props.eventId]),
  queryFn: () => getEventTransactions(props.eventId),
  enabled: computed(
    () => props.modelValue && props.eventId > 0 && activeTab.value === "transactions",
  ),
});

const totalTickets = computed(() => {
  if (!participantsList.value || !Array.isArray(participantsList.value)) return 0;
  return participantsList.value.reduce(
    (sum: number, p: any) => sum + (Number(p.quantity) || 1),
    0,
  );
});

// Banner Image Resolver
const eventBannerUrl = computed(() => {
  if (!eventDetail.value) return null;
  if (eventDetail.value.image_url) return eventDetail.value.image_url;
  if (eventDetail.value.image) {
    if (eventDetail.value.image.startsWith("http")) return eventDetail.value.image;
    const base = (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "");
    return `${base}/storage/${eventDetail.value.image}`;
  }
  return null;
});

// Status & Mode Badges
const statusBadgeClass = (status: string) => {
  if (status === "active") return "bg-success";
  if (status === "inactive") return "bg-secondary";
  return "bg-secondary";
};

const modeBadgeClass = (mode: string) => {
  if (mode === "online") return "bg-info";
  if (mode === "offline") return "bg-warning text-dark";
  if (mode === "hybrid") return "bg-primary";
  return "bg-secondary";
};

const formatWaLink = (phone: string) => {
  if (!phone) return "#";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  }
  return `https://wa.me/${clean}`;
};

const handleEdit = () => {
  if (eventDetail.value?.id) {
    isVisible.value = false;
    router.push(`/events/${eventDetail.value.id}/edit`);
  }
};
</script>

<style scoped>
.event-description :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.event-description :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
