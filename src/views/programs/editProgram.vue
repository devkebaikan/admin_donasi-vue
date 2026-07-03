<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard
          id="program-form-edit"
          :title="`Edit Program${programData ? ': ' + programData.title : ''}`"
        >
          <!-- Loading state -->
          <div v-if="isFetchingProgram" class="text-center py-5">
            <b-spinner variant="primary" class="me-2" />
            <span class="text-muted">Memuat data program...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="fetchError" class="text-center py-5">
            <i class="bx bx-error-circle fs-1 text-danger d-block mb-2"></i>
            <p class="text-danger">Gagal memuat data program.</p>
            <b-button
              variant="outline-primary"
              size="sm"
              @click="refetchProgram"
            >
              <i class="bx bx-refresh me-1"></i>Coba Lagi
            </b-button>
          </div>

          <!-- Form -->
          <form-wizard
            v-else-if="formReady"
            shape="tab"
            color="#1e84c4"
            back-button-text="Sebelumnya"
            next-button-text="Selanjutnya"
            finish-button-text="Simpan Perubahan"
            @on-complete="handleSubmit"
          >
            <!-- ══════════════════════════════════════════════════════════ STEP 1 — Identitas Program ══════════════════════════════════════════════════════════ -->
            <tab-content
              custom-icon='<a class="nav-link fs-5">Identitas</a>'
              :before-change="validateStep1"
            >
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
              :before-change="validateStep2"
            >
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
                  <b-form-group label="Isi Konten (HTML)" label-for="isi">
                    <QuillEditor
                      theme="snow"
                      :toolbar="toolbar1"
                      style="height: 260px"
                      placeholder="Konten HTML program..."
                      v-model:content="formState.isi"
                      content-type="html"
                    />
                  </b-form-group>
                  <small class="text-muted">Opsional</small>
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
                      :key="formState.is_target_nominal"
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
                      :key="`${formState.is_target_nominal}-${formState.target_nominal}`"
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
                        :state="null"
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
                    <!-- Preview gambar existing -->
                    <div v-if="existingImageUrl && !imagePreview" class="mb-2">
                      <p class="text-muted small mb-1">Gambar saat ini:</p>
                      <img
                        :src="existingImageUrl"
                        alt="Gambar Utama Saat Ini"
                        class="img-thumbnail w-100"
                        style="max-height: 220px; object-fit: cover"
                      />
                    </div>

                    <b-form-file
                      id="image"
                      accept="image/jpeg,image/png,image/webp"
                      :state="v$.image.$error ? false : null"
                      @change="handleImageChange"
                      :placeholder="
                        existingImageUrl
                          ? 'Ganti gambar utama (opsional)...'
                          : 'Pilih gambar utama...'
                      "
                    />
                    <b-form-invalid-feedback v-if="v$.image.$error">
                      Gambar utama wajib dipilih.
                    </b-form-invalid-feedback>
                    <small class="text-muted">
                      {{
                        existingImageUrl
                          ? "Kosongkan jika tidak ingin mengganti gambar."
                          : "JPEG/PNG/WebP, maks 10MB. Auto-converted to WebP."
                      }}
                    </small>
                  </b-form-group>

                  <!-- Preview gambar baru -->
                  <div v-if="imagePreview" class="mt-2">
                    <p class="text-muted small mb-1">Preview gambar baru:</p>
                    <img
                      :src="imagePreview"
                      alt="Preview Gambar Utama Baru"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                    <b-button
                      variant="outline-secondary"
                      size="sm"
                      class="mt-1"
                      @click="clearNewImage"
                    >
                      <i class="bx bx-x me-1"></i>Batalkan ganti gambar
                    </b-button>
                  </div>
                </b-col>

                <!-- Gambar WhatsApp -->
                <b-col md="6">
                  <b-form-group label="Gambar WhatsApp" label-for="image-wa">
                    <!-- Preview gambar WA existing -->
                    <div
                      v-if="existingImageWaUrl && !imageWaPreview"
                      class="mb-2"
                    >
                      <p class="text-muted small mb-1">
                        Gambar WhatsApp saat ini:
                      </p>
                      <img
                        :src="existingImageWaUrl"
                        alt="Gambar WA Saat Ini"
                        class="img-thumbnail w-100"
                        style="max-height: 220px; object-fit: cover"
                      />
                    </div>

                    <b-form-file
                      id="image-wa"
                      accept="image/jpeg,image/png,image/webp"
                      @change="handleImageWaChange"
                      :placeholder="
                        existingImageWaUrl
                          ? 'Ganti gambar WhatsApp (opsional)...'
                          : 'Pilih gambar WhatsApp (opsional)...'
                      "
                    />
                    <small class="text-muted">
                      {{
                        existingImageWaUrl
                          ? "Kosongkan jika tidak ingin mengganti gambar."
                          : "Opsional — JPEG/PNG/WebP, maks 10MB"
                      }}
                    </small>
                  </b-form-group>

                  <!-- Preview gambar WA baru -->
                  <div v-if="imageWaPreview" class="mt-2">
                    <p class="text-muted small mb-1">
                      Preview gambar WhatsApp baru:
                    </p>
                    <img
                      :src="imageWaPreview"
                      alt="Preview Gambar WhatsApp Baru"
                      class="img-thumbnail w-100"
                      style="max-height: 220px; object-fit: cover"
                    />
                    <b-button
                      variant="outline-secondary"
                      size="sm"
                      class="mt-1"
                      @click="clearNewImageWa"
                    >
                      <i class="bx bx-x me-1"></i>Batalkan ganti gambar
                    </b-button>
                  </div>
                </b-col>

                <!-- Spinner saat submit -->
                <b-col cols="12" v-if="isPending" class="text-center">
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
import { required, requiredIf } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
// import CurrencyInput from "@/components/CurrencyInput.vue";
import { QuillEditor } from "@vueup/vue-quill";
import { FormWizard, TabContent } from "vue3-form-wizard";

import "vue3-form-wizard/dist/style.css";
import "vue3-toastify/dist/index.css";

import {
  updateProgram,
  getProgramBylink,
  getProgramPercentages,
  getProgramTypes,
  getProgramCategories,
} from "@/services/programService";
import { getAllMitra } from "@/services/mitraService";
import { toast, type ToastOptions } from "vue3-toastify";

// ── Route params ───────────────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();
const programLink = computed(() => String(route.params.id));

// ── Helpers ────────────────────────────────────────────────────────────────
const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);

// ── Nominal Items ──────────────────────────────────────────────────────────
interface NominalItem {
  id?: number; // id existing dari server (jika ada)
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

// URL gambar yang sudah tersimpan di server
const existingImageUrl = ref<string | null>(null);
const existingImageWaUrl = ref<string | null>(null);

// ── Form state ─────────────────────────────────────────────────────────────
const formReady = ref(false);

const formState = reactive({
  mitra_id: null as number | null,
  id: null as number | null,
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
  // image tidak required saat edit (boleh kosong = tidak ganti)
  image: null as File | null,
  image_wa: null as File | null,
});

// ── Validation ─────────────────────────────────────────────────────────────
const rules = computed(() => ({
  mitra_id: { required },
  tipe_id: { required },
  judul: { required },
  link: { required },
  kode: {},
  status: { required },
  rangkuman: { required },
  // Gambar tidak wajib saat edit — hanya wajib jika belum ada gambar existing
  image: {
    requiredIfNoExisting: requiredIf(() => !existingImageUrl.value),
  },
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

// ── Fetch program by ID ────────────────────────────────────────────────────
const {
  data: programData,
  isLoading: isFetchingProgram,
  isError: fetchError,
  refetch: refetchProgram,
} = useQuery({
  queryKey: ["program", programLink],
  queryFn: () => getProgramBylink(programLink.value),
  enabled: computed(() => !!programLink.value),
});

// ── Pre-fill form saat data program tersedia ───────────────────────────────
watch(
  programData,
  (data) => {
    if (!data) return;

    // console.log(data);
    formState.id = data.id ?? null;
    formState.mitra_id = data.mitra?.id ?? null;
    formState.tipe_id = data.tipe?.id ?? null;
    formState.cateogry_id = data.category?.id ?? null;
    formState.program_percentage_id = data.program_percentage_id ?? null;

    formState.judul = data.title ?? "";
    formState.link = data.link ?? "";
    formState.kode = data.kode ?? "";

    formState.status = data.status ?? "DRAFT";

    formState.rangkuman = data.description ?? "";
    formState.isi = data.content ?? "";
    formState.video = data.video ?? "";

    formState.is_target_waktu = data.time_target ? "TERTENTU" : "BEBAS";
    formState.is_target_nominal = data.nominal_target ? "TERTENTU" : "BEBAS";

    formState.target_waktu = data.time_target ?? "";
    formState.target_nominal = data.nominal_target ?? 0;

    formState.jenis_nominal = data.jenis_nominal ?? "default";

    // Gambar existing
    existingImageUrl.value = data.image_url ?? data.image ?? null;
    existingImageWaUrl.value = data.image_wa_url ?? data.image_wa ?? null;

    // console.log(formState.is_target_waktu, formState.target_nominal);

    // Nominal items existing
    if (Array.isArray(data.nominal_options)) {
      nominalItems.value = data.nominal_options.map((item: any) => ({
        id: item.id,
        nama: item.nama ?? "",
        nominal: item.nominal ?? undefined,
      }));
    }

    formReady.value = true;
  },
  { immediate: true },
);

// ── Data fetching (dropdown options) ──────────────────────────────────────
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

const tipeList = [
  { value: 0, text: "Choose Tipe..." },
  { value: 1, text: "Zakat" },
  { value: 2, text: "Infaq" },
  { value: 3, text: "Sadaqah" },
  { value: 4, text: "Wakaf" },
];

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

const clearNewImage = () => {
  imageFile.value = null;
  formState.image = null;
  imagePreview.value = null;
};

const clearNewImageWa = () => {
  imageWaFile.value = null;
  formState.image_wa = null;
  imageWaPreview.value = null;
};

// ── Mutation ───────────────────────────────────────────────────────────────
const { mutate: updateProgramPayload, isPending } = useMutation({
  mutationFn: (payload: FormData) =>
    updateProgram(Number(formState.id), payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    queryClient.invalidateQueries({ queryKey: ["program", programLink] });
    showToast("Program berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/programs"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui program";
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

  // Method spoofing untuk Laravel (jika menggunakan _method)
  formData.append("_method", "PUT");

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

  // Gambar hanya dikirim jika user memilih file baru
  if (imageFile.value) formData.append("image", imageFile.value);
  if (imageWaFile.value) formData.append("image_wa", imageWaFile.value);

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

  // Nominal items — hanya saat jenis_nominal = masukan
  if (formState.jenis_nominal === "masukan") {
    nominalItems.value.forEach((item, i) => {
      // Kirim id jika item existing (untuk update/delete di backend)
      if (item.id)
        formData.append(`nominal_options[${i}][id]`, String(item.id));
      formData.append(`nominal_options[${i}][nama]`, item.nama);
      formData.append(
        `nominal_options[${i}][nominal]`,
        String(item.nominal ?? 0),
      );
    });
  }

  updateProgramPayload(formData);
};

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
