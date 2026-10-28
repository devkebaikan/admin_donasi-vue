<template>
  <div class="rounded-3 mb-3">
    <h6 class="fs-11 fw-semibold text-uppercase mb-2" style="color: #6b8bb5">
      <i class="bx bx-receipt me-1"></i>Transaksi Saat Ini
    </h6>

    <p v-if="pipelineCase?.keterangan" class="mb-2 fs-12 text-muted fst-italic">
      <i class="bx bx-message-square-detail me-1"></i
      >{{ pipelineCase.keterangan }}
    </p>

    <div v-if="isTransactionLoading" class="text-center p-3">
      <b-spinner small variant="primary" />
    </div>
    <p v-else-if="!transaction" class="text-muted fs-13 mb-0">
      Detail transaksi tidak tersedia
    </p>
    <div v-else class="border rounded-2 p-2 bg-body-tertiary">
      <div
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2"
      >
        <span class="font-monospace fw-semibold small">{{
          transaction.invoice || "-"
        }}</span>
        <div class="d-flex align-items-center gap-2">
          <b-badge
            :variant="null"
            class="fw-medium fs-10"
            :class="`badge-soft-${transactionStatusVariant(transaction.status)}`"
          >
            {{ transaction.status || "-" }}
          </b-badge>
        </div>
      </div>

      <b-row class="g-2">
        <b-col cols="12" md="4">
          <div class="bg-light rounded-2 p-2 h-100">
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Jenis donasi</span>
              <span class="fw-semibold small text-end">{{
                transaction.transaction_type?.name ||
                currentTransactionDetails?.[0]?.detail_type ||
                "-"
              }}</span>
            </div>
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Nama program</span>
              <span
                class="fw-semibold small text-end"
                style="max-width: 60%"
                :title="
                  currentTransactionDetails
                    ?.map((td) => td.program?.name)
                    .filter(Boolean)
                    .join(', ') || '-'
                "
              >
                {{
                  currentTransactionDetails
                    ?.map((td) => td.program?.name)
                    .filter(Boolean)
                    .join(", ") || "-"
                }}
              </span>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <span class="text-muted small">Nominal</span>
              <span
                class="fw-semibold small text-success font-monospace text-end"
                >{{
                  formatCurrency(
                    currentTransactionDetails?.[0]?.gross_nominal ??
                      transaction.total,
                  )
                }}</span
              >
            </div>
          </div>
        </b-col>

        <b-col cols="12" md="4">
          <div class="bg-light rounded-2 p-2 h-100">
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Tgl donasi</span>
              <span class="fw-semibold small text-end"
                >{{ formatDate(transaction.date)
                }}{{ transactionTime ? ` · ${transactionTime}` : "" }}</span
              >
            </div>
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Atas nama</span>
              <span class="fw-semibold small text-end">{{
                transaction.anonim ? "Anonim" : transaction.user?.name || "-"
              }}</span>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <span class="text-muted small">Doa</span>
              <span
              class="fw-semibold small text-end rounded-2 bg-white p-1"
              v-if="(transaction as any).doa"
              style="max-width: 80%;font-style: italic;"
                :title="(transaction as any).doa"
              >
                {{ (transaction as any).doa }}
              </span>
              <span v-else class="fw-semibold small text-end">-</span>  
            </div>
          </div>
        </b-col>

        <b-col cols="12" md="4">
          <div class="bg-light rounded-2 p-2 h-100">
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Bank</span>
              <span class="fw-semibold small text-end">{{
                transaction.payment_method?.bank_name ||
                transaction.payment_method?.bank_provider ||
                "-"
              }}</span>
            </div>
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Channel</span>
              <span class="fw-semibold small text-end">{{
                (transaction as any).channel || transaction.source || "-"
              }}</span>
            </div>
            <div class="d-flex justify-content-between gap-2 mb-1">
              <span class="text-muted small">Tgl approve</span>
              <span class="fw-semibold small text-end">{{
                formatDate((transaction as any).approved_at)
              }}</span>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <span class="text-muted small">Approve by</span>
              <span class="fw-semibold small text-end">{{
                (transaction as any).approved_by?.name ||
                (transaction as any).approved_by?.username ||
                (transaction as any).approved_by ||
                (transaction as any).approved_by_name ||
                (transaction as any).approver_name ||
                "-"
              }}</span>
            </div>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>

  <!-- Project -->
  <div class="rounded-3 mb-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="fs-11 fw-semibold text-uppercase mb-0 text-info">
        <i class="bx bx-folder-open me-1"></i>Sudah Masuk Project
      </h6>
      <b-button
        v-if="
          transaction?.status === 'Paid' &&
          currentTransactionDetails[0]?.project == null
        "
        size="sm"
        :variant="null"
        class="btn-outline-info rounded-pill fs-10"
        @click="$emit('open-project')"
      >
        <i class="bx bx-plus me-1"></i>Masukan ke Project
      </b-button>
    </div>

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
          <h6 class="mb-0 fs-13 fw-semibold">{{ td.project?.judul ?? "-" }}</h6>
          <p class="mb-0 text-muted fs-11">
            Program : {{ td.program?.name ?? "-" }} ·
            {{ formatCurrency(td.nominal) }}
          </p>
          <!-- Link -->
           <div class="mt-2">
             <a
             :href="`https://beramalbersama.com/project/${td.project?.id}`"
             target="_blank"
             rel="noopener noreferrer"
             class="small text-break"
             >
             beramalbersama.com/project/{{ td.project?.id }}
             <i class="bx bx-link-external ms-1"></i>
            </a>
          </div>
        </div>
        <b-badge
          :variant="null"
          class="fw-medium fs-11 badge-soft-cyan flex-shrink-0 ms-2"
        >
          {{ td.activity }}
        </b-badge>
      </div>
    </template>
    <p v-else class="text-muted fs-13 mb-0">Belum masuk project</p>
  </div>

  <!-- Kegiatan -->
  <div class="rounded-3 mb-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="fs-11 fw-semibold text-uppercase mb-0" style="color: #4e9c82">
        <i class="bx bx-news me-1"></i>Update Kegiatan
      </h6>

      <div v-if="currentTransactionDetails[0]?.project?.id">
        <a
          :href="`kegiatan?project_id=${currentTransactionDetails[0].project.id}`"
          target="_blank"
          rel="noopener noreferrer"
          class="small text-break"
        >
          Lihat detail Kegiatan
          <i class="bx bx-link-external ms-1"></i>
        </a>
      </div>
    </div>
    
    <div v-if="isReportLoading" class="text-center p-3">
      <b-spinner small variant="primary" />
    </div>
    <template v-else-if="reportList.length">
      <div
        v-for="(report, idx) in reportList"
        :key="report.id"
        class="d-flex align-items-center justify-content-between p-3 rounded-1"
        :class="idx ? 'mt-2' : ''"
        style="background-color: #eaf8f3"
      >
        <div class="flex-grow-1 overflow-hidden me-2">
          <p class="mb-0 fs-12 fw-semibold text-truncate">{{ report.kegiatan?.nama ?? '-' }}</p>
          <p class="mb-0 text-muted fs-11">
            {{ report.type }}
            <template v-if="report.link_ig">
              · <a :href="report.link_ig" target="_blank" rel="noopener noreferrer" class="text-info">IG</a>
            </template>
          </p>
        </div>
        <b-button
          size="sm"
          variant="outline-success"
          class="d-inline-flex align-items-center gap-1 fs-11 flex-shrink-0"
          title="Kirim laporan ke WhatsApp"
          @click="$emit('send-report-fu', report)"
        >
          <i class="bx bxl-whatsapp fs-14"></i>
          Kirim Laporan
        </b-button>
      </div>
    </template>
    <p v-else class="text-muted fs-13 mb-0">Belum ada laporan</p>
  </div>
</template>

<script setup lang="ts">
import type {
  CrmPipelineCase,
  CrmTransactionDetail,
  CrmTransactionDetailItem,
} from "@/types/crm";

defineEmits<{
  (e: "open-project"): void;
  (e: "send-report-fu", report: Record<string, any>): void;
}>();

defineProps<{
  pipelineCase: CrmPipelineCase | null;
  isTransactionLoading: boolean;
  transaction: CrmTransactionDetail | null | undefined;
  transactionTime: string;
  currentTransactionDetails: CrmTransactionDetailItem[];
  reportList: Record<string, any>[];
  isReportLoading: boolean;
  formatCurrency: (value: string | number) => string;
  formatDate: (value: string | Date | null | undefined) => string;
  transactionStatusVariant: (status?: string) => string;
}>();
</script>
