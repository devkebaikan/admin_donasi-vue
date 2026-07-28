<template>
  <b-card-body class="pb-2">
    <!-- Hard rules notice -->
    <div
      class="border-start border-4 border-danger bg-danger-subtle rounded-2 py-2 px-3 mb-3"
    >
      <div class="d-flex align-items-center gap-2 mb-1">
        <i class="bx bx-error-circle text-danger fs-16"></i>
        <span class="fw-semibold fs-13 text-danger text-uppercase"
          >Aturan Keras — Donatur {{ card.tags[0]?.label?.toUpperCase() }}</span
        >
      </div>
      <ol class="mb-0 ps-3 fs-13 text-danger">
        <li v-for="(rule, idx) in hardRules" :key="idx" class="py-1">
          {{ rule }}
        </li>
      </ol>
    </div>

    <!-- Profile + stats summary -->
    <div class="bg-light bg-opacity-50 rounded-3 p-3 mb-3">
      <div class="d-flex align-items-start gap-2 mb-3">
        <div
          class="avatar-title rounded-circle flex-shrink-0 fs-16 fw-semibold"
          :class="`bg-soft-${card.colorVariant} text-${card.colorVariant}`"
          style="width: 46px; height: 46px"
        >
          {{ card.initials }}
        </div>
        <div>
          <h6 class="mb-1 fs-15 fw-semibold">
            {{ card.name }}
            <span class="text-muted fw-normal" v-if="card.nickname"
              >({{ card.nickname }})</span
            >
          </h6>
          <p class="mb-2 text-muted fs-13">
            {{ card.phone
            }}<template v-if="card.city"> · {{ card.city }}</template
            ><template v-if="card.occupation">
              · {{ card.occupation }}</template
            >
          </p>
          <div class="d-flex flex-wrap gap-1">
            <b-badge
              v-for="(tag, idx) in card.tags"
              :key="idx"
              :variant="null"
              class="fw-normal fs-11"
              :class="`badge-soft-${tag.variant}`"
            >
              {{ tag.label }}
            </b-badge>
          </div>
        </div>
      </div>

      <div class="d-flex text-center border-top pt-2">
        <div class="flex-fill border-end">
          <p class="text-muted fs-11 text-uppercase mb-1">Total Donasi</p>
          <h6 class="mb-0 fs-14 fw-semibold">{{ card.stats.totalDonasi }}</h6>
        </div>
        <div class="flex-fill border-end">
          <p class="text-muted fs-11 text-uppercase mb-1">Donasi Ke</p>
          <h6 class="mb-0 fs-14 fw-semibold">{{ card.stats.donasiKe }}</h6>
        </div>
        <div class="flex-fill">
          <p class="text-muted fs-11 text-uppercase mb-1">Terakhir</p>
          <h6 class="mb-0 fs-14 fw-semibold">{{ card.stats.terakhir }}</h6>
        </div>
      </div>
    </div>

    <!-- Project Salur -->
    <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-2">
      Project Salur
    </h6>
    <div
      v-if="!card.project"
      class="d-flex align-items-start gap-2 bg-warning-subtle text-warning rounded-2 py-2 px-3 mb-3 fs-13"
    >
      <i class="bx bx-error fs-16 mt-1"></i>
      <span
        ><span class="fw-semibold">Belum ada project.</span>
        {{ card.projectNote }}</span
      >
    </div>
    <p v-else class="mb-3">{{ card.project }}</p>

    <hr class="my-3" />

    <!-- Riwayat Donasi -->
    <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-2">
      Riwayat Donasi
    </h6>
    <div v-if="card.donationHistory.length" class="mb-3">
      <div
        v-for="(item, idx) in card.donationHistory"
        :key="idx"
        class="d-flex align-items-center justify-content-between py-2"
        :class="idx && 'border-top'"
      >
        <div>
          <h6 class="mb-0 fs-14 fw-semibold">{{ item.amount }}</h6>
          <p class="mb-0 text-muted fs-12">
            {{ item.bank }} · {{ item.project }}
          </p>
        </div>
        <div class="text-end flex-shrink-0 ms-2">
          <p class="mb-1 text-muted fs-12">{{ item.date }}</p>
          <b-badge
            :variant="null"
            class="fw-normal fs-11"
            :class="
              item.status === 'sukses'
                ? 'badge-soft-success'
                : item.status === 'pending'
                  ? 'badge-soft-warning'
                  : 'badge-soft-danger'
            "
          >
            {{ item.status }}
          </b-badge>
        </div>
      </div>
    </div>
    <p v-else class="text-muted fs-13 mb-3">Belum ada riwayat donasi</p>

    <hr class="my-3" />

    <!-- Riwayat Follow Up -->
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-0">
        Riwayat Follow Up
      </h6>
      <b-button
        size="sm"
        :variant="null"
        class="btn-outline-secondary rounded-pill fs-12"
      >
        <i class="bx bx-plus me-1"></i>Tambah FU
      </b-button>
    </div>
    <div v-if="card.followUps.length" class="mb-2">
      <div
        v-for="(fu, idx) in card.followUps"
        :key="idx"
        class="d-flex align-items-center justify-content-between py-2"
        :class="idx && 'border-top'"
      >
        <div>
          <h6 class="mb-0 fs-14 fw-semibold">{{ fu.title }}</h6>
          <p class="mb-0 text-muted fs-12">{{ fu.date }} · {{ fu.note }}</p>
        </div>
        <div class="d-flex gap-1 flex-shrink-0 ms-2">
          <b-button size="sm" variant="primary" class="fs-12">
            <i class="bx bx-send me-1"></i>Kirim
          </b-button>
          <b-button size="sm" :variant="null" class="btn-outline-secondary">
            <i class="bx bx-check"></i>
          </b-button>
        </div>
      </div>
    </div>
    <p v-else class="text-muted fs-13">Belum ada follow up</p>
  </b-card-body>

  <div class="border-top p-2 d-flex flex-wrap align-items-center gap-2">
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
</template>

<script setup lang="ts">
import type { PlanCardType } from "@/views/plan/components/types";

const hardRules = [
  "Jangan langsung tawaran program baru sebelum konfirmasi project lama selesai",
  "DILARANG menyebut jumlah donatur lain sebagai tekanan sosial",
  "Jika donatur menolak FU, beri jeda minimal 7 hari sebelum kontak ulang",
  "Jangan meremehkan nominal donasi — semua nominal bernilai sama di sisi Allah",
];

defineProps<{
  card: PlanCardType;
}>();
</script>
