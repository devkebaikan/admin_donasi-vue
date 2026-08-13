<template>
  <div class="rounded-3 mb-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="fs-11 fw-semibold text-uppercase mb-0" style="color: #b3903f">
        <i class="bx bx-calendar-check me-1"></i>Riwayat Follow Up
      </h6>
      <b-button
        size="sm"
        :variant="null"
        class="btn-outline-secondary rounded-pill fs-10"
        @click="$emit('add-follow-up')"
      >
        <i class="bx bx-plus me-1"></i>Tambah FU
      </b-button>
    </div>
    <div v-if="detail.follow_ups.length" style="background-color: #fdf5e7">
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
            @click="$emit('send-follow-up', fu)"
            title="Kirim pesan sesuai template"
          >
            <i class="bx bx-send fs-12" style="transform: rotate(-45deg)"></i>
            Kirim
          </b-button>
          <b-button
            v-if="fu.status !== 'selesai' && fu.status !== 'batal'"
            size="sm"
            variant="outline-success"
            class="fs-10"
            @click="
              $emit('set-follow-up-status', { id: fu.id, status: 'selesai' })
            "
            title="Kirim pesan sesuai template"
          >
            <i class="bx bx-check fs-12"></i>
          </b-button>
          <b-button
            v-if="fu.status !== 'selesai' && fu.status !== 'batal'"
            size="sm"
            variant="outline-danger"
            class="fs-10"
            @click="
              $emit('set-follow-up-status', { id: fu.id, status: 'batal' })
            "
            title="Kirim pesan sesuai template"
          >
            <i class="bx bx-undo fs-12"></i>
          </b-button>
        </div>
      </div>
    </div>
    <p v-else class="text-muted fs-13 mb-0">Belum ada follow up</p>
  </div>
</template>

<script setup lang="ts">
import type { CrmDonorDetail, CrmFollowUp } from "@/types/crm";

defineEmits<{
  (e: "add-follow-up"): void;
  (e: "send-follow-up", followUp: CrmFollowUp): void;
  (e: "set-follow-up-status", payload: { id: number; status: string }): void;
}>();

defineProps<{
  detail: CrmDonorDetail;
  isSendingFu: boolean;
  formatDate: (value: string | Date | null | undefined) => string;
  followUpStatusVariant: (status: string) => string;
}>();
</script>
