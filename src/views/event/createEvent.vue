<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Event">
          <form-wizard
            shape="tab"
            color="#1e84c4"
            back-button-text="Sebelumnya"
            next-button-text="Selanjutnya"
            finish-button-text="Simpan Event"
            @on-complete="handleSubmit"
          >
            <!-- ══════════════ STEP 1 — Info Dasar ══════════════ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Info Dasar</a>'
              :before-change="validateStep1"
            >
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
                    <small class="text-muted"
                      >URL slug event (opsional, auto dari judul)</small
                    >
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
                <!-- Tanggal Mulai -->
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

                <!-- Tanggal Selesai -->
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

                <!-- Harga -->
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

                <!-- Kuota -->
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

                <!-- Lokasi -->
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

                <!-- WA Grup -->
                <b-col md="12">
                  <b-form-group label="Link WA Grup" label-for="wa_grup">
                    <b-form-input
                      id="wa_grup"
                      v-model="formState.wa_grup"
                      type="text"
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </b-form-group>
                </b-col>

                <!-- Summary -->
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
                    <ImageUpload
                      v-model="formState.image"
                      :max-size-mb="5"
                      accept="image/*"
                      placeholder="Upload Banner Event"
                    />
                  </b-form-group>
                </b-col>

                <!-- Deskripsi -->
                <b-col cols="12">
                  <b-form-group label="Deskripsi" label-for="description">
                    <CustomQuillEditor
                      storage="event-content"
                      :style="{ height: '280px' }"
                      placeholder="Deskripsi lengkap event..."
                      v-model:content="formState.description"
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
                        <b-form-select
                          v-model="attr.source_from"
                          size="sm"
                          disabled
                        >
                          <option value="url">URL</option>
                          <option value="upload">Upload</option>
                        </b-form-select>
                      </b-col>
                      <b-col md="12">
                        <label class="form-label small">Source</label>
                        <!-- URL -->
                        <b-form-input
                          v-if="attr.source_from === 'url'"
                          v-model="attr.source"
                          placeholder="URL atau path file"
                          size="sm"
                        />
                        <!-- File -->
                        <!-- <b-form-file
                          v-else
                          id="source_file"
                          accept="image/jpeg,image/png,image/webp"
                          @change="(e: any) => handleUploadFile(e, idx)"
                          placeholder="Pilih file..."
                        /> -->
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
                  <span class="text-muted">Menyimpan event...</span>
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
import { reactive, computed, ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import {
  required,
  minLength,
  maxLength,
  minValue,
} from "@vuelidate/validators";
import { useRouter } from "vue-router";
import { FormWizard, TabContent } from "vue3-form-wizard";
import "vue3-form-wizard/dist/style.css";
import CustomQuillEditor from "@/components/CustomQuillEditor.vue";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import { createEvent, getEventTypes } from "@/services/eventService";
import { getAllMitra } from "@/services/mitraService";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

interface EventAttribute {
  title: string;
  type: string;
  source: string;
  // source_file?: File | null;
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
  image: null as File | null,
  event_attributes: [] as EventAttribute[],
});

const regOnlyBool = ref(false);

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

// ── Data fetching ──────────────────────────────────────────────────────────
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

// ── Attribute management ────────────────────────────────────────────────────
const addAttribute = () => {
  formState.event_attributes.push({
    title: "",
    type: "text",
    source: "",
    // source_file: null,
    source_from: "url",
    description: "",
  });
};

// const handleUploadFile = (event: Event, index: number) => {
//   const target = event.target as HTMLInputElement;

//   if (!target.files?.length) return;

//   formState.event_attributes[index].source_file = target.files[0];
//   formState.event_attributes[index].source = target.files[0].name;
// };

const removeAttribute = (index: number) => {
  formState.event_attributes.splice(index, 1);
};

// ── Submit ─────────────────────────────────────────────────────────────────
const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: () => {
    const formData = new FormData();
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
    if (formState.image) formData.append("image", formState.image);
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
      // formState.event_attributes.forEach((attr, idx) => {
      //   formData.append(`event_attributes[${idx}][title]`, attr.title);

      //   formData.append(`event_attributes[${idx}][type]`, attr.type);

      //   formData.append(
      //     `event_attributes[${idx}][source_from]`,
      //     attr.source_from,
      //   );

      //   formData.append(
      //     `event_attributes[${idx}][description]`,
      //     attr.description,
      //   );
      //   formData.append(`event_attributes[${idx}][sequence]`, String(idx + 1));

      //   if (attr.source_from === "upload" && attr.source_file) {
      //     formData.append(`event_attributes[${idx}][file]`, attr.source_file);
      //   } else {
      //     formData.append(`event_attributes[${idx}][source]`, attr.source);
      //   }
      // });
    }
    return createEvent(formData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    showToast("Event berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/events"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal menambahkan event";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = () => {
  if (isPending.value) return;
  submitCreate();
};
</script>
