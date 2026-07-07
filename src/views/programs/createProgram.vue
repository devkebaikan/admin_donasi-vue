<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="program-form-create" title="Buat Program Baru">
          <form-wizard
            shape="tab"
            color="#1e84c4"
            back-button-text="Sebelumnya"
            next-button-text="Selanjutnya"
            finish-button-text="Buat Program"
            @on-complete="handleSubmit"
          >
            <!-- ══════════════════════════════════════════════════════════ STEP 1 — Identitas Program ══════════════════════════════════════════════════════════ -->
            <tab-content custom-icon='<a class="nav-link fs-5">Identitas</a>'>
              <!-- :before-change="validateStep1" -->
              <h4 class="fs-16 fw-semibold mb-1">Identitas Program</h4>
              <p class="text-muted mb-4">
                Informasi dasar tentang program donasi
              </p>

              <b-row class="g-3">
                <!-- Mitra -->
                <b-col md="6">
                  <b-form-group label="Mitra" label-for="mitra-id">
                    <ChoicesSelect
                      id="mitra-id"
                      :modelValue="String(v$.mitra_id.$model || 0)"
                      @update:modelValue="
                        (val) => {
                          v$.mitra_id.$model = val === '0' ? null : Number(val);
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

                <!-- Tipe Program -->
                <b-col md="6">
                  <b-form-group label="Tipe Program" label-for="tipe-id">
                    <ChoicesSelect
                      id="tipe-id"
                      :modelValue="String(v$.tipe_id.$model || 0)"
                      @update:modelValue="
                        (val) => {
                          v$.tipe_id.$model = val === '0' ? null : Number(val);
                        }
                      "
                      :options="tipeList"
                      :isLoading="isTipeLoading"
                      :key="tipeList.length"
                    />
                    <div
                      v-if="v$.tipe_id.$error"
                      class="invalid-feedback d-block"
                    >
                      Tipe Program wajib dipilih.
                    </div>
                  </b-form-group>
                </b-col>

                <!-- Kategori -->
                <b-col md="6">
                  <b-form-group label="Kategori" label-for="category-id">
                    <ChoicesSelect
                      id="category-id"
                      :modelValue="String(formState.cateogry_id || 0)"
                      @update:modelValue="
                        (val) => {
                          formState.cateogry_id =
                            val === '0' ? null : Number(val);
                        }
                      "
                      :options="categoryList"
                      :isLoading="isCategoryLoading"
                      :key="categoryList.length"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Program Percentage -->
                <b-col md="6">
                  <b-form-group
                    label="Program Percentage"
                    label-for="percentage-id"
                  >
                    <ChoicesSelect
                      id="percentage-id"
                      :modelValue="String(formState.program_percentage_id || 0)"
                      @update:modelValue="
                        (val) => {
                          formState.program_percentage_id =
                            val === '0' ? null : Number(val);
                        }
                      "
                      :options="percentageList"
                      :isLoading="isPercentageLoading"
                      :key="percentageList.length"
                    />
                    <small class="text-muted">Opsional</small>
                  </b-form-group>
                </b-col>

                <!-- Judul -->
                <b-col md="6">
                  <b-form-group label="Judul Program" label-for="judul">
                    <b-form-input
                      id="judul"
                      v-model="v$.judul.$model"
                      type="text"
                      placeholder="e.g., Bantu Anak Yatim Belajar"
                      :state="v$.judul.$error ? false : null"
                      maxlength="255"
                    />
                    <b-form-invalid-feedback v-if="v$.judul.$error">
                      Judul wajib diisi.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>

                <!-- Link / Slug -->
                <b-col md="6">
                  <b-form-group label="Link (Slug)" label-for="link">
                    <b-form-input
                      id="link"
                      v-model="v$.link.$model"
                      type="text"
                      placeholder="e.g., bantuanakyatim"
                      :state="v$.link.$error ? false : null"
                      maxlength="255"
                    />
                    <b-form-invalid-feedback v-if="v$.link.$error">
                      Link wajib diisi.
                    </b-form-invalid-feedback>
                    <small class="text-muted"
                      >Slug unik untuk URL program</small
                    >
                  </b-form-group>
                </b-col>

                <!-- Kode -->
                <b-col md="6">
                  <b-form-group label="Kode Program" label-for="kode">
                    <b-form-input
                      id="kode"
                      v-model="v$.kode.$model"
                      type="text"
                      placeholder="e.g., IFQDZJ"
                      :state="v$.kode.$error ? false : null"
                      maxlength="100"
                    />
                    <b-form-invalid-feedback v-if="v$.kode.$error">
                      Kode wajib diisi.
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
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISH">Publish</option>
                      <option value="REQUEST AKUN">Request Akun</option>
                    </b-form-select>
                    <b-form-invalid-feedback v-if="v$.status.$error">
                      Status wajib dipilih.
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══════════════════════════════════════════════════════════ STEP 2 — Konten & Target ══════════════════════════════════════════════════════════ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Konten & Target</a>'
            >
              <!-- :before-change="validateStep2" -->
              <h4 class="fs-16 fw-semibold mb-1">Konten & Target Program</h4>
              <p class="text-muted mb-4">
                Isi konten dan pengaturan target donasi
              </p>

              <b-row class="g-3">
                <!-- Rangkuman -->
                <b-col cols="12">
                  <b-form-group label="Rangkuman" label-for="rangkuman">
                    <b-form-textarea
                      id="rangkuman"
                      v-model="v$.rangkuman.$model"
                      placeholder="Ringkasan singkat program..."
                      rows="3"
                      maxlength="500"
                      :state="v$.rangkuman.$error ? false : null"
                    />
                    <b-form-invalid-feedback v-if="v$.rangkuman.$error">
                      Rangkuman wajib diisi.
                    </b-form-invalid-feedback>
                    <small class="text-muted">Maks 500 karakter</small>
                  </b-form-group>
                </b-col>

                <!-- Isi Konten -->
                <b-col cols="12">
                  <b-form-group label="Isi Konten" label-for="isi">
                    <QuillEditor
                      theme="snow"
                      :toolbar="toolbar1"
                      style="height: 260px"
                      placeholder="Konten HTML program..."
                      v-model="formState.isi"
                      content-type="html"
                    />
                  </b-form-group>
                  <small class="text-muted">Opsional — klik ikon gambar untuk upload</small>
                </b-col>

                <!-- Video URL -->
                <b-col cols="12">
                  <b-form-group label="Video Embed URL" label-for="video">
                    <b-form-input
                      id="video"
                      v-model="formState.video"
                      type="url"
                      placeholder="e.g., https://www.youtube.com/embed/xxxxx"
                      maxlength="500"
                    />
                    <small class="text-muted"
                      >Opsional — URL embed video YouTube/Vimeo</small
                    >
                  </b-form-group>
                </b-col>

                <!-- Target Waktu -->
                <b-col md="6">
                  <b-form-group
                    label="Jenis Target Waktu"
                    label-for="is-target-waktu"
                  >
                    <b-form-select
                      id="is-target-waktu"
                      v-model="formState.is_target_waktu"
                    >
                      <option value="BEBAS">Bebas</option>
                      <option value="TERTENTU">Tertentu</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <b-col md="6">
                  <b-form-group label="Tanggal Target" label-for="target-waktu">
                    <FlatPicker
                      id="target-waktu-picker"
                      :options="{ enableTime: false, dateFormat: 'Y-m-d' }"
                      v-model="formState.target_waktu"
                      :disabled="formState.is_target_waktu === 'BEBAS'"
                    />
                    <small class="text-muted">
                      {{
                        formState.is_target_waktu === "BEBAS"
                          ? "Tidak diperlukan untuk target Bebas"
                          : "Wajib diisi untuk target Tertentu"
                      }}
                    </small>
                  </b-form-group>
                </b-col>

                <!-- Target Nominal -->
                <b-col md="6">
                  <b-form-group
                    label="Jenis Target Nominal"
                    label-for="is-target-nominal"
                  >
                    <b-form-select
                      id="is-target-nominal"
                      v-model="formState.is_target_nominal"
                    >
                      <option value="BEBAS">Bebas</option>
                      <option value="TERTENTU">Tertentu</option>
                    </b-form-select>
                  </b-form-group>
                </b-col>

                <b-col md="6">
                  <b-form-group
                    label="Nominal Target Donasi"
                    label-for="target-nominal"
                  >
                    <CurrencyInput
                      id="target-nominal"
                      placeholder="0"
                      v-model="formState.target_nominal"
                      :disabled="formState.is_target_nominal === 'BEBAS'"
                      :state="null"
                    />
                    <small class="text-muted">
                      {{
                        formState.is_target_nominal === "BEBAS"
                          ? "Tidak diperlukan untuk nominal Bebas"
                          : "Wajib diisi untuk nominal Tertentu"
                      }}
                    </small>
                  </b-form-group>
                </b-col>

                <!-- Jenis Nominal -->
                <b-col md="6">
                  <b-form-group label="Jenis Nominal" label-for="jenis-nominal">
                    <b-form-select
                      id="jenis-nominal"
                      v-model="formState.jenis_nominal"
                    >
                      <option value="default">Default</option>
                      <option value="masukan">Masukan</option>
                    </b-form-select>
                    <small class="text-muted">
                      Pilih "Masukan" untuk mengatur pilihan nominal donasi
                    </small>
                  </b-form-group>
                </b-col>

                <!-- ── Nominal Items (tampil hanya jika jenis_nominal = masukan) ── -->
                <b-col cols="12" v-if="formState.jenis_nominal === 'masukan'">
                  <div class="border rounded p-3">
                    <div
                      class="d-flex justify-content-between align-items-center mb-3"
                    >
                      <div>
                        <h6 class="mb-0 fw-semibold">Pilihan Nominal Donasi</h6>
                        <small class="text-muted">
                          Tambahkan pilihan nominal yang bisa dipilih donatur
                        </small>
                      </div>
                      <b-button
                        variant="primary"
                        size="sm"
                        @click="addNominalItem"
                      >
                        <i class="bx bx-plus me-1"></i>Tambah Item
                      </b-button>
                    </div>

                    <!-- Empty state -->
                    <div
                      v-if="nominalItems.length === 0"
                      class="text-center text-muted py-3"
                    >
                      <i
                        class="bx bx-list-plus fs-2 d-block mb-1 opacity-50"
                      ></i>
                      <small
                        >Belum ada pilihan nominal. Klik "Tambah Item" untuk
                        menambahkan.</small
                      >
                    </div>

                    <!-- Item list -->
                    <div
                      v-for="(item, idx) in nominalItems"
                      :key="idx"
                      class="d-flex gap-2 mb-2 align-items-center"
                    >
                      <span
                        class="text-muted small flex-shrink-0"
                        style="width: 28px"
                      >
                        {{ idx + 1 }}.
                      </span>
                      <b-form-input
                        v-model="item.nama"
                        placeholder="Nama pilihan (e.g., Paket Hemat)"
                        style="flex: 2"
                      />
                      <CurrencyInput
                        v-model="item.nominal"
                        placeholder="Nominal"
                        style="flex: 1; min-width: 140px"
                      />
                      <b-button
                        variant="outline-danger"
                        size="sm"
                        class="flex-shrink-0"
                        @click="removeNominalItem(idx)"
                        title="Hapus item"
                      >
                        <i class="bx bx-trash"></i>
                      </b-button>
                    </div>
                  </div>
                </b-col>
              </b-row>
            </tab-content>

            <!-- ══════════════════════════════════════════════════════════ STEP 3 — Media ══════════════════════════════════════════════════════════ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Media</a>'
              :before-change="validateStep3"
            >
              <h4 class="fs-16 fw-semibold mb-1">Media Program</h4>
              <p class="text-muted mb-4">Upload gambar untuk program donasi</p>

              <b-row class="g-3">
                <!-- Gambar Utama -->
                <b-col md="6">
                  <b-form-group label="Gambar Utama" label-for="image">
                    <b-form-file
                      id="image"
                      accept="image/jpeg,image/png,image/webp"
                      :state="v$.image.$error ? false : null"
                      @change="handleImageChange"
                      placeholder="Pilih gambar utama..."
                    />
                    <b-form-invalid-feedback v-if="v$.image.$error">
                      Gambar utama wajib dipilih.
                    </b-form-invalid-feedback>
                    <small class="text-muted"
                      >JPEG/PNG/WebP, maks 10MB. Auto-converted to WebP.</small
                    >
                  </b-form-group>

                  <div v-if="imagePreview" class="mt-2">
                    <img
                      :src="imagePreview"
                      alt="Preview Gambar Utama"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                  </div>
                </b-col>

                <!-- Gambar WhatsApp -->
                <b-col md="6">
                  <b-form-group label="Gambar WhatsApp" label-for="image-wa">
                    <b-form-file
                      id="image-wa"
                      accept="image/jpeg,image/png,image/webp"
                      @change="handleImageWaChange"
                      placeholder="Pilih gambar WhatsApp (opsional)..."
                    />
                    <small class="text-muted"
                      >Opsional — JPEG/PNG/WebP, maks 10MB</small
                    >
                  </b-form-group>

                  <div v-if="imageWaPreview" class="mt-2">
                    <img
                      :src="imageWaPreview"
                      alt="Preview Gambar WhatsApp"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                  </div>
                </b-col>

                <!-- Spinner saat submit -->
                <b-col cols="12" v-if="isPending" class="text-center">
                  <b-spinner variant="primary" class="me-2" />
                  <span class="text-muted">Menyimpan program...</span>
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
import { reactive, computed, ref, nextTick, onMounted } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
// import CurrencyInput from "@/components/CurrencyInput.vue";
import { QuillEditor } from "@vueup/vue-quill";
import { FormWizard, TabContent } from "vue3-form-wizard";

import "vue3-form-wizard/dist/style.css";
import "vue3-toastify/dist/index.css";

import {
  createProgram,
  getProgramPercentages,
  getProgramTypes,
  getProgramCategories,
} from "@/services/programService";
import { getAllMitra } from "@/services/mitraService";
import { uploadImage } from "@/services/utilityService";
import { toast, type ToastOptions } from "vue3-toastify";

// ── Helpers ────────────────────────────────────────────────────────────────
const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const router = useRouter();

// ── Nominal Items ──────────────────────────────────────────────────────────
interface NominalItem {
  nama: string;
  nominal: number | undefined;
}

const nominalItems = ref<NominalItem[]>([]);

const addNominalItem = () => {
  nominalItems.value.push({ nama: "", nominal: undefined });
};

const removeNominalItem = (index: number) => {
  nominalItems.value.splice(index, 1);
};

// ── Image state ────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null);
const imageWaFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imageWaPreview = ref<string | null>(null);

// ── Form state ─────────────────────────────────────────────────────────────
const formState = reactive({
  mitra_id: null as number | null,
  tipe_id: null as number | null,
  cateogry_id: null as number | null,
  program_percentage_id: null as number | null,
  judul: "",
  link: "",
  kode: "",
  status: "DRAFT",
  rangkuman: "",
  isi: "",
  video: "",
  is_target_waktu: "BEBAS",
  is_target_nominal: "BEBAS",
  target_waktu: "",
  target_nominal: undefined as number | undefined,
  jenis_nominal: "default",
  image: null as File | null,
  image_wa: null as File | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = computed(() => ({
  mitra_id: { required },
  tipe_id: { required },
  judul: { required },
  link: { required },
  kode: { required },
  status: { required },
  rangkuman: { required },
  image: { required },
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

const validateStep1 = () =>
  touchAndCheck(["mitra_id", "tipe_id", "judul", "link", "kode", "status"]);

const validateStep2 = () => touchAndCheck(["rangkuman"]);

const validateStep3 = () => touchAndCheck(["image"]);

// ── Data fetching ──────────────────────────────────────────────────────────
const queryClient = useQueryClient();

const { data: mitraData, isLoading: isMitraLoading } = useQuery({
  queryKey: ["mitra"],
  queryFn: getAllMitra,
});

const mitraList = computed(() => {
  if (!mitraData.value) return [{ value: 0, text: "Choose Mitra..." }];
  return [
    { value: 0, text: "Choose Mitra..." },
    ...mitraData.value.map((item: any) => ({
      value: item.id,
      text: item.nama,
    })),
  ];
});

const { data: tipeData, isLoading: isTipeLoading } = useQuery({
  queryKey: ["program-tipe"],
  queryFn: getProgramTypes,
});

const tipeList = computed(() => {
  if (!tipeData.value) return [{ value: 0, text: "Choose Tipe..." }];
  return [
    { value: 0, text: "Choose Tipe..." },
    ...tipeData.value.map((item: any) => ({ value: item.id, text: item.nama })),
  ];
});

const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
  queryKey: ["program-categories"],
  queryFn: getProgramCategories,
});

const categoryList = computed(() => {
  if (!categoryData.value) return [{ value: 0, text: "Choose Kategori..." }];
  return [
    { value: 0, text: "Choose Kategori..." },
    ...categoryData.value.map((item: any) => ({
      value: item.id,
      text: item.name,
    })),
  ];
});

const { data: percentageData, isLoading: isPercentageLoading } = useQuery({
  queryKey: ["program-percentages"],
  queryFn: getProgramPercentages,
});

const percentageList = computed(() => {
  if (!percentageData.value)
    return [{ value: 0, text: "Choose Percentage..." }];
  return [
    { value: 0, text: "Choose Percentage..." },
    ...percentageData.value.map((item: any) => ({
      value: item.id,
      text: `${item.name} (${item.program}% | ${item.operasional}% | ${item.komisi}%)`,
    })),
  ];
});

// ── Image handlers ─────────────────────────────────────────────────────────
const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  formState.image = file;
  v$.value.image.$touch();
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

const handleImageWaChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageWaFile.value = file;
  formState.image_wa = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageWaPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imageWaPreview.value = null;
  }
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: createProgramPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) => createProgram(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    showToast("Program berhasil dibuat", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/programs"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal membuat program";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

// ── Submit ─────────────────────────────────────────────────────────────────
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

  formData.append("mitra_id", String(formState.mitra_id));
  formData.append("tipe_id", String(formState.tipe_id));
  formData.append("judul", formState.judul.trim());
  formData.append("link", formState.link.trim());
  formData.append("kode", formState.kode.trim());
  formData.append("status", formState.status);
  formData.append("rangkuman", formState.rangkuman.trim());
  formData.append("is_target_waktu", formState.is_target_waktu);
  formData.append("is_target_nominal", formState.is_target_nominal);
  formData.append("jenis_nominal", formState.jenis_nominal);
  formData.append("image", imageFile.value as File);

  if (formState.cateogry_id)
    formData.append("cateogry_id", String(formState.cateogry_id));
  if (formState.program_percentage_id)
    formData.append(
      "program_percentage_id",
      String(formState.program_percentage_id),
    );
  if (formState.isi?.trim()) formData.append("isi", formState.isi.trim());
  if (formState.video?.trim()) formData.append("video", formState.video.trim());
  if (formState.is_target_waktu === "TERTENTU" && formState.target_waktu)
    formData.append("target_waktu", formState.target_waktu);
  if (formState.is_target_nominal === "TERTENTU" && formState.target_nominal)
    formData.append("target_nominal", String(formState.target_nominal));
  if (imageWaFile.value) formData.append("image_wa", imageWaFile.value);

  // Nominal items — hanya saat jenis_nominal = masukan
  if (formState.jenis_nominal === "masukan") {
    nominalItems.value.forEach((item, i) => {
      formData.append(`nominal_options[${i}][nama]`, item.nama);
      formData.append(
        `nominal_options[${i}][nominal]`,
        String(item.nominal ?? 0),
      );
    });
  }

  // createProgramPayload(formData);
  console.log(formState);
};

// ── Setup Quill editor untuk image upload ─────────────────────────────────
onMounted(() => {
  nextTick(() => {
    const imageButton = document.querySelector(
      "#program-form-create .ql-toolbar .ql-image",
    ) as HTMLButtonElement;
    if (imageButton) {
      imageButton.onclick = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/jpeg,image/png,image/webp,image/gif");

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          try {
            const imageUrl = await uploadImage(file);

            const editorDiv = document.querySelector(
              "#program-form-create .ql-editor",
            ) as HTMLElement;
            if (editorDiv) {
              const img = document.createElement("img");
              img.src = imageUrl;
              img.style.maxWidth = "100%";
              img.style.height = "auto";
              editorDiv.appendChild(img);

              formState.isi = editorDiv.innerHTML;
            }

            showToast("Gambar berhasil diunggah", {
              type: "success",
              position: "top-center",
            });
          } catch (err: any) {
            showToast(
              err?.response?.data?.message ?? "Gagal mengunggah gambar",
              {
                type: "error",
                position: "top-center",
              },
            );
          }
        };
        input.click();
      };
    }
  });
});

// ── Quill toolbar ──────────────────────────────────────────────────────────
const toolbar1 = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "super" }, { script: "sub" }],
  [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ["direction", { align: [] }],
  ["link", "image", "video"],
  ["clean"],
];
</script>
