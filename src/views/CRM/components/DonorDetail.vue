<template>
  <b-card
    no-body
    class="h-100 d-flex flex-column border-0 shadow-sm"
    style="margin-bottom: 0; max-height: 91vh; position: relative"
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
            <p class="mb-0 text-muted fs-11">
              {{ detail.phone }}
            </p>
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
            <i class="bx bxl-whatsapp fs-4 me-1"></i>Chat WA
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
            <div class="d-flex align-items-start gap-3">
              <div
                class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold text-white"
                :style="`
                width: 42px;
                height: 42px;
                background-color: ${detail.color_tag && detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
                 opacity: 0.5;
              `"
              >
                {{ initialsOf(detail.name) }}
              </div>

              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1 fw-semibold">
                      {{ detail.name }}
                      <span
                        v-if="detail.nick"
                        class="text-muted fw-normal fs-12"
                      >
                        ({{ detail.nick }})
                      </span>
                    </h6>

                    <div
                      class="text-muted fs-12 d-flex align-items-center gap-1"
                    >
                      <i class="bx bx-phone"></i>
                      {{ detail.phone }}
                    </div>
                  </div>

                  <div class="d-flex gap-1">
                    <span
                      class="badge"
                      :class="`badge-soft-${cycleStatusVariant(detail.cycle_status)}`"
                    >
                      {{ detail.cycle_status }}
                    </span>
                    <span
                      class="badge"
                      :style="`
                        background-color: ${detail.color_tag && detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
                        opacity: 0.5;
                      `"
                    >
                      {{ detail.color_tag }}
                    </span>
                  </div>
                </div>

                <div class="d-flex flex-wrap gap-1 mt-2">
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10 badge-soft-secondary"
                  >
                    {{ detail.level }}
                  </b-badge>

                  <b-badge :variant="null" class="badge-soft-danger">
                    <i class="bx bx-time me-1"></i>
                    {{ detail.hari_tidak_aktif }} Hari Tidak Aktif
                  </b-badge>

                  <b-badge :variant="null" class="badge-soft-info">
                    <i class="bx bx-task me-1"></i>
                    {{ detail.follow_ups.length }} Follow Up
                  </b-badge>

                  <b-badge :variant="null" class="badge-soft-warning">
                    <i class="bx bx-task me-1"></i>
                    Donasi ke - {{ detail.follow_ups.length }}
                  </b-badge>

                  <b-badge :variant="null" class="badge-soft-primary">
                    <i class="bx bx-star me-1"></i>
                    {{ detail.poin }} Poin
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

          <!-- Transaksi Saat Ini — soft blue -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #6b8bb5"
            >
              <i class="bx bx-receipt me-1"></i>Transaksi Saat Ini
            </h6>

            <p
              v-if="pipelineCase?.keterangan"
              class="mb-2 fs-12 text-muted fst-italic"
            >
              <i class="bx bx-message-square-detail me-1"></i
              >{{ pipelineCase.keterangan }}
            </p>

            <div v-if="isTransactionLoading" class="text-center p-3">
              <b-spinner small variant="primary" />
            </div>
            <p v-else-if="!transaction" class="text-muted fs-13 mb-0">
              Detail transaksi tidak tersedia
            </p>
            <div v-else>
              <div
                class="d-flex align-items-center justify-content-between mb-2"
              >
                <span class="font-monospace fw-semibold small">{{
                  transaction.invoice
                }}</span>
                <b-badge
                  :variant="null"
                  class="fw-medium fs-10"
                  :class="`badge-soft-${transactionStatusVariant(transaction.status)}`"
                >
                  {{ transaction.status }}
                </b-badge>
              </div>

              <b-row class="g-2 mb-2">
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Donasi sebesar</small>
                    <span class="fw-semibold font-monospace small text-success">
                      {{ formatCurrency(transaction.total) }}
                    </span>
                  </div>
                </b-col>
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Tanggal</small>
                    <span class="fw-semibold small">
                      {{ formatDate(transaction.date) }}
                      <template v-if="transactionTime">
                        · {{ transactionTime }}</template
                      >
                    </span>
                  </div>
                </b-col>
                <b-col cols="4">
                  <div class="bg-light rounded p-2">
                    <small class="text-muted d-block">Metode Pembayaran</small>
                    <span class="fw-semibold small">
                      {{
                        transaction.payment_method?.bank_name ??
                        transaction.payment_method?.bank_provider ??
                        "-"
                      }}
                    </span>
                  </div>
                </b-col>
              </b-row>

              <b-badge
                v-if="transaction.anonim"
                :variant="null"
                class="badge-soft-secondary fs-10"
              >
                <i class="bx bx-incognito me-1"></i>Donasi Anonim
              </b-badge>
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
            <div v-if="isTransactionLoading" class="text-center p-3">
              <b-spinner small variant="primary" />
            </div>
            <template
              v-else-if="
                currentTransactionDetails.length > 0 &&
                currentTransactionDetails[0].project
              "
            >
              <div
                v-for="(td, idx) in currentTransactionDetails"
                :key="td.id"
                class="d-flex align-items-center justify-content-between p-3 rounded-1"
                :class="idx ? 'mt-2' : ''"
                style="background-color: #eaf7f8"
              >
                <div>
                  <h6 class="mb-0 fs-13 fw-semibold">
                    {{ td.project?.judul ?? "-" }}
                  </h6>
                  <p class="mb-0 text-muted fs-11">
                    Program : {{ td.program?.name ?? "-" }} ·
                    {{ formatCurrency(td.nominal) }}
                  </p>
                </div>
                <b-badge
                  :variant="null"
                  class="fw-medium fs-10 badge-soft-cyan flex-shrink-0 ms-2"
                >
                  {{ td.project?.status ?? td.activity }}
                </b-badge>
              </div>
            </template>
            <p v-else class="text-muted fs-13 mb-0">Belum masuk project</p>
          </div>

          <!-- Update Kegiatan — soft mint -->
          <div class="rounded-3 mb-3">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #4e9c82"
            >
              <i class="bx bx-news me-1"></i>Update Kegiatan
            </h6>
            <div v-if="isKegiatanLoading" class="text-center p-3">
              <b-spinner small variant="primary" />
            </div>
            <template v-else-if="kegiatanList.length">
              <div
                v-for="(act, idx) in kegiatanList"
                :key="act.id"
                class="py-1 p-3 rounded-1"
                :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
                style="background-color: #eaf8f3"
              >
                <p class="mb-0 fs-12 fw-semibold">{{ act.judul }}</p>
                <p class="mb-0 text-muted fs-11">
                  {{ formatDate(act.date) }} · {{ act.type }}
                </p>
              </div>
            </template>
            <p v-else class="text-muted fs-13 mb-0">
              Belum ada update kegiatan
            </p>
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
                class="btn-outline-secondary rounded-pill fs-10"
                @click="showFuModal = true"
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
                <div class="flex-grow-1">
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
                <div class="d-flex gap-1 flex-shrink-0 ms-2 align-items-start">
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10 flex-shrink-0 me-2"
                    :class="`badge-soft-${followUpStatusVariant(fu.status)}`"
                  >
                    {{ fu.status }}
                  </b-badge>
                  <b-button
                    v-if="fu.status === 'pending'"
                    size="sm"
                    variant="outline-primary"
                    class="d-inline-flex align-items-center gap-1 fs-10"
                    :disabled="isSendingFu"
                    @click="handleSendFollowUp(fu)"
                    title="Kirim pesan sesuai template"
                  >
                    <i
                      class="bx bx-send fs-12"
                      style="transform: rotate(-45deg)"
                    ></i>
                    Kirim
                  </b-button>
                  <b-button
                    v-if="fu.status !== 'selesai' && fu.status !== 'batal'"
                    size="sm"
                    variant="outline-success"
                    class="fs-10"
                    @click="updateFollowUpStatus(fu.id, 'selesai')"
                    title="Kirim pesan sesuai template"
                  >
                    <i class="bx bx-check fs-12"></i>
                  </b-button>
                  <b-button
                    v-if="fu.status !== 'selesai' && fu.status !== 'batal'"
                    size="sm"
                    variant="outline-danger"
                    class="fs-10"
                    @click="updateFollowUpStatus(fu.id, 'batal')"
                    title="Kirim pesan sesuai template"
                  >
                    <i class="bx bx-undo fs-12"></i>
                  </b-button>
                </div>
              </div>
            </div>
            <p v-else class="text-muted fs-13 mb-0">Belum ada follow up</p>
          </div>

          <!-- Riwayat Donasi — soft green -->
          <div class="rounded-3" style="margin-bottom: 80px">
            <h6
              class="fs-11 fw-semibold text-uppercase mb-2"
              style="color: #5a9c6a"
            >
              <i class="bx bx-history me-1"></i>Riwayat Donasi
            </h6>

            <div v-if="isHistoryLoading" class="text-center p-3">
              <b-spinner small variant="primary" />
            </div>
            <template v-else-if="donationHistory.length">
              <div
                v-for="(don, idx) in donationHistory"
                :key="don.id"
                style="background-color: #ecf8ee"
                class="d-flex p-3 align-items-center justify-content-between py-1"
                :style="idx ? 'border-top: 1px solid rgba(0,0,0,0.06)' : ''"
              >
                <div>
                  <p class="mb-0 fs-12 fw-semibold">
                    {{ formatCurrency(don.total) }}
                    <b-badge
                      v-if="don.id === transaction?.id"
                      :variant="null"
                      class="badge-soft-primary fs-10 ms-1"
                    >
                      Transaksi Ini
                    </b-badge>
                  </p>
                  <p class="mb-0 text-muted fs-11">
                    {{ donationPrograms(don) }} · {{ don.invoice }}
                  </p>
                </div>
                <div class="text-end flex-shrink-0 ms-2">
                  <p class="mb-1 text-muted fs-11">
                    {{ formatDate(don.date) }}
                  </p>
                  <b-badge
                    :variant="null"
                    class="fw-medium fs-10"
                    :class="`badge-soft-${transactionStatusVariant(don.status)}`"
                  >
                    {{ don.status }}
                  </b-badge>
                </div>
              </div>
            </template>
            <p v-else class="text-muted fs-13 mb-0">Belum ada riwayat donasi</p>
          </div>
        </b-card-body>

        <div
          class="border-top py-2 px-4 d-flex flex-wrap align-items-center gap-2 sticky-bottom bg-white"
          style="position: absolute; bottom: 0; left: 0; right: 0"
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

  <b-modal
    v-model="showFuModal"
    title="Tambah Follow Up"
    size="md"
    centered
    @hidden="resetFuForm"
  >
    <b-form>
      <b-form-group
        label="Jenis Follow Up"
        label-class="fw-semibold"
        class="mb-3"
      >
        <b-form-input
          v-model="fuForm.jenis"
          maxlength="150"
          placeholder="Contoh: Tindak lanjut donasi"
          required
        />
      </b-form-group>

      <b-form-group label="Channel" label-class="fw-semibold" class="mb-3">
        <b-form-select
          v-model="fuForm.channel"
          :options="channelOptions"
          required
        />
      </b-form-group>

      <b-form-group
        label="Template WA (Opsional)"
        label-class="fw-semibold"
        class="mb-3"
      >
        <b-form-select
          v-model="fuForm.template_id"
          :options="templateOptions"
          :disabled="isLoadingTemplates"
        />
      </b-form-group>

      <b-form-group
        label="Jadwal Tindakan"
        label-class="fw-semibold"
        class="mb-3"
      >
        <b-form-input v-model="fuForm.scheduled_date" type="date" required />
      </b-form-group>

      <b-form-group label="Waktu Slot" label-class="fw-semibold" class="mb-3">
        <b-form-select
          v-model="fuForm.waktu_slot"
          :options="waktuSlotOptions"
        />
      </b-form-group>

      <b-form-group
        label="Penanggungjawab"
        label-class="fw-semibold"
        class="mb-3"
      >
        <b-form-select
          v-model="fuForm.assigned_user_id"
          :options="assignedUserOptions"
        />
      </b-form-group>

      <b-form-group label="Catatan" label-class="fw-semibold" class="mb-0">
        <b-form-textarea
          v-model="fuForm.note"
          rows="2"
          placeholder="Catatan tambahan"
        />
      </b-form-group>
    </b-form>

    <template #footer>
      <b-button variant="light" @click="showFuModal = false"> Batal </b-button>
      <b-button
        variant="primary"
        :disabled="isSubmittingFu"
        @click="handleCreateFollowUp"
      >
        <b-spinner v-if="isSubmittingFu" small class="me-2" />
        Simpan Follow Up
      </b-button>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { formatCurrency, formatDate } from "@/helpers/format";
import {
  getDonorDetail,
  getCrmTransactionById,
  getCrmTransactions,
  getCrmKegiatans,
  getCrmChatTemplates,
  sendCrmChatToDonor,
  createFollowUp,
  updateStatusFollowUp,
} from "@/services/crmService";
import {
  colorTagVariant,
  cycleStatusVariant,
  initialsOf,
} from "@/utils/crmAdapters";
import DonorChat from "./DonorChat.vue";
import type {
  ChatMessageItem,
  CrmChatCard,
  CrmKegiatan,
  CrmPipelineCase,
  CrmTransactionHistoryItem,
} from "@/types/crm";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);

const props = defineProps<{
  donorId: number;
  case: CrmPipelineCase | null;
}>();

const activeTab = ref<"detail" | "chat">("detail");
const localMessages = ref<ChatMessageItem[]>([]);
const showFuModal = ref(false);
const isSendingFu = ref(false);
const isSubmittingFu = ref(false);
const queryClient = useQueryClient();

const fuForm = ref({
  jenis: "",
  channel: "crm",
  template_id: null as number | null,
  scheduled_date: "",
  waktu_slot: "Pagi",
  // assigned_user_id: null as number | null,
  assigned_user_id: 459561500707, // siti aminah (default) — sementara belum ada API untuk ambil list user
  note: "",
});

const channelOptions = [
  { value: "crm", text: "CRM" },
  { value: "Official WA", text: "Official WA" },
];

const waktuSlotOptions = [
  { value: "Pagi", text: "Pagi" },
  { value: "Siang", text: "Siang" },
  { value: "Sore", text: "Sore" },
  { value: "Malam", text: "Malam" },
  { value: "Segera", text: "Segera" },
];

const resetFuForm = () => {
  fuForm.value = {
    jenis: "",
    channel: "crm",
    template_id: null,
    scheduled_date: "",
    waktu_slot: "Pagi",
    assigned_user_id: 459561500707,
    note: "",
  };
};

watch(
  () => props.donorId,
  () => {
    activeTab.value = "detail";
    localMessages.value = [];
  },
);

// Kartu pipeline mentah (untuk keterangan, donor_profile_id & transaction_id) — lihat data.ts
const pipelineCase = computed(() => props.case);
const transactionId = computed(() => props.case?.transaction_id ?? 0);

// Detail donatur dipanggil pakai donor_profile_id
const donorProfileId = computed(() => props.case?.donor_profile_id ?? 0);

// Fetch detail
const {
  data: detail,
  isLoading,
  refetch: refetchDetail,
} = useQuery({
  queryKey: computed(() => ["crm-donor-detail", donorProfileId.value]),
  queryFn: () => getDonorDetail(donorProfileId.value),
  enabled: computed(() => donorProfileId.value > 0),
});

// Fetch chat templates untuk digunakan di FU
const { data: templatesRaw, isLoading: isLoadingTemplates } = useQuery({
  queryKey: computed(() => [
    "crm-chat-templates",
    pipelineCase.value?.pipeline_stage?.id,
  ]),
  queryFn: () =>
    getCrmChatTemplates({
      stage_id: pipelineCase.value?.pipeline_stage?.id,
    }),
  enabled: computed(() => !!pipelineCase.value?.pipeline_stage?.id),
});

const templateOptions = computed(() => {
  const templates = (templatesRaw.value ?? []) as any[];
  return [
    { value: null, text: "- Tidak pakai template -" },
    ...templates.map((t: any) => ({ value: t.id, text: t.name })),
  ];
});

const assignedUserOptions = computed(() => {
  return [{ value: null, text: "- Belum ditentukan -" }];
});

// Transaksi yang sedang berjalan di kartu pipeline ini
const { data: transaction, isLoading: isTransactionLoading } = useQuery({
  queryKey: computed(() => ["crm-transaction-detail", transactionId.value]),
  queryFn: () => getCrmTransactionById(transactionId.value),
  enabled: computed(() => transactionId.value > 0),
});

// Riwayat seluruh transaksi donatur ini (by user_id dari transaksi saat ini)
const { data: donationHistoryRaw, isLoading: isHistoryLoading } = useQuery({
  queryKey: computed(() => [
    "crm-transaction-history",
    transaction.value?.user_id,
  ]),
  queryFn: () =>
    getCrmTransactions({ user_id: transaction.value?.user_id, limit: 3 }),
  enabled: computed(() => !!transaction.value?.user_id),
});
const donationHistory = computed<CrmTransactionHistoryItem[]>(
  () => donationHistoryRaw.value ?? [],
);

// Project/program tempat transaksi saat ini disalurkan — dari transaction_details
const currentTransactionDetails = computed(
  () => transaction.value?.transaction_details ?? [],
);

// Ambil project_id pertama untuk cari update kegiatannya (umumnya 1 transaksi = 1 project)
const currentProjectId = computed(
  () => currentTransactionDetails.value[0]?.project_id ?? 0,
);

const { data: kegiatanListRaw, isLoading: isKegiatanLoading } = useQuery({
  queryKey: computed(() => ["crm-kegiatan", currentProjectId.value]),
  queryFn: () => getCrmKegiatans({ project_id: currentProjectId.value }),
  enabled: computed(() => currentProjectId.value > 0),
});
const kegiatanList = computed<CrmKegiatan[]>(() => kegiatanListRaw.value ?? []);

// const totalDonasiLifetime = computed(() =>
//   donationHistory.value
//     .filter((tx) => tx.status === "Paid")
//     .reduce((sum, tx) => sum + Number(tx.total ?? 0), 0),
// );

const lastDonationDate = computed(() => {
  const paid = donationHistory.value.filter((tx) => tx.status === "Paid");
  if (!paid.length) return null;
  return paid.reduce((latest, tx) =>
    new Date(tx.date) > new Date(latest.date) ? tx : latest,
  ).date;
});

// Field "time" API punya tanggal dummy (0000-01-01), hanya jam:menit yang valid
const transactionTime = computed(() => {
  const match = transaction.value?.time?.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
});

const TRANSACTION_STATUS_VARIANT: Record<string, string> = {
  Paid: "success",
  Pending: "warning",
  "Waiting for payment": "warning",
  Canceled: "danger",
  Refunded: "info",
};
const transactionStatusVariant = (status?: string) =>
  TRANSACTION_STATUS_VARIANT[status ?? ""] ?? "secondary";

const donationPrograms = (tx: CrmTransactionHistoryItem) => {
  const names = (tx.transaction_details ?? [])
    .map((d) => d.program?.name)
    .filter(Boolean);
  return names.length ? names.join(", ") : "Program tidak diketahui";
};

const chatCard = computed<CrmChatCard | null>(() => {
  if (!detail.value) return null;
  return {
    id: detail.value.id,
    initials: initialsOf(detail.value.name),
    colorVariant: colorTagVariant(detail.value.color_tag),
    name: detail.value.name,
    nickname: detail.value.nick,
    transactionId: transactionId.value,
    phone: detail.value.phone,
    pipelineStageId: pipelineCase.value?.pipeline_stage?.id,
    chatMessages: [
      ...(detail.value.chat_messages ?? []),
      ...localMessages.value,
    ],
  };
});

// Kirim pesan WA ke donatur — optimis tampil dulu, rollback jika API gagal.
const handleSend = async (text: string, templateId: number | null) => {
  const optimisticMessage: ChatMessageItem = {
    message: text,
    from_role: "cs" as ChatMessageItem["from_role"],
    text,
    isSender: true,
    timeStamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  localMessages.value.push(optimisticMessage);

  try {
    await sendCrmChatToDonor(donorProfileId.value, {
      message: text,
      template_id: templateId,
    });
  } catch (err: any) {
    localMessages.value = localMessages.value.filter(
      (m) => m !== optimisticMessage,
    );
    showToast(err?.response?.data?.message ?? "Gagal mengirim pesan", {
      type: "error",
      position: "top-center",
    });
  }
};

// Mutation untuk create follow-up
const createFuMutation = useMutation({
  mutationFn: (data: any) => createFollowUp(data),
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["crm-donor-detail", donorProfileId.value],
    });
    showFuModal.value = false;
    resetFuForm();
    showToast("Follow up berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal menambahkan follow up", {
      type: "error",
      position: "top-center",
    });
  },
});

// Mutation untuk update status follow-up
const updateStatusFuMutation = useMutation({
  mutationFn: ({ id, status }: { id: number; status: string }) =>
    updateStatusFollowUp(id, { status }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["crm-donor-detail", donorProfileId.value],
    });
    showToast("Status follow up berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal memperbarui status", {
      type: "error",
      position: "top-center",
    });
  },
});

// Handle create follow-up
const handleCreateFollowUp = async () => {
  if (!fuForm.value.jenis.trim()) {
    showToast("Jenis follow up tidak boleh kosong", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (!fuForm.value.scheduled_date) {
    showToast("Jadwal tindakan harus dipilih", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  isSubmittingFu.value = true;
  try {
    await createFuMutation.mutateAsync({
      jenis: fuForm.value.jenis,
      channel: fuForm.value.channel,
      template_id: fuForm.value.template_id,
      scheduled_date: fuForm.value.scheduled_date,
      waktu_slot: fuForm.value.waktu_slot,
      assigned_user_id: fuForm.value.assigned_user_id,
      note: fuForm.value.note,
      donor_profile_id: donorProfileId.value,
      transaction_id: transactionId.value || null,
      // lead_profile_id: null,
    });
  } finally {
    isSubmittingFu.value = false;
  }
};

// Handle update status follow-up
const updateFollowUpStatus = async (fuId: number, status: string) => {
  try {
    await updateStatusFuMutation.mutateAsync({
      id: fuId,
      status,
    });
  } catch {
    // Error handled in mutation error callback
  }
};

// Handle send follow-up message
const handleSendFollowUp = async (fu: any) => {
  if (!fu.template_id) {
    showToast("Pilih template WA terlebih dahulu", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  isSendingFu.value = true;
  try {
    // Send message via template
    const templateText = fu.jenis; // Fallback ke jenis jika tidak ada template content
    activeTab.value = "chat";

    await handleSend(templateText, fu.template_id);

    // Update status to selesai after sending
    await updateStatusFuMutation.mutateAsync({
      id: fu.id,
      status: "selesai",
    });

    showToast("Pesan berhasil dikirim", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    showToast(err?.response?.data?.message ?? "Gagal mengirim pesan", {
      type: "error",
      position: "top-center",
    });
  } finally {
    isSendingFu.value = false;
  }
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
</script>
