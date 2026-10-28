<template>
  <PipelineLayout>
    <div v-if="isLoadingDetail" class="text-center p-5">
      <b-spinner variant="primary" />
      <p class="mt-2 mb-0 text-muted">Memuat detail user...</p>
    </div>

    <div v-else-if="!userDetail" class="alert alert-warning">
      Data user tidak ditemukan.
    </div>

    <template v-else>
      <!-- Info User -->
      <UIComponentCard class="mb-3">
        <div class="d-flex align-items-center gap-3">
          <div>
            <div class="fw-semibold fs-6">{{ userDetail.name ?? "-" }}</div>
            <div class="text-muted small">
              {{ userDetail.phone ?? "-" }} &bull; ID: {{ userDetail.id }}
            </div>
          </div>
          <span v-if="userDetail.role?.name" class="badge bg-primary ms-auto">
            {{ userDetail.role.name }}
          </span>
        </div>
      </UIComponentCard>

      <!-- Form Profiling -->
      <UIComponentCard title="Form Profiling">
        <hr class="mb-3" />

        <!-- Donatur Info -->
        <p class="text-muted small fw-semibold mb-2">Informasi Donatur</p>
        <b-row class="g-3 mb-3">
          <b-col md="6">
            <b-form-group label="Panggilan" label-for="f-panggilan">
              <b-form-input id="f-panggilan" v-model="form.panggilan" placeholder="Contoh: Kak Ayu" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Nama Asli" label-for="f-real-name">
              <b-form-input id="f-real-name" v-model="form.real_name" placeholder="Nama lengkap" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Soft" label-for="f-soft">
              <b-form-input id="f-soft" v-model="form.soft" placeholder="Info soft" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Soft Terakhir" label-for="f-soft-terakhir">
              <b-form-input id="f-soft-terakhir" v-model="form.soft_terakhir" placeholder="Soft terakhir" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Hard" label-for="f-hard">
              <b-form-input id="f-hard" v-model="form.hard" placeholder="Info hard" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Hard Terakhir" label-for="f-hard-terakhir">
              <b-form-input id="f-hard-terakhir" v-model="form.hard_terakhir" placeholder="Hard terakhir" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Exis" label-for="f-exis">
              <b-form-input id="f-exis" v-model="form.exis" placeholder="Info exis" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Is Bill Official" label-for="f-is-bill">
              <b-form-checkbox id="f-is-bill" v-model="form.is_bill_official" switch>
                {{ form.is_bill_official ? "Ya" : "Tidak" }}
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>

        <hr class="mb-3" />

        <!-- CRM Info -->
        <p class="text-muted small fw-semibold mb-2">Informasi CRM</p>
        <b-row class="g-3 mb-3">
          <b-col md="6">
            <b-form-group label="Level" label-for="f-level">
              <b-form-select id="f-level" v-model="form.level" :options="levelOptions" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Cycle Status" label-for="f-cycle-status">
              <b-form-select id="f-cycle-status" v-model="form.cycle_status" :options="cycleStatusOptions" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Kota" label-for="f-kota">
              <b-form-input id="f-kota" v-model="form.kota" placeholder="Kota domisili" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Pekerjaan" label-for="f-pekerjaan">
              <b-form-input id="f-pekerjaan" v-model="form.pekerjaan" placeholder="Pekerjaan" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Komunitas" label-for="f-komunitas">
              <b-form-input id="f-komunitas" v-model="form.komunitas" placeholder="Komunitas" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Usia Range" label-for="f-usia">
              <b-form-select id="f-usia" v-model="form.usia_range" :options="rangeAgeOptions" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Poin" label-for="f-poin">
              <b-form-input id="f-poin" v-model.number="form.poin" type="number" placeholder="0" />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Hari Tidak Aktif" label-for="f-hari-tidak-aktif">
              <b-form-input id="f-hari-tidak-aktif" v-model.number="form.hari_tidak_aktif" type="number" placeholder="0" />
            </b-form-group>
          </b-col>
          <!-- <b-col cols="12">
            <b-form-group label="Keterangan" label-for="f-keterangan">
              <b-form-textarea id="f-keterangan" v-model="form.keterangan" rows="2" placeholder="Keterangan tambahan" />
            </b-form-group>
          </b-col> -->
          <b-col cols="12">
            <b-form-group label="Note" label-for="f-note">
              <b-form-textarea id="f-note" v-model="form.note" rows="2" placeholder="Note internal" />
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Actions -->
        <div class="d-flex justify-content-end gap-2 mt-2">
          <b-button variant="outline-secondary" size="sm" @click="goBack">
            <i class="bx bx-arrow-back me-1" />Kembali
          </b-button>
          <b-button variant="outline-secondary" size="sm" :disabled="isPending" @click="resetForm">
            Reset
          </b-button>
          <b-button variant="primary" size="sm" :disabled="isPending || !isDirty" @click="handleSubmit">
            <b-spinner v-if="isPending" small class="me-1" />
            Simpan
          </b-button>
        </div>
      </UIComponentCard>
    </template>
  </PipelineLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast as showToast } from "vue3-toastify";
import UIComponentCard from "@/components/UIComponentCard.vue";
import PipelineLayout from "@/components/PipelineLayout.vue";
import {  getUserProfileById, updateCRMUserProfiling } from "@/services/userService";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const userId = computed(() => {
  const routeId = Number(route.params.id);
  if (routeId > 0) return routeId;
  const queryId = Number(route.query.user_id);
  if (queryId > 0) return queryId;
  return 0;
});

// Field options
const levelOptions = ["New", "Regular", "Loyal", "VIP", "VVIP"];
const cycleStatusOptions = ["Aktif", "Tidak Aktif", "Pasif"];
const rangeAgeOptions = [
  ">15",
  "15-20",
  "21-30",
  "31-40",
  "41-50",
  "51-60",
  ">60",
];

// Form state (flat - all editable fields)
const form = reactive({
  // donatur fields
  id: null as number | null,
  panggilan: "",
  real_name: "",
  soft: "",
  soft_terakhir: "",
  hard: "",
  hard_terakhir: "",
  exis: "",
  is_bill_official: false,
  // crm top-level fields
  level: "New" as string,
  cycle_status: "Aktif" as string,
  kota: "",
  pekerjaan: "",
  komunitas: "",
  usia_range: "",
  poin: 0,
  hari_tidak_aktif: 0,
  // keterangan: "",
  note: "",
});

// Snapshot to detect dirty state
const snapshot = ref<typeof form>({ ...form });

const isDirty = computed(() => {
  return (Object.keys(form) as Array<keyof typeof form>).some(
    (key) => form[key] !== snapshot.value[key],
  );
});

const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
  queryKey: computed(() => ["user-detail-profiling", userId.value]),
  queryFn: () => getUserProfileById(userId.value),
  enabled: computed(() => userId.value > 0),
});

const fillForm = () => {
  const d = userDetail.value?.donatur ?? {};
  const u = userDetail.value ?? {};

  form.id = d.user_id ?? null;
  form.panggilan = d.panggilan ?? "";
  form.real_name = d.real_name ?? u.name ?? "";
  form.soft = d.soft ?? "";
  form.soft_terakhir = d.soft_terakhir ?? "";
  form.hard = d.hard ?? "";
  form.hard_terakhir = d.hard_terakhir ?? "";
  form.exis = d.exis ?? "";
  form.is_bill_official = d.is_bill_official ?? false;

  form.level = u.level ?? "New";
  form.cycle_status = u.cycle_status ?? "Aktif";
  form.kota = u.kota ?? "";
  form.pekerjaan = u.pekerjaan ?? "";
  form.komunitas = u.komunitas ?? "";
  form.usia_range = u.usia_range ?? "";
  form.poin = u.poin ?? 0;
  form.hari_tidak_aktif = u.hari_tidak_aktif ?? 0;
  // form.keterangan = u.keterangan ?? "";
  form.note = u.note ?? "";

  snapshot.value = { ...form };
};

watch(userDetail, () => {
  if (userDetail.value) fillForm();
});

// Build payload with only changed fields
const buildPayload = () => {
  const payload: Record<string, any> = {};

  const donaturFields: Array<keyof typeof form> = [
    "panggilan", "real_name", "soft", "soft_terakhir",
    "hard", "hard_terakhir", "exis", "is_bill_official",
  ];
  const donaturPayload: Record<string, any> = {};
  for (const key of donaturFields) {
    if (form[key] !== snapshot.value[key]) {
      donaturPayload[key] = form[key];
    }
  }
  if (Object.keys(donaturPayload).length > 0) {
    payload.donatur = donaturPayload;
  }

  const topFields: Array<keyof typeof form> = [
    "level", "cycle_status", "kota", "pekerjaan",
    "komunitas", "usia_range", "poin", "hari_tidak_aktif", "note",
  ];
  for (const key of topFields) {
    if (form[key] !== snapshot.value[key]) {
      payload[key] = form[key];
    }
  }

  return payload;
};

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const payload = buildPayload();
    return updateCRMUserProfiling(userId.value, payload);
  },
  onSuccess: () => {
    snapshot.value = { ...form };
    queryClient.invalidateQueries({ queryKey: ["user-detail-profiling", userId.value] });
    queryClient.invalidateQueries({ queryKey: ["user-detail", userId.value] });
    showToast("Profiling berhasil disimpan", { type: "success", position: "top-center" });
  },
  onError: (error: any) => {
    const msg =
      error?.response?.data?.message ?? error?.message ?? "Gagal menyimpan profiling";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = () => {
  if (!userId.value) {
    showToast("ID user tidak valid", { type: "warning", position: "top-center" });
    return;
  }
  mutate();
};

const resetForm = () => fillForm();

const goBack = () => router.back();
</script>
