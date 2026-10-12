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

    <div v-if="allTemplates.length" class="p-3 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="text-muted fs-12 mb-0 d-flex align-items-center">
          <i class="bx bx-message-square-dots fs-15 me-1"></i>Template Pesan Cepat
        </p>

        <b-spinner v-if="isRendering" small variant="primary" />
      </div>

      <div class="d-flex flex-wrap gap-2">
        <b-button
          v-for="tpl in allTemplates"
          :key="tpl.id"
          size="sm"
          :variant="selectedTemplateId === tpl.id ? 'primary' : 'light'"
          class="rounded-pill fs-11 border d-inline-flex align-items-center"
          :disabled="isRendering"
          @click="selectTemplate(tpl.id)"
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
              <div
                v-if="msg.from_role !== 'donor' && (msg.cs_user?.name || msg.templateName)"
                class="mb-1 d-flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <small v-if="msg.cs_user?.name" class="fw-semibold text-success fs-11">
                  <i class="bx bx-user me-1"></i>{{ msg.cs_user.name }}
                </small>
                <small v-if="msg.templateName" class="text-primary fs-11">
                  Template: {{ msg.templateName }}
                </small>
              </div>

              <!-- Gambar dalam pesan chat jika ada (dari attachments / image_url) -->
              <div v-if="msg.images && msg.images.length" class="mb-2">
                <div
                  v-for="(img, imgIdx) in msg.images"
                  :key="imgIdx"
                  class="mb-1"
                >
                  <img
                    :src="img.url"
                    :alt="img.name || 'Gambar Chat'"
                    class="rounded img-fluid border bg-white"
                    style="max-height: 260px; width: 100%; object-fit: cover; cursor: pointer"
                    loading="lazy"
                    @click="previewImage(img.url)"
                  />
                </div>
              </div>
              <div
                v-else-if="msg.image_url"
                class="mb-2"
              >
                <img
                  :src="msg.image_url"
                  alt="Gambar Chat"
                  class="rounded img-fluid border bg-white"
                  style="max-height: 260px; width: 100%; object-fit: cover; cursor: pointer"
                  loading="lazy"
                  @click="previewImage(msg.image_url)"
                />
              </div>

              <p class="mb-1" v-if="msg.message" v-html="formatWhatsAppMessage(msg.message)"></p>

              <div class="small text-muted text-end mt-1" style="font-size: 11px">
                {{ msg.timeStamp || "Waktu tidak tersedia" }}
              </div>
            </div>
          </li>
        </template>
      </ul>
    </simplebar>

    <div class="bg-light bg-opacity-50 p-2 border-top">
      <!-- Preview Lampiran Gambar Sebelum Kirim -->
      <div
        v-if="selectedFile || templateImageUrl"
        class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm"
      >
        <div class="d-flex align-items-center gap-2 overflow-hidden">
          <img
            :src="filePreviewUrl || templateImageUrl || ''"
            alt="Preview"
            class="rounded border flex-shrink-0"
            style="width: 44px; height: 44px; object-fit: cover; cursor: pointer"
            @click="previewImage(filePreviewUrl || templateImageUrl)"
          />
          <div class="text-truncate">
            <div class="d-flex align-items-center gap-1">
              <span
                class="badge fs-10"
                :class="selectedFile ? 'bg-primary' : 'bg-info'"
              >
                {{ selectedFile ? 'Upload Gambar' : 'Gambar Template' }}
              </span>
              <span v-if="selectedFile" class="text-muted fs-11">
                {{ formatFileSize(selectedFile.size) }}
              </span>
            </div>
            <small class="text-truncate d-block text-muted" style="max-width: 250px">
              {{ selectedFile ? selectedFile.name : 'Gambar dari template WA' }}
            </small>
          </div>
        </div>
        <!-- <b-button
          size="sm"
          variant="light"
          class="text-danger border-0 p-1"
          title="Hapus gambar"
          @click="selectedFile ? clearFile() : clearTemplateImage()"
        >
          <i class="bx bx-x fs-18"></i>
        </b-button> -->
      </div>

      <form @submit.prevent="handleSend">
        <input
          ref="fileInput"
          type="file"
          class="d-none"
          accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
          @change="handleFileChange"
        />

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
              <b-button
                :variant="null"
                class="btn-light"
                :class="{ 'text-primary fw-bold': selectedFile || templateImageUrl }"
                title="Lampirkan Gambar (Max 2MB)"
                @click="triggerFileInput"
              >
                <i class="bx bx-image-add fs-18"></i>
              </b-button>
              <b-button :variant="null" class="btn-light" title="Salin pesan" @click="copyMessage">
                <i class="bx bx-copy fs-18"></i>
              </b-button>
              <b-button
                type="submit"
                variant="primary"
                title="Kirim pesan"
                :disabled="!message.trim() && !selectedFile && !templateImageUrl"
              >
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
        <!-- Section Upload & Preview Gambar -->
        <div class="p-3 border rounded bg-light bg-opacity-50">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label fw-semibold fs-13 mb-0">
              <i class="bx bx-image me-1"></i>Lampiran Gambar
            </label>
            <span class="text-muted fs-11">
              Image (jpg/png/webp/gif, max 2MB)
            </span>
          </div>

          <!-- Preview jika ada file atau gambar template -->
          <div
            v-if="selectedFile || templateImageUrl"
            class="d-flex align-items-center gap-3 p-2 border rounded bg-white my-2"
          >
            <img
              :src="filePreviewUrl || templateImageUrl || ''"
              alt="Preview"
              class="rounded border"
              style="width: 164px; height: 64px; object-fit: cover; cursor: pointer"
              @click="previewImage(filePreviewUrl || templateImageUrl)"
            />
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span
                  class="badge"
                  :class="selectedFile ? 'bg-primary' : 'bg-info'"
                >
                  {{ selectedFile ? 'Upload Gambar' : 'Gambar Template' }}
                </span>
                <span v-if="selectedFile" class="text-muted fs-11">
                  {{ formatFileSize(selectedFile.size) }}
                </span>
              </div>
              <p class="mb-0 fs-12 text-truncate text-muted">
                {{ selectedFile ? selectedFile.name : templateImageUrl }}
              </p>
            </div>
            <b-button
              size="sm"
              variant="outline-danger"
              class="d-inline-flex align-items-center"
              title="Hapus gambar"
              @click="selectedFile ? clearFile() : clearTemplateImage()"
            >
              <i class="bx bx-trash me-1"></i>Hapus
            </b-button>
          </div>

          <!-- Input File -->
          <div class="d-flex align-items-center gap-2 mt-2">
            <input
              ref="modalFileInput"
              type="file"
              class="form-control form-control-sm"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              @change="handleFileChange"
            />
            <b-button
              v-if="selectedFile"
              size="sm"
              variant="outline-secondary"
              @click="clearFile"
            >
              Reset
            </b-button>
          </div>
          <div v-if="!selectedFile && !templateImageUrl" class="text-muted fs-11 mt-1">
            Tidak ada file yang dipilih
          </div>
        </div>

        <div>
          <label class="form-label fw-semibold fs-13 mb-1">Isi Pesan Lengkap:</label>
          <b-form-textarea
            v-model="message"
            placeholder="Tulis atau edit pesan lengkap di sini..."
            rows="8"
            no-resize
          />
        </div>

        <div class="d-flex justify-content-between align-items-center mt-2">
          <b-button
            :variant="null"
            class="btn-light border"
            title="Salin pesan"
            @click="copyMessage"
          >
            <i class="bx bx-copy me-1"></i>Salin Pesan
          </b-button>

          <div class="d-flex gap-2">
            <b-button variant="light" class="border" @click="isModalOpen = false">
              Tutup
            </b-button>
            <b-button
              variant="primary"
              :disabled="!message.trim() && !selectedFile && !templateImageUrl"
              @click="handleSend"
            >
              <i class="bx bx-send me-1"></i>Kirim Pesan
            </b-button>
          </div>
        </div>
      </div>
    </b-modal>

    <!-- Lightbox Modal untuk Preview Gambar -->
    <b-modal
      v-model="isLightboxOpen"
      title="Preview Gambar"
      size="lg"
      centered
      hide-footer
    >
      <div class="text-center p-2">
        <img
          v-if="lightboxImageUrl"
          :src="lightboxImageUrl"
          alt="Preview"
          class="img-fluid rounded shadow-sm"
          style="max-height: 70vh; object-fit: contain"
        />
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

const props = withDefaults(
  defineProps<{
    card: CrmChatCard;
    presetTemplateId?: number | null;
  }>(),
  {
    presetTemplateId: null,
  },
);

const emit = defineEmits<{
  send: [
    text: string,
    templateId: number | null,
    file?: File | null,
    imageUrl?: string | null,
  ];
}>();

const message = ref("");
const waAccount = ref(props.card.waAccount || "Official WA");
const isModalOpen = ref(false);

const templateImageUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const modalFileInput = ref<HTMLInputElement | null>(null);

const isLightboxOpen = ref(false);
const lightboxImageUrl = ref<string | null>(null);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const isValidType =
    ALLOWED_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name);

  if (!isValidType) {
    showToast("Format gambar harus berupa JPG, PNG, WEBP, atau GIF", {
      type: "error",
      position: "top-center",
    });
    target.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    showToast("Ukuran gambar maksimal 2MB", {
      type: "error",
      position: "top-center",
    });
    target.value = "";
    return;
  }

  selectedFile.value = file;
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
  }
  filePreviewUrl.value = URL.createObjectURL(file);
  target.value = "";
};

const clearFile = () => {
  selectedFile.value = null;
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = null;
  }
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  if (modalFileInput.value) {
    modalFileInput.value.value = "";
  }
};

const clearTemplateImage = () => {
  templateImageUrl.value = null;
};

const previewImage = (url: string | null) => {
  if (!url) return;
  lightboxImageUrl.value = url;
  isLightboxOpen.value = true;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
  Array.isArray(templatesRaw.value) ? templatesRaw.value.filter((t: CrmChatTemplate) => t.type === "crm") : [],
);

const extraTemplate = ref<CrmChatTemplate | null>(null);

const allTemplates = computed<CrmChatTemplate[]>(() => {
  const list = [...templates.value];
  if (
    extraTemplate.value &&
    !list.some((t) => t.id === extraTemplate.value?.id)
  ) {
    list.unshift(extraTemplate.value);
  }
  return list;
});

const selectedTemplateId = ref<number | null>(null);
const isRendering = ref(false);

const applyTemplate = async (templateId: number) => {
  isRendering.value = true;
  try {
    const rendered = await getCrmChatTemplateById(templateId, {
      transaction_id: props.card.transactionId,
    });
    if (rendered) {
      if (rendered.rendered_content) {
        message.value = rendered.rendered_content;
      } else if (rendered.isi || rendered.content) {
        message.value = rendered.isi || rendered.content;
      }
      templateImageUrl.value = rendered.image_url || null;
      if (
        !templates.value.some((t) => t.id === templateId) &&
        (rendered.name || rendered.judul)
      ) {
        extraTemplate.value = {
          id: templateId,
          name: rendered.name || rendered.judul || `Template #${templateId}`,
          isi: rendered.isi || rendered.content || "",
          ...rendered,
        };
      }
    } else {
      showToast("Gagal memuat template pesan", {
        type: "error",
        position: "top-center",
      });
    }
  } catch {
    showToast("Gagal memuat template pesan", {
      type: "error",
      position: "top-center",
    });
  } finally {
    isRendering.value = false;
  }
};

const selectTemplate = (templateId: number) => {
  if (selectedTemplateId.value === templateId) {
    applyTemplate(templateId);
  } else {
    selectedTemplateId.value = templateId;
  }
};

watch(selectedTemplateId, (templateId) => {
  if (!templateId) return;
  applyTemplate(templateId);
});

watch(
  () => props.presetTemplateId,
  (newId) => {
    if (newId) {
      if (selectedTemplateId.value === newId) {
        applyTemplate(newId);
      } else {
        selectedTemplateId.value = newId;
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.card.id,
  () => {
    waAccount.value = props.card.waAccount || "Official WA";
    message.value = "";
    selectedTemplateId.value = null;
    extraTemplate.value = null;
    templateImageUrl.value = null;
    clearFile();
    isModalOpen.value = false;
  },
);

const handleSend = () => {
  if (!message.value.trim() && !selectedFile.value && !templateImageUrl.value) return;
  emit(
    "send",
    message.value.trim(),
    selectedTemplateId.value,
    selectedFile.value,
    templateImageUrl.value,
  );
  message.value = "";
  selectedTemplateId.value = null;
  clearFile();
  templateImageUrl.value = null;
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

const parseDateTime = (raw: any): Date | null => {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const normalized = trimmed.replace(
      /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)/,
      "$1T$2",
    );
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) return fallback;
  }
  return null;
};

const formatTimeAndDate = (m: any) => {
  const raw =
    m.sent_at || m.created_at || m.date || m.timestamp || m.timeStamp;
  const dateObj = parseDateTime(raw);

  let timeStr = "";
  let dateLabel = "";
  let dateKey = "";

  if (
    typeof raw === "string" &&
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(raw.trim())
  ) {
    const [dPart, tPart] = raw.trim().split(/\s+/);
    timeStr = tPart.slice(0, 5); // e.g. "05:02"
    dateKey = dPart; // e.g. "2026-09-28"
  }

  if (dateObj) {
    if (!timeStr) {
      timeStr = dateObj
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(".", ":");
    }
    if (!dateKey) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      dateKey = `${year}-${month}-${day}`;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (dateKey === todayStr) {
      dateLabel = "Hari ini";
    } else if (dateKey === yesterdayStr) {
      dateLabel = "Kemarin";
    } else {
      dateLabel = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } else if (m.timeStamp) {
    timeStr = m.timeStamp;
    dateLabel = m.dateLabel || "Hari ini";
    dateKey = dateLabel;
  } else {
    timeStr = new Date()
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(".", ":");
    dateLabel = "Hari ini";
    dateKey = "Hari ini";
  }

  return { timeStamp: timeStr, dateLabel, dateKey };
};

// Prepare messages: ensure timestamp/date exist and resolve template names & attachments
const processedMessages = computed(() => {
  const raw = props.card.chatMessages ?? [];
  const tplById = new Map<number, string>(
    (templates.value ?? []).map((t) => [t.id, t.name]),
  );

  return raw.map((m: any) => {
    const { timeStamp, dateLabel, dateKey } = formatTimeAndDate(m);

    // resolve template name if message carries template id/name
    const maybeTid = m.template_id ?? m.templateId ?? m.template?.id;
    let templateName =
      m.template_name ?? m.templateName ?? m.template?.name ?? null;
    if (!templateName && maybeTid && tplById.has(Number(maybeTid))) {
      templateName = tplById.get(Number(maybeTid)) || null;
    }

    // Extract images from attachments or direct url fields
    const images: { url: string; name?: string; source?: string }[] = [];
    if (Array.isArray(m.attachments) && m.attachments.length) {
      m.attachments.forEach((att: any) => {
        if (att && att.url) {
          images.push({
            url: att.url,
            name: att.name || "",
            source: att.source || "",
          });
        }
      });
    }

    if (!images.length) {
      const fallbackUrl =
        m.image_url ?? m.image ?? m.media_url ?? m.file_url ?? null;
      if (fallbackUrl) {
        images.push({ url: fallbackUrl });
      }
    }

    return {
      ...m,
      images,
      image_url: images[0]?.url || null,
      timeStamp,
      dateLabel,
      dateKey,
      templateName,
    };
  });
});

const shouldShowDateSeparator = (idx: number) => {
  if (!processedMessages.value.length) return false;
  if (idx === 0) return true;
  const prev = processedMessages.value[idx - 1];
  const cur = processedMessages.value[idx];
  return prev.dateKey !== cur.dateKey;
};
</script>
