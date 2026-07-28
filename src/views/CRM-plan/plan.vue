<template>
  <VerticalLayout>
    <b-card>
      <b-row>
        <b-col>
          <h5 class="mb-1">Plan — Donatur Belum Transfer</h5>
          <p class="text-muted mb-0">{{ planCards.length }} kartu aktif</p>
        </b-col>
        <b-col class="text-end">
          <div class="btn-group" role="group">
            <button
              class="btn btn-sm rounded-pill me-2"
              :class="
                selectedDay === 'today'
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="selectedDay = 'today'"
            >
              <i class="bx bx-calendar-check me-1"></i>
              Hari Ini
            </button>

            <button
              class="btn btn-sm rounded-pill me-2"
              :class="
                selectedDay === 'yesterday'
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="selectedDay = 'yesterday'"
            >
              <i class="bx bx-history me-1"></i>
              Kemarin
            </button>

            <button
              class="btn btn-sm rounded-pill"
              :class="
                selectedDay === 'tomorrow'
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="selectedDay = 'tomorrow'"
            >
              <i class="bx bx-calendar-plus me-1"></i>
              Besok
            </button>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <b-row class="g-1">
      <b-col xxl="4">
        <PlanCardList
          :cards="planCards"
          :selected-id="selectedId"
          @select="selectedId = $event"
        />
      </b-col>

      <b-col xxl="8">
        <b-card no-body class="h-100" v-if="selectedCard">
          <b-card-header
            class="d-flex flex-wrap align-items-center justify-content-between gap-2"
          >
            <div class="d-flex align-items-center">
              <div
                class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold"
                :class="`bg-soft-${selectedCard.colorVariant} text-${selectedCard.colorVariant}`"
                style="width: 34px; height: 34px"
              >
                {{ selectedCard.initials }}
              </div>
              <div class="ms-2">
                <h6 class="my-0 fs-15 fw-semibold">
                  {{ selectedCard.name }}
                  <b-badge
                    :variant="null"
                    class="badge-soft-secondary fw-normal fs-11 ms-1"
                    >{{ selectedCard.stage }}</b-badge
                  >
                </h6>
                <p class="mb-0 text-muted fs-12">{{ selectedCard.phone }}</p>
              </div>
            </div>

            <div class="btn-group" role="group">
              <button
                type="button"
                class="btn btn-sm rounded-pill me-2"
                :class="
                  activeTab === 'detail'
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
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

          <PlanDetailTab v-if="activeTab === 'detail'" :card="selectedCard" />
          <PlanChatTab v-else :card="selectedCard" @send="handleSendMessage" />
        </b-card>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";

import PlanCardList from "./components/PlanCardList.vue";
import PlanDetailTab from "./components/PlanDetailTab.vue";
import PlanChatTab from "./components/PlanChatTab.vue";

import { planCards } from "./components/data";

const selectedId = ref<number | null>(planCards[0]?.id ?? null);
const activeTab = ref<"detail" | "chat">("detail");
const selectedDay = ref("today");

const selectedCard = computed(
  () => planCards.find((card) => card.id === selectedId.value) ?? null,
);

const handleSendMessage = (text: string) => {
  if (!selectedCard.value) return;
  selectedCard.value.chatMessages.push({
    text,
    isSender: true,
    timeStamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
};
</script>
