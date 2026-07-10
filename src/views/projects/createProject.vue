<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="project-form-create" title="Buat Project Baru">
          <form-wizard
            shape="tab"
            color="#1e84c4"
            back-button-text="Sebelumnya"
            next-button-text="Selanjutnya"
            finish-button-text="Buat Project"
            @on-complete="handleSubmit"
          >
            <!-- ══ STEP 1 — Identitas ══ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Identitas</a>'
              :before-change="validateStep1"
            >
              <h4 class="fs-16 fw-semibold mb-1">Identitas Project</h4>
              <p class="text-muted mb-4">Informasi dasar tentang project</p>

              <b-row class="g-3">
                <!-- Judul -->
                <b-col md="12">
                  <b-form-group label="Judul Project" label-for="judul">
                    <b-form-input
                      id="judul"
                      v-model="v$.judul.$model"
                      type="text"
                      placeholder="e.g., Salur Program Bangun Kelas..."
                      :state="v$.judul.$error ? false : null"
                      maxlength="255"
                    />
                    <b-form-invalid-feedback v-if="v$.judul.$error">
                      Judul wajib diisi.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Status -->
                <b-col md="6">
                  <b-form-group label="Status" label-for="status">
                    <b-form-select
                      id="status"
                      v-model="v$.status.$model"
                      :state="v$.status.$error ? false : null"
                    >
                      <option value="" disabled>Pilih status...</option>
                      <option value="draft">Draft</option>
                      <option value="diajukan">Diajukan</option>
                      <option value="diterima">Diterima</option>
                      <option value="ditolak">Ditolak</option>
                    </b-form-select>
                    <b-form-invalid-feedback v-if="v$.status.$error">
                      Status wajib dipilih.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Activity -->
                <b-col md="6">
                  <b-form-group label="Activity" label-for="activity">
                    <b-form-select id="activity" v-model="formState.activity">
                      <option value="">Pilih activity...</option>
                      <option value="inactive">Inactive</option>
                      <option value="active open">Active Open</option>
                      <option value="active close">Active Close</option>
                      <option value="selesai">Selesai</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <!-- Request -->
                <b-col md="6">
                  <b-form-group label="Request" label-for="request">
                    <b-form-select id="request" v-model="formState.request">
                      <option value="nothing">Nothing</option>
                      <option value="nominal">Nominal</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <!-- Mitra -->
                <b-col md="6">
                  <b-form-group label="Mitra" label-for="mitra-id">
                    <SearchSelect
                      id="mitra-id"
                      :modelValue="String(formState.mitra_id || 0)"
                      @update:modelValue="
                        (val) => {
                          formState.mitra_id = val === '0' ? null : Number(val);
                        }
                      "
                      @search="
                        (query: string) => {
                          mitraSearchQuery = query;
                        }
                      "
                      :options="mitraList"
                      :isLoading="isMitraLoading"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Programs (M:N) -->
                <b-col md="12">
                  <b-form-group label="Program Terkait" label-for="program-ids">
                    <small class="text-muted d-block mb-2">
                      Pilih satu atau lebih program yang terkait
                    </small>
                    <div v-if="isProgramLoading" class="text-muted small">
                      <b-spinner small class="me-1" />Loading programs...
                    </div>

                    <div v-else>
                      <!-- <ChoicesSelect
                        id="program-ids"
                        :modelValue="formState.program_ids.map(String)"
                        @update:modelValue="handleProgramChange"
                        :options="programOptions"
                        :choice-options="{
                          removeItemButton: true,
                        }"
                        multiple
                      /> -->

                      <ChoicesSelect
                        id="program-ids"
                        :modelValue="formState.program_ids.map(String)"
                        @update:modelValue="
                          (val) => {
                            formState.program_ids = val.map(Number);
                          }
                        "
                        :options="programOptions"
                        :choice-options="{ removeItemButton: true }"
                        multiple
                      />
                      <!-- <b-form-checkbox
                        v-for="p in allPrograms"
                        :key="p.id"
                        v-model="formState.program_ids"
                        :value="p.id"
                        class="mb-1"
                      >
                        {{ p.title }}
                      </b-form-checkbox> -->
                      <p
                        v-if="allPrograms.length === 0"
                        class="text-muted small mb-0"
                      >
                        Tidak ada program tersedia.
                      </p>
                    </div>
                  </b-form-group>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══ STEP 2 — Detail ══ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Detail</a>'
              :before-change="validateStep2"
            >
              <h4 class="fs-16 fw-semibold mb-1">Detail Project</h4>
              <p class="text-muted mb-4">
                Nominal, waktu, dan keterangan project
              </p>

              <b-row class="g-3">
                <!-- Nominal Ajuan -->
                <b-col md="6">
                  <b-form-group label="Nominal Ajuan" label-for="nominal-ajuan">
                    <CurrencyInput
                      id="nominal-ajuan"
                      placeholder="0"
                      v-model="v$.nominal_ajuan.$model"
                      :state="null"
                    />
                    <b-form-invalid-feedback
                      v-if="v$.nominal_ajuan.$error"
                      class="d-block"
                    >
                      Nominal ajuan wajib diisi.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Nominal Acc -->
                <b-col md="6">
                  <b-form-group label="Nominal Acc" label-for="nominal-acc">
                    <CurrencyInput
                      id="nominal-acc"
                      placeholder="0"
                      v-model="formState.nominal_acc"
                      :state="null"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Waktu Pelaksanaan -->
                <b-col md="6">
                  <b-form-group
                    label="Waktu Pelaksanaan"
                    label-for="waktu-pelaksanaan"
                  >
                    <FlatPicker
                      id="waktu-pelaksanaan"
                      :options="{ enableTime: false, dateFormat: 'Y-m-d' }"
                      v-model="v$.waktu_pelaksanaan.$model"
                    />
                    <b-form-invalid-feedback
                      v-if="v$.waktu_pelaksanaan.$error"
                      class="d-block"
                    >
                      Waktu pelaksanaan wajib diisi.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Jumlah PM -->
                <b-col md="6">
                  <b-form-group label="Jumlah PM" label-for="jumlah-pm">
                    <b-form-input
                      id="jumlah-pm"
                      v-model="formState.jumlah_pm"
                      type="number"
                      min="0"
                      placeholder="e.g., 100"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Reason -->
                <b-col md="6">
                  <b-form-group label="Reason" label-for="reason">
                    <b-form-input
                      id="reason"
                      v-model="formState.reason"
                      type="text"
                      placeholder="e.g., Segera Salur"
                      maxlength="255"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Kesiapan -->
                <b-col md="6">
                  <b-form-group label="Kesiapan" label-for="kesiapan">
                    <b-form-input
                      id="kesiapan"
                      v-model="formState.kesiapan"
                      type="text"
                      placeholder="Kesiapan project..."
                      maxlength="255"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Notes -->
                <b-col cols="12">
                  <b-form-group label="Notes" label-for="notes">
                    <b-form-textarea
                      id="notes"
                      v-model="formState.notes"
                      placeholder="Catatan tambahan..."
                      rows="3"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Deskripsi -->
                <b-col cols="12">
                  <b-form-group label="Deskripsi" label-for="deskripsi">
                    <QuillEditor
                      theme="snow"
                      :toolbar="toolbar"
                      style="height: 260px"
                      placeholder="Deskripsi project..."
                      v-model:content="formState.deskripsi"
                      content-type="html"
                    />
                  </b-form-group>
                  <small class="text-muted">Opsional</small>
                </b-col>

                <!-- Lokasi -->
                <b-col cols="12">
                  <hr class="my-1" />
                  <h6 class="text-muted fw-semibold mb-3">
                    <i class="bx bx-map-pin me-1"></i>Lokasi
                  </h6>
                  <MapLocationPicker
                    :lat="formState.lat"
                    :lng="formState.lng"
                    @update:lat="(val) => (formState.lat = val)"
                    @update:lng="(val) => (formState.lng = val)"
                  />
                </b-col>

                <b-col md="6">
                  <b-form-group label="Kode Wilayah" label-for="kode-wilayah">
                    <b-form-input
                      id="kode-wilayah"
                      v-model="formState.kode_wilayah"
                      type="text"
                      placeholder="Kode wilayah..."
                      maxlength="50"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══ STEP 3 — Kontak & Media ══ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Kontak & Media</a>'
              :before-change="validateStep3"
            >
              <h4 class="fs-16 fw-semibold mb-1">Kontak & Media</h4>
              <p class="text-muted mb-4">
                Informasi kontak dan upload gambar project
              </p>

              <b-row class="g-3">
                <!-- Pengaju -->
                <b-col md="6">
                  <b-form-group label="Pengaju" label-for="pengaju">
                    <b-form-input
                      id="pengaju"
                      v-model="formState.pengaju"
                      type="text"
                      placeholder="Nama pengaju..."
                      maxlength="255"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Email -->
                <b-col md="6">
                  <b-form-group label="Email" label-for="email">
                    <b-form-input
                      id="email"
                      v-model="formState.email"
                      type="email"
                      placeholder="email@example.com"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- WhatsApp -->
                <b-col md="6">
                  <b-form-group label="WhatsApp" label-for="wa">
                    <b-form-input
                      id="wa"
                      v-model="formState.wa"
                      type="text"
                      placeholder="e.g., 081234567890"
                      maxlength="30"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Marketing -->
                <b-col md="6">
                  <b-form-group label="Marketing" label-for="marketing">
                    <b-form-input
                      id="marketing"
                      v-model="formState.marketing"
                      type="text"
                      placeholder="Nama marketing..."
                      maxlength="255"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Gambar Utama -->
                <b-col md="6">
                  <b-form-group label="Gambar Utama" label-for="image">
                    <b-form-file
                      id="image"
                      accept="image/jpeg,image/png,image/webp"
                      @change="handleImageChange"
                      placeholder="Pilih gambar utama (opsional)..."
                    />
                    <small class="text-muted">Opsional — JPEG/PNG/WebP</small>
                  </b-form-group>
                  <div v-if="imagePreview" class="mt-2">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                  </div>
                </b-col>

                <!-- Gambar Tambahan -->
                <b-col md="6">
                  <b-form-group label="Gambar Tambahan" label-for="images">
                    <b-form-file
                      id="images"
                      accept="image/jpeg,image/png,image/webp"
                      @change="handleImagesChange"
                      placeholder="Pilih gambar tambahan (opsional)..."
                    />
                    <small class="text-muted">Opsional — JPEG/PNG/WebP</small>
                  </b-form-group>
                  <div v-if="imagesPreview" class="mt-2">
                    <img
                      :src="imagesPreview"
                      alt="Preview Tambahan"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                  </div>
                </b-col>

                <!-- Spinner saat submit -->
                <b-col cols="12" v-if="isPending" class="text-center">
                  <b-spinner variant="primary" class="me-2" />
                  <span class="text-muted">Menyimpan project...</span>
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
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import MapLocationPicker from "@/components/MapLocationPicker.vue";
import { QuillEditor } from "@vueup/vue-quill";
import { FormWizard, TabContent } from "vue3-form-wizard";
import "vue3-form-wizard/dist/style.css";
import "vue3-toastify/dist/index.css";

import { createProject } from "@/services/projectService";
import { getAllPrograms } from "@/services/programService";
import { getAllMitra } from "@/services/mitraService";
import { toast, type ToastOptions } from "vue3-toastify";
import { useSearchSelect } from "@/composables/useSearchSelect";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();
const queryClient = useQueryClient();

// ── Image state ──────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null);
const imagesFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imagesPreview = ref<string | null>(null);

// ── Form state ───────────────────────────────────────────────────────────────
const formState = reactive({
  judul: "",
  status: "draft",
  activity: "",
  request: "nothing",
  mitra_id: null as number | null,
  program_ids: [] as number[],
  nominal_ajuan: undefined as number | undefined,
  nominal_acc: undefined as number | undefined,
  waktu_pelaksanaan: "",
  jumlah_pm: "",
  reason: "",
  kesiapan: "",
  notes: "",
  deskripsi: "",
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  kode_wilayah: "",
  pengaju: "Aksiberbagi",
  email: "aksiberbagi.indonesia@gmail.com",
  wa: "081215448698",
  marketing: "",
});

// ── Validation ────────────────────────────────────────────────────────────────
const rules = computed(() => ({
  judul: { required },
  status: { required },
  nominal_ajuan: { required },
  waktu_pelaksanaan: { required },
}));

const v$ = useVuelidate(rules, formState);

const touchAndCheck = (fields: string[]): boolean => {
  fields.forEach((f) => (v$.value as any)[f].$touch());
  const hasError = fields.some((f) => (v$.value as any)[f].$error);
  if (hasError) {
    showToast("Lengkapi semua field yang wajib diisi", {
      type: "warning",
      position: "top-center",
    });
  }
  return !hasError;
};

const validateStep1 = () => touchAndCheck(["judul", "status"]);
const validateStep2 = () =>
  touchAndCheck(["nominal_ajuan", "waktu_pelaksanaan"]);
const validateStep3 = () => true;

// ── Data fetching ─────────────────────────────────────────────────────────────
// mitra search select
const {
  searchQuery: mitraSearchQuery,
  options: mitraList,
  isLoading: isMitraLoading,
} = useSearchSelect({
  queryKey: "mitra",
  fetchFn: getAllMitra,
  optionsMapper: (mitra: any) => ({
    value: mitra.id,
    text: mitra.nama,
  }),
  placeholder: "Cari mitra...",
  limit: 10,
});

const { data: programData, isLoading: isProgramLoading } = useQuery({
  queryKey: ["programs-all"],
  queryFn: () => getAllPrograms({ mode: "list" }),
});

const allPrograms = computed(() => programData.value ?? []);

const programOptions = computed(() =>
  allPrograms.value.map((p: any) => ({
    value: String(p.id),
    text: p.title,
  })),
);

// ── Image handlers ────────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
};

const handleImagesChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imagesFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagesPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imagesPreview.value = null;
  }
};

// ── Mutation ─────────────────────────────────────────────────────────────────
const { mutate: submitCreate, isPending } = useMutation({
  mutationFn: (payload: FormData) => createProject(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    showToast("Project berhasil dibuat", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/projects"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal membuat project";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

// ── Submit ────────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (isPending.value) return;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Terdapat data yang belum diisi dengan benar", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  const formData = new FormData();
  formData.append("judul", formState.judul.trim());
  formData.append("status", formState.status);
  formData.append("request", formState.request);
  formData.append("nominal_ajuan", String(formState.nominal_ajuan ?? 0));
  formData.append("waktu_pelaksanaan", formState.waktu_pelaksanaan);

  if (formState.activity) formData.append("activity", formState.activity);
  if (formState.mitra_id)
    formData.append("mitra_id", String(formState.mitra_id));
  if (formState.nominal_acc != null)
    formData.append("nominal_acc", String(formState.nominal_acc));
  if (formState.jumlah_pm) formData.append("jumlah_pm", formState.jumlah_pm);
  if (formState.reason) formData.append("reason", formState.reason.trim());
  if (formState.kesiapan)
    formData.append("kesiapan", formState.kesiapan.trim());
  if (formState.notes) formData.append("notes", formState.notes.trim());
  if (formState.deskripsi) formData.append("deskripsi", formState.deskripsi);
  if (formState.lat != null) formData.append("lat", String(formState.lat));
  if (formState.lng != null) formData.append("lng", String(formState.lng));
  if (formState.kode_wilayah)
    formData.append("kode_wilayah", formState.kode_wilayah.trim());
  if (formState.pengaju) formData.append("pengaju", formState.pengaju.trim());
  if (formState.email) formData.append("email", formState.email.trim());
  if (formState.wa) formData.append("wa", formState.wa.trim());
  if (formState.marketing)
    formData.append("marketing", formState.marketing.trim());
  if (imageFile.value) formData.append("image", imageFile.value);
  if (imagesFile.value) formData.append("images", imagesFile.value);

  formState.program_ids.forEach((id, i) => {
    formData.append(`program_ids[${i}]`, String(id));
  });

  submitCreate(formData);
  // console.log(formState);
};

// ── Quill toolbar ─────────────────────────────────────────────────────────────
const toolbar = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ["link", "image"],
  ["clean"],
];
</script>
