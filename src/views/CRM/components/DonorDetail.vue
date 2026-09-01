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
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 flex-shrink-0 border-bottom"
      >
        <div class="d-flex align-items-center">
          <div
            class="avatar-title rounded-circle flex-shrink-0 fs-12 fw-semibold"
            :style="`
              width: 32px;
              height: 32px;
              background-color: ${!detail.color_tag ? '#6c757d' : detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
              opacity: 0.5;
            `"
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
          <DonorDetailProfileSection
            :detail="detail"
            :userId="transaction?.user_id"
          />

          <DonorDetailTransactionSection
            :pipeline-case="pipelineCase"
            :is-transaction-loading="isTransactionLoading"
            :transaction="transaction"
            :transaction-time="transactionTime"
            :current-transaction-details="currentTransactionDetails"
            :kegiatan-list="kegiatanList"
            :is-kegiatan-loading="isKegiatanLoading"
            :format-currency="formatCurrency"
            :format-date="formatDate"
            :transaction-status-variant="transactionStatusVariant"
            @open-project="openProjectModal"
          />

          <DonorDetailFollowUpsSection
            :detail="detail"
            :is-sending-fu="isSendingFu"
            :format-date="formatDate"
            :follow-up-status-variant="followUpStatusVariant"
            @add-follow-up="openFollowUpModal"
            @send-follow-up="handleSendFollowUp"
            @set-follow-up-status="handleSetFollowUpStatus"
          />

          <DonorDetailDonationHistorySection
            :is-history-loading="isHistoryLoading"
            :donation-history="donationHistory"
            :transaction="transaction"
            :format-currency="formatCurrency"
            :format-date="formatDate"
            :transaction-status-variant="transactionStatusVariant"
          />
        </b-card-body>

        <div
          class="border-top py-2 px-4 d-flex flex-wrap align-items-center gap-2 sticky-bottom bg-white"
          style="position: absolute; bottom: 0; left: 0; right: 0"
        >
          <b-button
            size="sm"
            :variant="null"
            class="btn-outline-secondary d-inline-flex align-items-center"
            @click="openProfiling"
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

  <b-modal
    v-model="showProjectModal"
    title="Pilih Project"
    size="lg"
    centered
    @hidden="selectedProjectId = null"
  >
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h6 class="mb-0 fs-14">Pilih project untuk program ini</h6>
          <p class="mb-1 fs-12 text-muted">
            Jika project tidak ada, maka program ini belum memiliki project
            aktif. Silakan buat project baru di menu Project.
          </p>
        </div>
        <b-spinner v-if="isProjectsLoading" small />
      </div>

      <b-form-select
        v-model="selectedProjectId"
        :options="projectOptions"
        :disabled="isProjectsLoading || !projectOptions.length"
      />
    </div>

    <div
      v-if="!isProjectsLoading && !projects.length"
      class="text-muted fs-12 mb-3"
    >
      Tidak ada project ditemukan untuk program ini.
    </div>

    <div v-else-if="selectedProject" class="p-3 rounded-2 bg-light">
      <p class="mb-1 fw-semibold">Project terpilih</p>
      <p class="mb-1 fs-12">Judul Project : {{ selectedProject.judul }}</p>
      <p class="mb-0 fs-12">Status : {{ selectedProject.status }}</p>
    </div>

    <template #footer>
      <b-button variant="light" @click="showProjectModal = false"
        >Batal</b-button
      >
      <b-button
        variant="primary"
        :disabled="isProjectsLoading"
        @click="handleAssignProject"
      >
        Pilih Project
      </b-button>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
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
import { getProjects } from "@/services/projectService";
import { updateTransactionDetailProject } from "@/services/transactionService";
import {
  colorTagVariant,
  cycleStatusVariant,
  initialsOf,
} from "@/utils/crmAdapters";
import DonorChat from "./DonorChat.vue";
import DonorDetailProfileSection from "./donor-detail/DonorDetailProfileSection.vue";
import DonorDetailTransactionSection from "./donor-detail/DonorDetailTransactionSection.vue";
import DonorDetailFollowUpsSection from "./donor-detail/DonorDetailFollowUpsSection.vue";
import DonorDetailDonationHistorySection from "./donor-detail/DonorDetailDonationHistorySection.vue";
import type {
  ChatMessageItem,
  CrmChatCard,
  CrmKegiatan,
  CrmPipelineCase,
  CrmTransactionHistoryItem,
} from "@/types/crm";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();

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
    getCrmTransactions({
      user_id: transaction.value?.user_id,
      limit: 3,
      status: "Paid",
    }),
  enabled: computed(() => !!transaction.value?.user_id),
});
const donationHistory = computed<CrmTransactionHistoryItem[]>(
  () => donationHistoryRaw.value ?? [],
);

const openProfiling = () => {
  const profileUserId = Number(transaction.value?.user_id ?? 0);
  if (!profileUserId) {
    showToast("User ID untuk profiling belum tersedia", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  router.push({ name: "crm.profiling", params: { id: profileUserId } });
};

// Project/program tempat transaksi saat ini disalurkan — dari transaction_details
const currentTransactionDetails = computed(
  () => transaction.value?.transaction_details ?? [],
);
const currentTransactionDetailId = computed(() =>
  Number(currentTransactionDetails.value[0]?.id ?? 0),
);

// Ambil project_id pertama untuk cari update kegiatannya (umumnya 1 transaksi = 1 project)
const currentProjectId = computed(
  () => currentTransactionDetails.value[0]?.project_id ?? 0,
);

const showProjectModal = ref(false);
const selectedProjectId = ref<number | null>(null);

const currentProgramId = computed(
  () =>
    transaction.value?.program_id ??
    currentTransactionDetails.value[0]?.program?.id ??
    0,
);

const { data: projectsRaw, isLoading: isProjectsLoading } = useQuery({
  queryKey: computed(() => ["crm-projects-by-program", currentProgramId.value]),
  queryFn: () => getProjects({ program_id: currentProgramId.value }),
  enabled: computed(() => currentProgramId.value > 0 && showProjectModal.value),
});

const projects = computed(() => (projectsRaw.value ?? []) as any[]);
const projectOptions = computed(() => [
  { value: null, text: "- Pilih project -" },
  ...projects.value.map((project) => ({
    value: project.id,
    text: `${project.judul} · ${project.status ?? "-"}`,
  })),
]);

const selectedProject = computed(
  () =>
    projects.value.find((project) => project.id === selectedProjectId.value) ??
    null,
);

const openProjectModal = () => {
  if (!currentProgramId.value) {
    showToast("Donasi belum masuk program", {
      type: "error",
      position: "top-center",
    });
    return;
  }

  selectedProjectId.value = null;
  showProjectModal.value = true;
};

const openFollowUpModal = () => {
  showFuModal.value = true;
};

const assignProjectMutation = useMutation({
  mutationFn: ({ id, project_id }: { id: number; project_id: number }) =>
    updateTransactionDetailProject(id, { project_id }),
});

const handleAssignProject = async () => {
  if (!selectedProjectId.value) {
    showToast("Pilih project terlebih dahulu.", {
      type: "error",
      position: "top-center",
    });
    return;
  }

  if (!currentTransactionDetailId.value) {
    showToast("Detail transaksi tidak ditemukan.", {
      type: "error",
      position: "top-center",
    });
    return;
  }

  try {
    await assignProjectMutation.mutateAsync({
      id: currentTransactionDetailId.value,
      project_id: selectedProjectId.value,
    });

    await queryClient.invalidateQueries({
      queryKey: ["crm-transaction-detail", transactionId.value],
    });
    await queryClient.invalidateQueries({
      queryKey: ["crm-kegiatan", currentProjectId.value],
    });

    showProjectModal.value = false;
    showToast("Project berhasil di-assign ke detail transaksi", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    showToast(err?.response?.data?.message ?? "Gagal assign project", {
      type: "error",
      position: "top-center",
    });
  }
};

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

const handleSetFollowUpStatus = async (payload: {
  id: number;
  status: string;
}) => {
  await updateFollowUpStatus(payload.id, payload.status);
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
