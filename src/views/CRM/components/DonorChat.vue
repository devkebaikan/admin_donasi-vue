<template>
  <div class="d-flex flex-column h-100 overflow-hidden">
    <div
      class="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
    >
      <div class="d-flex align-items-center">
        <!-- <i class="bx bxl-whatsapp text-success fs-2 me-2"></i> -->

        <h6 class="mb-0 fs-14 fw-semibold">
          {{ card.nickname || card.name }}
          <span class="text-muted fw-normal fs-12 d-block">{{
            card.phone
          }}</span>
        </h6>
      </div>
      <b-form-select
        v-model="waAccount"
        :options="['Official WA', 'CS Pribadi']"
        size="sm"
        class="w-auto"
      />
    </div>

    <div v-if="templates.length" class="p-3 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="text-muted fs-12 mb-0 d-flex align-items-center">
          <i class="bx bx-message-square-dots fs-15 me-1"></i>Template Pesan
          Cepat
        </p>

        <b-spinner v-if="isRendering" small variant="primary" />
      </div>

      <div class="d-flex flex-wrap gap-2">
        <b-button
          v-for="tpl in templates"
          :key="tpl.id"
          size="sm"
          :variant="selectedTemplateId === tpl.id ? 'primary' : 'light'"
          class="rounded-pill fs-11 border d-inline-flex align-items-center"
          :disabled="isRendering"
          @click="selectedTemplateId = tpl.id"
        >
          <i
            :class="selectedTemplateId === tpl.id ? 'bx bx-check' : ''"
            class="me-1"
          ></i>
          {{ tpl.name }}
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
        <i class="bx bxl-whatsapp fs-1 text-success mb-2"></i>
        <p class="mb-0">Belum ada chat</p>
      </div>

      <ul class="list-unstyled mb-0" v-else>
        <li
          v-for="(msg, idx) in card.chatMessages"
          :key="idx"
          class="d-flex mb-3"
          :class="
            msg.from_role !== `donor`
              ? 'justify-content-end'
              : 'justify-content-start'
          "
        >
          <div
            class="rounded-3 shadow-sm px-3 py-2"
            style="max-width: 75%; white-space: pre-line"
            :style="{
              backgroundColor:
                msg.from_role !== `donor` ? '#d9fdd3' : '#ffffff',
              color: '#111b21',
            }"
          >
            <p class="mb-1" v-html="formatWhatsAppMessage(msg.message)"></p>

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
            <!-- <b-form-input
              v-model="message"
              placeholder="Tulis pesan..."
              style="height: 48px"
            /> -->
            <b-form-textarea
              v-model="message"
              placeholder="Tulis pesan..."
              rows="4"
              max-rows="5"
              no-resize
            />
          </b-col>
          <b-col cols="auto" class="align-self-end">
            <b-button-group>
              <b-button :variant="null" class="btn-light" title="Salin pesan">
                <i class="bx bx-copy fs-18"></i>
              </b-button>
              <b-button type="submit" variant="primary" title="Kirim pesan">
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
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import simplebar from "simplebar-vue";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import {
  getCrmChatTemplateById,
  getCrmChatTemplatesByStage,
} from "@/services/crmService";
import type { CrmChatCard, CrmChatTemplate } from "@/types/crm";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);

const props = defineProps<{
  card: CrmChatCard;
}>();

const emit = defineEmits<{
  send: [text: string, templateId: number | null];
}>();

const message = ref("");
const waAccount = ref(props.card.waAccount || "Official WA");

const stageId = computed(() => props.card.pipelineStageId ?? 0);

const formatWhatsAppMessage = (text: string) => {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, "<del>$1</del>")
    .replace(/\n/g, "<br>");
};

const { data: templatesRaw } = useQuery({
  queryKey: computed(() => ["crm-chat-templates", stageId.value]),
  queryFn: () => getCrmChatTemplatesByStage(stageId.value),
  enabled: computed(() => stageId.value > 0),
});
const templates = computed<CrmChatTemplate[]>(() =>
  Array.isArray(templatesRaw.value) ? templatesRaw.value : [],
);

const selectedTemplateId = ref<number | null>(null);
const isRendering = ref(false);

watch(selectedTemplateId, async (templateId) => {
  if (!templateId) return;
  isRendering.value = true;
  try {
    const rendered = await getCrmChatTemplateById(templateId, {
      transaction_id: props.card.transactionId,
    });
    if (rendered?.rendered_content) {
      message.value = rendered.rendered_content;
    } else {
      showToast("Gagal memuat template pesan", {
        type: "error",
        position: "top-center",
      });
    }
  } finally {
    isRendering.value = false;
  }
});

watch(
  () => props.card.id,
  () => {
    waAccount.value = props.card.waAccount || "Official WA";
    message.value = "";
    selectedTemplateId.value = null;
  },
);

const handleSend = () => {
  if (!message.value.trim()) return;
  emit("send", message.value.trim(), selectedTemplateId.value);
  message.value = "";
  selectedTemplateId.value = null;
};
</script>
