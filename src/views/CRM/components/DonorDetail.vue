<template>
  <b-card no-body class="h-100 d-flex flex-column" style="margin-bottom: 0">
    <div v-if="!card" class="text-center p-5 text-muted flex-grow-1">
      <i class="bx bx-user-circle fs-1 mb-2 d-block"></i>
      Pilih donatur di sebelah kiri untuk melihat detail
    </div>

    <template v-else>
      <b-card-header
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 flex-shrink-0"
      >
        <div class="d-flex align-items-center">
          <div
            class="avatar-title rounded-circle flex-shrink-0 fs-12 fw-semibold"
            :class="`bg-soft-${card.colorVariant} text-${card.colorVariant}`"
            style="width: 30px; height: 30px"
          >
            {{ card.initials }}
          </div>
          <div class="ms-2">
            <h6 class="my-0 fs-13 fw-semibold">
              {{ card.name }}
              <b-badge
                v-if="card.stage"
                :variant="null"
                class="badge-soft-secondary fw-normal fs-10 ms-1"
              >
                {{ card.stage }}
              </b-badge>
            </h6>
            <p class="mb-0 text-muted fs-11">{{ card.phone }}</p>
          </div>
        </div>

        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-sm rounded-pill me-2"
            :class="
              activeTab === 'detail' ? 'btn-primary' : 'btn-outline-secondary'
            "
            @click="activeTab = 'detail'"
          >
            <i class="bx bx-id-card me-1"></i>Detail
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-pill"
            :class="
              activeTab === 'chat' ? 'btn-primary' : 'btn-outline-secondary'
            "
            @click="activeTab = 'chat'"
          >
            <i class="bxl-whatsapp me-1"></i>Chat WA
          </button>
        </div>
      </b-card-header>

      <!-- ============ Tab: Detail ============
           Semua kondisi tampilan detail donatur ada di sini (satu file) —
           tambahkan/ubah section di bawah ini saat integrasi API. -->
      <div
        v-if="activeTab === 'detail'"
        class="flex-grow-1"
        style="min-height: 0; overflow-y: auto"
      >
        <div v-if="isDetailLoading" class="text-center p-4">
          <b-spinner small />
          <p class="mt-2 text-muted small mb-0">Memuat detail...</p>
        </div>

        <b-card-body v-else-if="displayCard" class="pb-2">
          <!-- Hard rules notice -->
          <div
            v-if="displayCard.hardRules?.length"
            class="border-start border-4 border-danger bg-danger-subtle rounded-2 py-2 px-3 mb-3"
          >
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bx bx-error-circle text-danger fs-16"></i>
              <span class="fw-semibold fs-13 text-danger text-uppercase"
                >Aturan Keras — Donatur
                {{ displayCard.tags?.[0]?.label?.toUpperCase() }}</span
              >
            </div>
            <ol class="mb-0 ps-3 fs-13 text-danger">
              <li v-for="(rule, idx) in displayCard.hardRules" :key="idx" class="py-1">
                {{ rule }}
              </li>
            </ol>
          </div>

          <!-- Profile + stats summary -->
          <div class="bg-light bg-opacity-50 rounded-3 p-2 mb-3">
            <div class="d-flex align-items-start gap-2 mb-2">
              <div
                class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold"
                :class="`bg-soft-${displayCard.colorVariant} text-${displayCard.colorVariant}`"
                style="width: 38px; height: 38px"
              >
                {{ displayCard.initials }}
              </div>
              <div>
                <h6 class="mb-1 fs-13 fw-semibold">
                  {{ displayCard.name }}
                  <span class="text-muted fw-normal" v-if="displayCard.nickname"
                    >({{ displayCard.nickname }})</span
                  >
                </h6>
                <p class="mb-2 text-muted fs-11">
                  {{ displayCard.phone
                  }}<template v-if="displayCard.city"> · {{ displayCard.city }}</template
                  ><template v-if="displayCard.occupation">
                    · {{ displayCard.occupation }}</template
                  >
                </p>
                <div v-if="displayCard.tags?.length" class="d-flex flex-wrap gap-1">
                  <b-badge
                    v-for="(tag, idx) in displayCard.tags"
                    :key="idx"
                    :variant="null"
                    class="fw-normal fs-10"
                    :class="`badge-soft-${tag.variant}`"
                  >
                    {{ tag.label }}
                  </b-badge>
                </div>
              </div>
            </div>

            <!-- <b-row v-if="displayCard.stats?.length" class="g-2 border-top pt-2">
              <b-col cols="4" v-for="(stat, idx) in displayCard.stats" :key="idx">
                <div class="text-center">
                  <p class="text-muted fs-10 text-uppercase mb-1">
                    {{ stat.label }}
                  </p>
                  <h6 class="mb-0 fs-13 fw-semibold">{{ stat.value }}</h6>
                </div>
              </b-col>
            </b-row> -->
          </div>

          <!-- Catatan kasus -->
          <div
            v-if="displayCard.note"
            class="d-flex align-items-start gap-2 bg-light rounded-2 py-2 px-3 mb-3 fs-13"
          >
            <i class="bx bx-note fs-16 mt-1 text-muted"></i>
            <span>{{ displayCard.note }}</span>
          </div>

          <!-- Project Salur -->
          <template v-if="displayCard.project !== undefined">
            <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-2">
              Project Salur
            </h6>
            <div
              v-if="!displayCard.project"
              class="d-flex align-items-start gap-2 bg-warning-subtle text-warning rounded-2 py-2 px-3 mb-3 fs-13"
            >
              <i class="bx bx-error fs-16 mt-1"></i>
              <span
                ><span class="fw-semibold">Belum ada project.</span>
                {{ displayCard.projectNote }}</span
              >
            </div>
            <p v-else class="mb-3">{{ displayCard.project }}</p>
            <hr class="my-3" />
          </template>

          <!-- Riwayat Donasi -->
          <!-- <template v-if="card.donationHistory !== undefined">
            <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-2">Riwayat Donasi</h6>
            <div v-if="card.donationHistory.length" class="mb-3">
              <div
                v-for="(item, idx) in card.donationHistory"
                :key="idx"
                class="d-flex align-items-center justify-content-between py-2"
                :class="idx && 'border-top'"
              >
                <div>
                  <h6 class="mb-0 fs-14 fw-semibold">{{ item.amount }}</h6>
                  <p class="mb-0 text-muted fs-12">{{ item.bank }} · {{ item.project }}</p>
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
          </template> -->

          <!-- Riwayat Follow Up -->
          <!-- <template v-if="card.followUps !== undefined">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="text-muted fs-11 fw-semibold text-uppercase mb-0">Riwayat Follow Up</h6>
              <b-button size="sm" :variant="null" class="btn-outline-secondary rounded-pill fs-12">
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
                  <p class="mb-0 text-muted fs-12">
                    <template v-if="fu.date">{{ fu.date }} · </template>{{ fu.note }}
                  </p>
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
          </template> -->
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
      </div>

      <!-- ============ Tab: Chat ============ -->
      <DonorChat
        v-else-if="displayCard"
        :card="displayCard"
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
import { getDonorDetail } from "@/services/crmService";
import { mergeDonorDetail } from "./adapters";
import DonorChat from "./DonorChat.vue";
import type { ChatMessageItem, CrmCaseCard } from "./types";

const props = defineProps<{
  card: CrmCaseCard | null;
}>();

const activeTab = ref<"detail" | "chat">("detail");
const localMessages = ref<ChatMessageItem[]>([]);

watch(
  () => props.card?.id,
  () => {
    activeTab.value = "detail";
    localMessages.value = [];
  },
);

// Data lanjutan (poin, hari tidak aktif, follow up, chat, dst) diambil di sini
// — bukan di useDonorsBoard — supaya gampang diubah/nambah endpoint lain
// khusus detail tanpa menyentuh composable list / halaman donors.vue.
const { data: detail, isLoading: isDetailLoading } = useQuery({
  queryKey: computed(() => ["crm-donor-detail", props.card?.id]),
  queryFn: () => getDonorDetail(props.card!.id),
  enabled: computed(() => !!props.card?.id),
});

const displayCard = computed<CrmCaseCard | null>(() => {
  if (!props.card) return null;
  const merged = detail.value ? mergeDonorDetail(props.card, detail.value) : props.card;
  if (!localMessages.value.length) return merged;
  return {
    ...merged,
    chatMessages: [...(merged.chatMessages ?? []), ...localMessages.value],
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
</script>
