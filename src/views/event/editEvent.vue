<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          :title="`Edit Event${eventData ? ': ' + eventData.title : ''}`"
        >
          <!-- Loading -->
          <div v-if="isFetchingEvent" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data event...</span>
          </div>

          <!-- Error -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data event.</p>
            <b-button variant="outline-primary" size="sm" @click="refetchEvent">
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form Wizard -->
          <form-wizard
            v-else-if="formReady"
            shape="tab"
            color="#1e84c4"
            back-button-text="Sebelumnya"
            next-button-text="Selanjutnya"
            finish-button-text="Simpan Perubahan"
            @on-complete="handleSubmit"
          >
            <!-- ══════════════ STEP 1 — Info Dasar ══════════════ -->
            <tab-content custom-icon='<a class="nav-link fs-5">Info Dasar</a>'>
              <h4 class="fs-16 fw-semibold mb-1">Info Dasar Event</h4>
              <p class="text-muted mb-4">
                Identitas dan pengaturan utama event
              </p>

              <b-row class="g-3">
                <!-- Mitra -->
                <b-col md="6">
                  <b-form-group label="Mitra" label-for="mitra-id">
                    <ChoicesSelect
                      id="mitra-id"
                      :modelValue="String(formState.mitra_id || 0)"
                      @update:modelValue="
                        (val) => {
                          formState.mitra_id = val === '0' ? null : Number(val);
                        }
                      "
                      :options="mitraList"
                      :isLoading="isMitraLoading"
                      :key="mitraList.length"
                    />
                    <div
                      v-if="v$.mitra_id.$error"
                      class="invalid-feedback d-block"
                    >
                      Mitra wajib dipilih.
                    </div>
                  </b-form-group>
                </b-col>

                <!-- Event Type -->
                <b-col md="6">
                  <b-form-group label="Tipe Event" label-for="type-id">
                    <ChoicesSelect
                      id="type-id"
                      :modelValue="String(formState.type_id || 0)"
                      @update:modelValue="
                        (val) => {
                          formState.type_id = val === '0' ? null : Number(val);
                        }
                      "
                      :options="eventTypeList"
                      :isLoading="isEventTypeLoading"
                      :key="eventTypeList.length"
                    />
                    <div
                      v-if="v$.type_id.$error"
                      class="invalid-feedback d-block"
                    >
                      Tipe event wajib dipilih.
                    </div>
                  </b-form-group>
                </b-col>

                <!-- Judul -->
                <b-col md="6">
                  <b-form-group label="Judul Event" label-for="title">
                    <b-form-input
                      id="title"
                      v-model="formState.title"
                      type="text"
                      placeholder="e.g., Yatim Zooliday!"
                      :state="v$.title.$error ? false : null"
                      maxlength="255"
                    />
                    <b-form-invalid-feedback v-if="v$.title.$error">
                      Judul wajib diisi (3–255 karakter).
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Slug -->
                <b-col md="6">
                  <b-form-group label="Slug" label-for="slug">
                    <b-form-input
                      id="slug"
                      v-model="formState.slug"
                      type="text"
                      placeholder="e.g., yatimzooliday"
                      maxlength="255"
                    />
                    <small class="text-muted">URL slug event</small>
                  </b-form-group>
                </b-col>

                <!-- Status -->
                <b-col md="4">
                  <b-form-group label="Status" label-for="status">
                    <b-form-select id="status" v-model="formState.status">
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <!-- Mode -->
                <b-col md="4">
                  <b-form-group label="Mode" label-for="mode">
                    <b-form-select id="mode" v-model="formState.mode">
                      <option value="">Pilih mode...</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <!-- Reg Only -->
                <b-col md="4">
                  <b-form-group label="Reg Only" label-for="reg_only">
                    <div class="d-flex align-items-center mt-2">
                      <b-form-checkbox
                        id="reg_only"
                        v-model="regOnlyBool"
                        switch
                        size="lg"
                      >
                        {{ regOnlyBool ? "Ya" : "Tidak" }}
                      </b-form-checkbox>
                    </div>
                  </b-form-group>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══════════════ STEP 2 — Detail Event ══════════════ -->
            <tab-content custom-icon='<a class="nav-link fs-5">Detail</a>'>
              <h4 class="fs-16 fw-semibold mb-1">Detail Event</h4>
              <p class="text-muted mb-4">
                Informasi waktu, tempat, dan pendaftaran
              </p>

              <b-row class="g-3">
                <b-col md="6">
                  <b-form-group
                    label="Tanggal & Waktu Mulai"
                    label-for="datetime"
                  >
                    <b-form-input
                      id="datetime"
                      v-model="formState.datetime"
                      type="datetime-local"
                    />
                  </b-form-group>
                </b-col>

                <b-col md="6">
                  <b-form-group
                    label="Tanggal & Waktu Selesai"
                    label-for="due_datetime"
                  >
                    <b-form-input
                      id="due_datetime"
                      v-model="formState.due_datetime"
                      type="datetime-local"
                    />
                  </b-form-group>
                </b-col>

                <b-col md="4">
                  <b-form-group label="Harga (Rp)" label-for="price">
                    <b-form-input
                      id="price"
                      v-model.number="formState.price"
                      type="number"
                      min="0"
                      placeholder="0 = Gratis"
                    />
                  </b-form-group>
                </b-col>

                <b-col md="4">
                  <b-form-group label="Kuota Peserta" label-for="quota">
                    <b-form-input
                      id="quota"
                      v-model.number="formState.quota"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                    />
                  </b-form-group>
                </b-col>

                <b-col md="4">
                  <b-form-group label="Lokasi" label-for="location">
                    <b-form-input
                      id="location"
                      v-model="formState.location"
                      type="text"
                      placeholder="e.g., Online via Zoom"
                    />
                  </b-form-group>
                </b-col>

                <b-col cols="12">
                  <b-form-group label="Link WA Grup" label-for="wa_grup">
                    <b-form-input
                      id="wa_grup"
                      v-model="formState.wa_grup"
                      type="text"
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </b-form-group>
                </b-col>

                <b-col cols="12">
                  <b-form-group label="Summary" label-for="summary">
                    <b-form-textarea
                      id="summary"
                      v-model="formState.summary"
                      rows="3"
                      placeholder="Ringkasan singkat event..."
                    />
                  </b-form-group>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══════════════ STEP 3 — Konten & Media ══════════════ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Konten & Media</a>'
            >
              <h4 class="fs-16 fw-semibold mb-1">Konten & Media</h4>
              <p class="text-muted mb-4">
                Deskripsi lengkap, gambar, dan atribut
              </p>

              <b-row class="g-3">
                <!-- Gambar Banner -->
                <b-col cols="12">
                  <b-form-group label="Gambar Banner" label-for="image">
                    <div
                      v-if="existingImageUrl && !newImagePreview"
                      class="mb-2"
                    >
                      <p class="text-muted small mb-1">Gambar saat ini:</p>
                      <img
                        :src="existingImageUrl"
                        alt="current"
                        style="
                          max-height: 160px;
                          max-width: 100%;
                          border-radius: 4px;
                          border: 1px solid #dee2e6;
                        "
                      />
                      <div class="mt-2">
                        <b-button
                          variant="outline-primary"
                          size="sm"
                          @click="triggerFileInput"
                        >
                          <i class="bx bx-upload me-1"></i>Ganti Gambar
                        </b-button>
                      </div>
                    </div>

                    <div
                      v-if="!existingImageUrl || newImagePreview"
                      class="border rounded p-3 text-center cursor-pointer"
                      style="min-height: 160px; background: #f8f9fa"
                      @click="!newImagePreview && triggerFileInput()"
                    >
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        class="d-none"
                        @change="handleImageChange"
                      />
                      <div
                        v-if="newImagePreview"
                        class="position-relative d-inline-block"
                      >
                        <img
                          :src="newImagePreview"
                          alt="preview"
                          style="
                            max-height: 140px;
                            max-width: 100%;
                            border-radius: 4px;
                          "
                        />
                        <button
                          type="button"
                          class="btn btn-sm btn-danger position-absolute top-0 end-0"
                          style="transform: translate(50%, -50%)"
                          @click.stop="clearNewImage"
                        >
                          <i class="bx bx-x"></i>
                        </button>
                      </div>
                      <div v-else class="py-3">
                        <i
                          class="bx bx-cloud-upload fs-1 text-muted d-block mb-2"
                        ></i>
                        <p class="text-muted mb-1">Klik untuk upload gambar</p>
                        <small class="text-muted"
                          >JPEG, PNG, WEBP — maks. 5MB</small
                        >
                      </div>
                    </div>

                    <input
                      v-if="existingImageUrl && !newImagePreview"
                      ref="fileInput"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      class="d-none"
                      @change="handleImageChange"
                    />
                  </b-form-group>
                </b-col>

                <!-- Deskripsi -->
                <b-col cols="12">
                  <b-form-group label="Deskripsi" label-for="description">
                    <QuillEditor
                      theme="snow"
                      :toolbar="quillToolbar"
                      style="height: 280px"
                      placeholder="Deskripsi lengkap event..."
                      v-model:content="formState.description"
                      content-type="html"
                    />
                  </b-form-group>
                </b-col>

                <!-- Event Attributes -->
                <b-col cols="12">
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                  >
                    <label class="form-label fw-semibold mb-0"
                      >Atribut Event</label
                    >
                    <b-button
                      variant="outline-primary"
                      size="sm"
                      @click="addAttribute"
                    >
                      <i class="bx bx-plus me-1"></i>Tambah Atribut
                    </b-button>
                  </div>

                  <div
                    v-for="(attr, idx) in formState.event_attributes"
                    :key="idx"
                    class="border rounded p-3 mb-3 position-relative"
                  >
                    <b-button
                      variant="outline-danger"
                      size="sm"
                      class="position-absolute top-0 end-0 m-2"
                      @click="removeAttribute(idx)"
                    >
                      <i class="bx bx-x"></i>
                    </b-button>
                    <b-row class="g-2">
                      <b-col md="6">
                        <label class="form-label small">Judul *</label>
                        <b-form-input
                          v-model="attr.title"
                          placeholder="Judul atribut"
                          size="sm"
                        />
                      </b-col>
                      <b-col md="3">
                        <label class="form-label small">Tipe</label>
                        <b-form-select v-model="attr.type" size="sm">
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="file">File</option>
                        </b-form-select>
                      </b-col>
                      <b-col md="3">
                        <label class="form-label small">Source From</label>
                        <b-form-select v-model="attr.source_from" size="sm">
                          <option value="url">URL</option>
                          <option value="upload">Upload</option>
                        </b-form-select>
                      </b-col>
                      <b-col md="12">
                        <label class="form-label small">Source</label>
                        <b-form-input
                          v-model="attr.source"
                          placeholder="URL atau path file"
                          size="sm"
                        />
                      </b-col>
                      <b-col md="12">
                        <label class="form-label small">Deskripsi</label>
                        <b-form-input
                          v-model="attr.description"
                          placeholder="Deskripsi atribut (opsional)"
                          size="sm"
                        />
                      </b-col>
                    </b-row>
                  </div>

                  <p
                    v-if="formState.event_attributes.length === 0"
                    class="text-muted small text-center py-3"
                  >
                    Belum ada atribut. Klik "Tambah Atribut" untuk menambahkan.
                  </p>
                </b-col>

                <!-- Spinner -->
                <b-col v-if="isPending" cols="12" class="text-center">
                  <b-spinner variant="primary" class="me-2" />
                  <span class="text-muted">Menyimpan perubahan...</span>
                </b-col>
              </b-row>
            </tab-content>
          </form-wizard>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import {
  required,
  minLength,
  maxLength,
  minValue,
} from "@vuelidate/validators";
import { useRoute } from "vue-router";
import { FormWizard, TabContent } from "vue3-form-wizard";
import "vue3-form-wizard/dist/style.css";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import {
  getEventById,
  updateEvent,
  getEventTypes,
} from "@/services/eventService";
import { getAllMitra } from "@/services/mitraService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const route = useRoute();
const queryClient = useQueryClient();

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const eventId = computed(() => Number(route.params.id));

const formReady = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const newImageFile = ref<File | null>(null);
const newImagePreview = ref<string | null>(null);
const existingImageUrl = ref<string | null>(null);
const regOnlyBool = ref(false);

interface EventAttribute {
  title: string;
  type: string;
  source: string;
  source_from: string;
  description: string;
}

const formState = reactive({
  mitra_id: null as number | null,
  type_id: null as number | null,
  title: "",
  slug: "",
  status: "active",
  mode: "",
  datetime: "",
  due_datetime: "",
  price: 0,
  quota: null as number | null,
  location: "",
  wa_grup: "",
  summary: "",
  description: "",
  event_attributes: [] as EventAttribute[],
});

const quillToolbar = [
  ["bold", "italic", "underline", "strike"],
  [{ header: [1, 2, 3, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

const rules = {
  mitra_id: { required, minValue: minValue(1) },
  type_id: { required, minValue: minValue(1) },
  title: { required, minLength: minLength(3), maxLength: maxLength(255) },
};

const v$ = useVuelidate(rules, formState);

const validateStep1 = async (): Promise<boolean> => {
  ["mitra_id", "type_id", "title"].forEach((f) =>
    (v$.value as any)[f].$touch(),
  );
  const hasError = ["mitra_id", "type_id", "title"].some(
    (f) => (v$.value as any)[f].$error,
  );
  if (hasError) {
    showToast("Lengkapi semua field yang wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return false;
  }
  return true;
};

const {
  data: eventData,
  isLoading: isFetchingEvent,
  isError: fetchError,
  refetch: refetchEvent,
} = useQuery({
  queryKey: ["event", eventId],
  queryFn: () => getEventById(eventId.value),
  enabled: computed(() => !!eventId.value),
});

const { data: mitraData, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitra-list"],
  queryFn: () => getAllMitra({ mode: "list" }),
});

const { data: eventTypeData, isLoading: isEventTypeLoading } = useQuery({
  queryKey: ["event-types"],
  queryFn: () => getEventTypes({ mode: "list" }),
});

const mitraList = computed(() => {
  if (!mitraData.value) return [{ value: 0, text: "Pilih Mitra..." }];
  const list = mitraData.value?.data ?? mitraData.value ?? [];
  return [
    { value: 0, text: "Pilih Mitra..." },
    ...list.map((item: any) => ({ value: item.id, text: item.nama })),
  ];
});

const eventTypeList = computed(() => {
  if (!eventTypeData.value) return [{ value: 0, text: "Pilih Tipe..." }];
  const list = eventTypeData.value?.data ?? eventTypeData.value ?? [];
  return [
    { value: 0, text: "Pilih Tipe..." },
    ...list.map((item: any) => ({ value: item.id, text: item.name })),
  ];
});

const toDatetimeLocal = (iso: string): string => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

watch(
  eventData,
  (data) => {
    if (!data) return;
    formState.mitra_id = data.mitra_id ?? null;
    formState.type_id = data.type_id ?? null;
    formState.title = data.title ?? "";
    formState.slug = data.slug ?? "";
    formState.status = data.status ?? "active";
    formState.mode = data.mode ?? "";
    formState.datetime = toDatetimeLocal(data.datetime);
    formState.due_datetime = toDatetimeLocal(data.due_datetime);
    formState.price = data.price ?? 0;
    formState.quota = data.quota ?? null;
    formState.location = data.location ?? "";
    formState.wa_grup = data.wa_grup ?? "";
    formState.summary = data.summary ?? "";
    formState.description = data.description ?? "";
    regOnlyBool.value = !!data.reg_only;
    existingImageUrl.value = data.image ? `${STORAGE_BASE}${data.image}` : null;
    formState.event_attributes = (data.attributes ?? []).map((attr: any) => ({
      title: attr.title ?? "",
      type: attr.type ?? "text",
      source: attr.source ?? "",
      source_from: attr.source_from ?? "url",
      description: attr.description ?? "",
    }));
    formReady.value = true;
  },
  { immediate: true },
);

const triggerFileInput = () => fileInput.value?.click();

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  newImageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    newImagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearNewImage = () => {
  newImageFile.value = null;
  newImagePreview.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const addAttribute = () => {
  formState.event_attributes.push({
    title: "",
    type: "text",
    source: "",
    source_from: "url",
    description: "",
  });
};

const removeAttribute = (index: number) => {
  formState.event_attributes.splice(index, 1);
};

const { mutate: submitUpdate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("mitra_id", String(formState.mitra_id));
    formData.append("type_id", String(formState.type_id));
    formData.append("title", formState.title);
    formData.append("status", formState.status);
    formData.append("reg_only", regOnlyBool.value ? "1" : "0");
    if (formState.slug) formData.append("slug", formState.slug);
    if (formState.mode) formData.append("mode", formState.mode);
    if (formState.datetime) formData.append("datetime", formState.datetime);
    if (formState.due_datetime)
      formData.append("due_datetime", formState.due_datetime);
    formData.append("price", String(formState.price ?? 0));
    if (formState.quota) formData.append("quota", String(formState.quota));
    if (formState.location) formData.append("location", formState.location);
    if (formState.wa_grup) formData.append("wa_grup", formState.wa_grup);
    if (formState.summary) formData.append("summary", formState.summary);
    if (formState.description)
      formData.append("description", formState.description);
    if (newImageFile.value) formData.append("image", newImageFile.value);
    if (formState.event_attributes.length > 0) {
      formData.append(
        "event_attributes",
        JSON.stringify(
          formState.event_attributes.map((attr, idx) => ({
            ...attr,
            sequence: idx + 1,
          })),
        ),
      );
    }
    return updateEvent(eventId.value, formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["event", eventId.value] });
    showToast("Event berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/events"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui event";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = () => {
  if (isPending.value) return;
  submitUpdate();
};
</script>
