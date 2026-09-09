<template>
  <div
    class="d-flex flex-column h-100 overflow-hidden"
    style="max-height: 84vh"
  >
    <!-- <div
      class="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
    >
      <div class="d-flex align-items-center">

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
    </div> -->

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
        <template v-for="(msg, idx) in processedMessages" :key="idx">
          <li v-if="shouldShowDateSeparator(idx)" class="text-center mb-3">
            <small class="badge bg-light text-muted">{{
              processedMessages[idx].dateLabel
            }}</small>
          </li>

          <li
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
              <div v-if="msg.templateName" class="mb-1">
                <small class="text-primary"
                  >Template: {{ msg.templateName }}</small
                >
              </div>

              <p class="mb-1" v-html="formatWhatsAppMessage(msg.message)"></p>

              <div class="small text-muted text-end">
                {{ msg.timeStamp || "Waktu tidak tersedia" }}
              </div>
            </div>
          </li>
        </template>
      </ul>
    </simplebar>

    <div class="bg-light bg-opacity-50 p-2">
      <form @submit.prevent="handleSend">
        <b-row class="align-items-center g-2">
          <b-col>
            <div class="position-relative">
              <b-form-input
                v-model="message"
                placeholder="Tulis pesan..."
                style="height: 48px; padding-right: 40px;"
                @click.self="isModalOpen = true"
              />
              <b-button
                variant="link"
                class="position-absolute end-0 top-50 translate-middle-y text-muted p-0 me-2"
                title="Perbesar / Lihat Pesan Menyeluruh"
                style="z-index: 5;"
                @click="isModalOpen = true"
              >
                <i class="bx bx-expand-alt fs-18"></i>
              </b-button>
            </div>
          </b-col>
          <b-col cols="auto" class="align-self-end">
            <b-button-group>
              <b-button :variant="null" class="btn-light" title="Salin pesan" @click="copyMessage">
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

    <!-- Modal Pesan Menyeluruh (Hanya untuk Menulis & Melihat Pesan Lebih Detail) -->
    <b-modal
      v-model="isModalOpen"
      title="Detail & Penulisan Pesan Menyeluruh"
      size="lg"
      centered
      hide-footer
    >
      <div class="d-flex flex-column gap-3">
        <div>
          <label class="form-label fw-semibold fs-13 mb-1">Isi Pesan Lengkap:</label>
          <b-form-textarea
            v-model="message"
            placeholder="Tulis atau edit pesan lengkap di sini..."
            rows="10"
            no-resize
          />
        </div>

        <div class="d-flex justify-content-end gap-2 mt-2">
          <b-button variant="primary" @click="isModalOpen = false">
            Selesai
          </b-button>
        </div>
      </div>
    </b-modal>
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
const isModalOpen = ref(false);

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
    isModalOpen.value = false;
  },
);

const handleSend = () => {
  if (!message.value.trim()) return;
  emit("send", message.value.trim(), selectedTemplateId.value);
  message.value = "";
  selectedTemplateId.value = null;
  isModalOpen.value = false;
};

const copyMessage = async () => {
  if (!message.value) return;
  try {
    await navigator.clipboard.writeText(message.value);
    showToast("Pesan berhasil disalin", {
      type: "success",
      position: "top-center",
    });
  } catch (err) {
    showToast("Gagal menyalin pesan", {
      type: "error",
      position: "top-center",
    });
  }
};

// Prepare messages: ensure timestamp/date exist and resolve template names
const processedMessages = computed(() => {
  const raw = props.card.chatMessages ?? [];
  const tplById = new Map<number, string>(
    (templates.value ?? []).map((t) => [t.id, t.name]),
  );

  return raw.map((m: any) => {
    const timeStamp = m.timeStamp
      ? m.timeStamp
      : new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

    // prefer explicit date fields, otherwise assume today's date
    let dateLabel = "";
    if (m.date) {
      try {
        dateLabel = new Date(m.date).toLocaleDateString("id-ID");
      } catch (e) {
        dateLabel = String(m.date);
      }
    } else if (m.created_at) {
      try {
        dateLabel = new Date(m.created_at).toLocaleDateString("id-ID");
      } catch (e) {
        dateLabel = String(m.created_at);
      }
    } else {
      dateLabel = new Date().toLocaleDateString("id-ID");
    }

    // resolve template name if message carries template id/name
    const maybeTid = m.template_id ?? m.templateId ?? m.template?.id;
    let templateName =
      m.template_name ?? m.templateName ?? m.template?.name ?? null;
    if (!templateName && maybeTid && tplById.has(Number(maybeTid))) {
      templateName = tplById.get(Number(maybeTid)) || null;
    }

    return {
      ...m,
      timeStamp,
      dateLabel,
      templateName,
    };
  });
});

const shouldShowDateSeparator = (idx: number) => {
  if (!processedMessages.value.length) return false;
  if (idx === 0) return true;
  const prev = processedMessages.value[idx - 1];
  const cur = processedMessages.value[idx];
  return prev.dateLabel !== cur.dateLabel;
};
</script>
