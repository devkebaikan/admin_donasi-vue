<template>
  <b-card
    no-body
    class="h-100 d-flex flex-column border-0 shadow-sm"
    style="margin-bottom: 0; max-height: 86vh; position: relative"
  >
    <div
      v-if="!donorId"
      class="text-center p-5 text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center"
    >
      <i class="bx bx-user-circle fs-1 mb-2 d-block opacity-50"></i>
      <p class="mb-0 fs-13">
        Pilih donatur di sebelah kiri untuk melihat detail
      </p>
    </div>

    <div
      v-else-if="isLoading || !detail"
      class="text-center p-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center"
    >
      <b-spinner variant="primary" small />
      <p class="mt-2 text-muted fs-13">Memuat detail...</p>
    </div>

    <template v-else>
      <!-- ============ Header ============ -->
      <b-card-header
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 flex-shrink-0 bg-white border-bottom"
      >
        <div class="d-flex align-items-center">
          <div
            class="avatar-title rounded-circle flex-shrink-0 fs-12 fw-semibold"
            :class="`bg-soft-${colorTagVariant(detail.color_tag)} text-${colorTagVariant(detail.color_tag)}`"
            style="width: 32px; height: 32px"
          >
            {{ initialsOf(detail.name) }}
          </div>
          <div class="ms-2">
            <h6 class="my-0 fs-13 fw-semibold text-dark">
              {{ detail.name }}
              <span class="text-muted fw-normal fs-11" v-if="detail.nick"
                >({{ detail.nick }})</span
              >
            </h6>
            <p class="mb-0 text-muted fs-11">{{ detail.phone }}</p>
          </div>
        </div>

        <div
          class="btn-group rounded p-1"
          role="group"
          style="background-color: #f1f2f6; gap: 2px"
        >
          <button
            type="button"
            class="btn btn-sm rounded fw-medium border-0"
            :class="activeTab === 'detail' ? 'btn-primary' : 'text-muted'"
            :style="activeTab !== 'detail' && 'background-color: transparent'"
            @click="activeTab = 'detail'"
          >
            <i class="bx bx-id-card me-1"></i>Detail
          </button>
          <button
            type="button"
            class="btn btn-sm rounded fw-medium border-0"
            :class="activeTab === 'chat' ? 'btn-primary' : 'text-muted'"
            :style="activeTab !== 'chat' && 'background-color: transparent'"
            @click="activeTab = 'chat'"
          >
            <i class="bx bx-chat me-1"></i>Chat WA
          </button>
        </div>
      </b-card-header>

      <!-- ============ Tab: Detail ============ -->
      <div
        v-if="activeTab === 'detail'"
        class="flex-grow-1"
        style="min-height: 0; overflow-y: auto; background-color: #f8f9fb"
      >
        <b-card-body class="pb-2">
          <!-- Profile summary — soft indigo -->
          <div class="rounded-3 p-3 mb-3" style="background-color: #eef1fd">
            <div class="d-flex align-items-start gap-2">
              <div
                class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold text-white"
                style="width: 42px; height: 42px; background-color: #7c86e0"
              >
                {{ initialsOf(detail.name) }}
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-0 fs-14 fw-semibold">
                  {{ detail.name }}
                  <span class="text-muted fw-normal fs-12" v-if="detail.nick"
                    >({{ detail.nick }})</span
                  >
                </h6>
                <p class="mb-2 text-muted fs-12">
                  {{ detail.phone }} | alamat | pekerjaan
                </p>
                <div class="d-flex flex-wrap gap-1">
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10 badge-soft-secondary"
                  >
                    {{ detail.level }}
                  </b-badge>
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10"
                    :class="`badge-soft-${cycleStatusVariant(detail.cycle_status)}`"
                  >
                    {{ detail.cycle_status }}
                  </b-badge>
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10 badge-soft-primary"
                  >
                    Poin: {{ detail.poin }}
                  </b-badge>
                </div>
              </div>
            </div>
            <div
              v-if="detail.assigned_cs"
              class="d-flex align-items-center gap-2 bg-white mt-2 rounded-2 py-1 px-3 fs-12"
            >
              <i class="bx bx-headphone fs-16 text-muted"></i>
              <span
                >CS:
                <span class="fw-semibold">{{
                  detail.assigned_cs.nama
                }}</span></span
              >
            </div>
          </div>

          <!-- Detail Transaksi — soft blue -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #6b8bb5"
            >
              <i class="bx bx-receipt me-1"></i>Detail Transaksi
            </h6>

            <div>
              <!-- Progress bar -->
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small class="text-muted">Progress Pencapaian</small>
                  <small class="fw-semibold">30%</small>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    :style="{
                      width: Math.min(Number(30), 100) + '%',
                    }"
                  ></div>
                </div>
              </div>

              <b-row class="g-2 mb-3">
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Total Donasi</small>
                    <span class="fw-semibold font-monospace small">
                      {{ formatCurrency(1000000) }}
                    </span>
                  </div>
                </b-col>
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Nominal</small>
                    <span class="fw-semibold font-monospace small text-success">
                      {{ formatCurrency(Number(3000000)) }}
                    </span>
                  </div>
                </b-col>
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Terakhir Donasi</small>
                    <span class="fw-semibold font-monospace small"> 20 </span>
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>

          <!-- Project Salur — soft cyan -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #4f9ba3"
            >
              <i class="bx bx-folder-open me-1"></i>Sudah Masuk Project
            </h6>
            <div
              class="d-flex align-items-center justify-content-between p-3 rounded-1"
              style="background-color: #eaf7f8"
            >
              <div>
                <h6 class="mb-0 fs-13 fw-semibold">{{ dummyProject.name }}</h6>
                <p class="mb-0 text-muted fs-11">
                  {{ dummyProject.program }} ·
                  {{ dummyProject.allocatedAmount }} · disalurkan
                  {{ formatDate(dummyProject.allocatedAt) }}
                </p>
              </div>
              <b-badge
                :variant="null"
                class="fw-medium fs-10 badge-soft-cyan flex-shrink-0 ms-2"
              >
                {{ dummyProject.status }}
              </b-badge>
            </div>
          </div>

          <!-- Update Kegiatan — soft mint -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #4e9c82"
            >
              <i class="bx bx-news me-1"></i>Update Kegiatan
            </h6>
            <div
              v-for="(act, idx) in dummyActivities"
              :key="idx"
              class="py-1 p-3 rounded-1"
              :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
              style="background-color: #eaf8f3"
            >
              <p class="mb-0 fs-12 fw-semibold">{{ act.title }}</p>
              <p class="mb-0 text-muted fs-11">
                {{ formatDate(act.date) }} — {{ act.note }}
              </p>
            </div>
          </div>

          <!-- Riwayat Follow Up — soft amber -->
          <div class="rounded-3 mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6
                class="fs-11 fw-semibold text-uppercase mb-0"
                style="color: #b3903f"
              >
                <i class="bx bx-calendar-check me-1"></i>Riwayat Follow Up
              </h6>
              <b-button
                size="sm"
                :variant="null"
                class="btn-outline-secondary rounded-pill fs-12"
              >
                <i class="bx bx-plus me-1"></i>Tambah FU
              </b-button>
            </div>
            <div
              v-if="detail.follow_ups.length"
              style="background-color: #fdf5e7"
            >
              <div
                v-for="(fu, idx) in detail.follow_ups"
                :key="fu.id"
                class="d-flex p-3 align-items-start justify-content-between py-2"
                :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
              >
                <div>
                  <h6 class="mb-0 fs-13 fw-semibold">{{ fu.jenis }}</h6>
                  <p class="mb-0 text-muted fs-11">
                    {{ formatDate(fu.scheduled_date) }} · {{ fu.waktu_slot }} ·
                    {{ fu.channel
                    }}<template v-if="fu.assigned_user">
                      · {{ fu.assigned_user.name }}</template
                    >
                  </p>
                  <p v-if="fu.note" class="mb-0 text-muted fs-11 fst-italic">
                    {{ fu.note }}
                  </p>
                </div>
                <b-badge
                  :variant="null"
                  class="fw-medium fs-10 flex-shrink-0 ms-2"
                  :class="`badge-soft-${followUpStatusVariant(fu.status)}`"
                >
                  {{ fu.status }}
                </b-badge>
              </div>
            </div>
            <p v-else class="text-muted fs-13 mb-0">Belum ada follow up</p>
          </div>

          <!-- Riwayat Donasi — soft green -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #5a9c6a"
            >
              <i class="bx bx-history me-1"></i>Riwayat Donasi
            </h6>
            <div
              v-for="(don, idx) in dummyDonationHistory"
              :key="don.invoice"
              style="background-color: #ecf8ee"
              class="d-flex p-3 align-items-center justify-content-between py-1"
              :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
            >
              <div>
                <p class="mb-0 fs-12 fw-semibold">{{ don.amount }}</p>
                <p class="mb-0 text-muted fs-11">
                  {{ don.program }} · {{ don.invoice }}
                </p>
              </div>
              <div class="text-end flex-shrink-0 ms-2">
                <p class="mb-1 text-muted fs-11">{{ formatDate(don.date) }}</p>
                <b-badge
                  :variant="null"
                  class="fw-medium fs-10 badge-soft-success"
                >
                  {{ don.status }}
                </b-badge>
              </div>
            </div>
          </div>
        </b-card-body>

        <div
          class="border-top p-2 d-flex flex-wrap align-items-center gap-2 sticky-bottom bg-white"
        >
          <b-button
            size="sm"
            :variant="null"
            class="btn-outline-secondary d-inline-flex align-items-center"
          >
            <i class="bx bx-id-card me-1"></i>Profiling
          </b-button>
          <b-button
            size="sm"
            variant="primary"
            class="d-inline-flex align-items-center"
          >
            <i class="bx bx-check me-1"></i>Selesai
          </b-button>
          <b-button
            size="sm"
            :variant="null"
            class="btn-outline-secondary d-inline-flex align-items-center"
          >
            <i class="bx bx-skip-next me-1"></i>Lewati
          </b-button>
          <b-button
            size="sm"
            :variant="null"
            class="btn-outline-secondary d-inline-flex align-items-center"
          >
            <i class="bx bx-transfer-alt me-1"></i>Limpahkan
          </b-button>
          <b-button
            size="sm"
            :variant="null"
            class="ms-auto btn-soft-danger d-inline-flex align-items-center"
          >
            <i class="bx bx-power-off me-1"></i>OFF
          </b-button>
        </div>
      </div>

      <!-- ============ Tab: Chat ============ -->
      <DonorChat
        v-else-if="chatCard"
        :card="chatCard"
        class="flex-grow-1"
        style="min-height: 0"
        @send="handleSend"
      />
    </template>
  </b-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { formatCurrency, formatDate } from "@/helpers/format";
import { getDonorDetail } from "@/services/crmService";
import { colorTagVariant, cycleStatusVariant, initialsOf } from "./adapters";
import DonorChat from "./DonorChat.vue";
import type { ChatMessageItem, CrmChatCard } from "./types";

const props = defineProps<{
  donorId: number;
}>();

const activeTab = ref<"detail" | "chat">("detail");
const localMessages = ref<ChatMessageItem[]>([]);

watch(
  () => props.donorId,
  () => {
    activeTab.value = "detail";
    localMessages.value = [];
  },
);

// Fetch detail
const { data: detail, isLoading } = useQuery({
  queryKey: computed(() => ["crm-donor-detail", props.donorId]),
  queryFn: () => getDonorDetail(props.donorId),
  enabled: computed(() => props.donorId > 0),
});

const chatCard = computed<CrmChatCard | null>(() => {
  if (!detail.value) return null;
  return {
    id: detail.value.id,
    initials: initialsOf(detail.value.name),
    colorVariant: colorTagVariant(detail.value.color_tag),
    name: detail.value.name,
    nickname: detail.value.nick,
    phone: detail.value.phone,
    chatMessages: [
      ...(detail.value.chat_messages ?? []),
      ...localMessages.value,
    ],
  };
});

// Belum ada endpoint kirim pesan — pesan baru ditampilkan optimis di sisi klien saja.
const handleSend = (text: string) => {
  localMessages.value.push({
    text,
    isSender: true,
    timeStamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
};

const FOLLOW_UP_STATUS_VARIANT: Record<string, string> = {
  pending: "warning",
  done: "success",
  selesai: "success",
  cancelled: "secondary",
  batal: "secondary",
};
const followUpStatusVariant = (status: string) =>
  FOLLOW_UP_STATUS_VARIANT[status] ?? "secondary";

// ─── Dummy sementara ─────────────────────────────────────────────────────────
// Endpoint transaksi/project/kegiatan/riwayat donasi belum siap di backend.
// Ganti dengan getCrmTransactionById/getCrmProjects/getCrmKegiatans/
// getCrmTransactions (sudah ada di crmService.ts) begitu API-nya siap.
const dummyTransaction = {
  invoice: "INV-2026-000123",
  amount: "Rp 500.000",
  method: "BCA Virtual Account",
  status: "Paid",
  date: "2026-07-20",
};

const dummyProject = {
  name: "Beasiswa Yatim Sem. 1 2026",
  program: "Pendidikan",
  allocatedAmount: "Rp 500.000",
  allocatedAt: "2026-07-21",
  status: "Berjalan",
};

const dummyActivities = [
  {
    title: "Distribusi Bantuan Tahap 1",
    date: "2026-07-22",
    note: "Bantuan telah disalurkan ke 20 penerima manfaat.",
  },
  {
    title: "Distribusi Bantuan Tahap 1",
    date: "2026-07-22",
    note: "Bantuan telah disalurkan ke 20 penerima manfaat.",
  },
];

const dummyDonationHistory = [
  {
    invoice: "INV-2026-000101",
    amount: "Rp 500.000",
    program: "Beasiswa Yatim Sem. 1 2026",
    date: "2026-07-20",
    status: "Paid",
  },
  {
    invoice: "INV-2026-000045",
    amount: "Rp 500.000",
    program: "Beasiswa Yatim Sem. 1 2026",
    date: "2026-06-15",
    status: "Paid",
  },
  {
    invoice: "INV-2025-009812",
    amount: "Rp 500.000",
    program: "Beasiswa Yatim Sem. 1 2026",
    date: "2026-05-10",
    status: "Paid",
  },
];
</script>
