<template>
  <div class="d-flex flex-column h-100">
    <div
      class="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
    >
      <div class="d-flex align-items-center">
        <i class="bxl-whatsapp text-success fs-20 me-2"></i>
        <h6 class="mb-0 fs-14 fw-semibold">
          WA — {{ card.nickname || card.name }} ({{ card.phone }})
        </h6>
      </div>
      <b-form-select
        v-model="waAccount"
        :options="[card.waAccount ?? 'Official WA', 'CS Pribadi']"
        size="sm"
        class="w-auto"
      />
    </div>

    <div v-if="card.quickTemplates?.length" class="p-3 border-bottom">
      <p class="text-muted fs-13 mb-2">Template Pesan Cepat</p>
      <div class="d-flex flex-wrap gap-2">
        <b-button
          v-for="tpl in card.quickTemplates"
          :key="tpl"
          size="sm"
          :variant="null"
          class="btn-outline-secondary rounded-pill fs-12"
          @click="message = tpl"
        >
          {{ tpl }}
        </b-button>
      </div>
    </div>

    <simplebar
      class="flex-grow-1 p-3"
      data-simplebar
      style="min-height: 0; background: #efeae2"
    >
      <div
        v-if="!card.chatMessages?.length"
        class="d-flex flex-column justify-content-center align-items-center h-100 text-muted"
      >
        <i class="bx bx-message-detail fs-1 text-success mb-2"></i>
        <p class="mb-0">Belum ada chat</p>
      </div>

      <ul class="list-unstyled mb-0" v-else>
        <li
          v-for="(msg, idx) in card.chatMessages"
          :key="idx"
          class="d-flex mb-3"
          :class="
            msg.isSender ? 'justify-content-end' : 'justify-content-start'
          "
        >
          <div
            class="rounded-3 shadow-sm px-3 py-2"
            style="max-width: 75%"
            :style="{
              backgroundColor: msg.isSender ? '#d9fdd3' : '#ffffff',
              color: '#111b21',
            }"
          >
            <p class="mb-1">{{ msg.text }}</p>

            <div v-if="msg.timeStamp" class="small text-muted text-end">
              {{ msg.timeStamp }}
            </div>
          </div>
        </li>
      </ul>
    </simplebar>

    <div class="bg-light bg-opacity-50 p-2">
      <form @submit.prevent="handleSend">
        <b-row class="align-items-center g-2">
          <b-col>
            <b-form-input v-model="message" placeholder="Tulis pesan..." />
          </b-col>
          <b-col cols="auto">
            <b-button-group>
              <b-button :variant="null" class="btn-light">
                <i class="bx bx-copy fs-18"></i>
              </b-button>
              <b-button type="submit" variant="primary">
                <i class="bx bx-send fs-18"></i>
              </b-button>
            </b-button-group>
          </b-col>
        </b-row>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import simplebar from "simplebar-vue";
import type { CrmChatCard } from "./types";

const props = defineProps<{
  card: CrmChatCard;
}>();

const emit = defineEmits<{
  send: [text: string];
}>();

const message = ref("");
const waAccount = ref(props.card.waAccount);

watch(
  () => props.card.id,
  () => {
    waAccount.value = props.card.waAccount;
    message.value = "";
  },
);

const handleSend = () => {
  if (!message.value.trim()) return;
  emit("send", message.value.trim());
  message.value = "";
};
</script>
