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
      <UIComponentCard title="Detail User" class="mb-3">
        <hr class="mb-3" />
        <b-row class="g-3">
          <b-col md="2">
            <small class="text-muted d-block">User ID</small>
            <span class="fs-13 fw-semibold">{{ userDetail.id ?? "-" }}</span>
          </b-col>
          <b-col md="2">
            <small class="text-muted d-block">Nama</small>
            <span class="fs-13 fw-semibold">{{ userDetail.name ?? "-" }}</span>
          </b-col>
          <b-col md="2">
            <small class="text-muted d-block">Telepon</small>
            <span class="fs-13 fw-semibold">{{ userDetail.phone ?? "-" }}</span>
          </b-col>
          <b-col md="2">
            <small class="text-muted d-block">Role</small>
            <span class="fs-13 fw-semibold">{{
              userDetail.role?.name ?? "-"
            }}</span>
          </b-col>
          <b-col md="2">
            <small class="text-muted d-block">Panggilan Saat Ini</small>
            <span class="fs-13 fw-semibold">{{
              userDetail.donatur?.panggilan ?? "-"
            }}</span>
          </b-col>
        </b-row>
      </UIComponentCard>

      <UIComponentCard title="Form Profiling" class="mb-3">
        <hr class="mb-3" />
        <b-row class="g-3">
          <b-col md="6">
            <b-form-group label="Panggilan" label-for="profiling-panggilan">
              <b-form-input
                id="profiling-panggilan"
                v-model="formState.panggilan"
                type="text"
                placeholder="Contoh: Kak Ayu"
              />
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Nama Asli" label-for="profiling-real-name">
              <b-form-input
                id="profiling-real-name"
                v-model="formState.real_name"
                type="text"
                placeholder="Contoh: Ayu Wulandari"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="CS ID" label-for="profiling-cs-id">
              <b-form-input
                id="profiling-cs-id"
                v-model.number="formState.cs_id"
                type="number"
                min="1"
                placeholder="Contoh: 1"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="Soft" label-for="profiling-soft">
              <b-form-input
                id="profiling-soft"
                v-model="formState.soft"
                type="text"
                placeholder="Info soft"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group
              label="Soft Terakhir"
              label-for="profiling-soft-terakhir"
            >
              <b-form-input
                id="profiling-soft-terakhir"
                v-model="formState.soft_terakhir"
                type="text"
                placeholder="Info soft terakhir"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="Hard" label-for="profiling-hard">
              <b-form-input
                id="profiling-hard"
                v-model="formState.hard"
                type="text"
                placeholder="Info hard"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group
              label="Hard Terakhir"
              label-for="profiling-hard-terakhir"
            >
              <b-form-input
                id="profiling-hard-terakhir"
                v-model="formState.hard_terakhir"
                type="text"
                placeholder="Info hard terakhir"
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="Exis" label-for="profiling-exis">
              <b-form-input
                id="profiling-exis"
                v-model="formState.exis"
                type="text"
                placeholder="Info exis"
              />
            </b-form-group>
          </b-col>

          <!-- <b-col md="12">
            <b-form-group
              label="JSON Info (Array JSON)"
              label-for="profiling-json-info"
            >
              <b-form-textarea
                id="profiling-json-info"
                v-model="jsonInfoText"
                rows="3"
                placeholder="Contoh: [0] atau [1,2,3]"
              />
            </b-form-group>
          </b-col> -->

          <b-col cols="12">
            <div class="d-flex justify-content-end gap-2">
              <b-button variant="outline-secondary" size="sm" @click="goBack">
                <i class="bx bx-arrow-back me-1"></i>Kembali
              </b-button>
              <b-button
                variant="outline-secondary"
                :disabled="isPending"
                @click="resetForm"
              >
                Reset
              </b-button>
              <b-button
                variant="primary"
                :disabled="isPending"
                @click="handleSubmit"
              >
                <b-spinner v-if="isPending" small class="me-1" />
                Simpan Profiling
              </b-button>
            </div>
          </b-col>
        </b-row>
      </UIComponentCard>
    </template>
  </PipelineLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast as showToast } from "vue3-toastify";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getUserDetailById, updateUserProfiling } from "@/services/userService";
import PipelineLayout from "@/components/PipelineLayout.vue";

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

const formState = reactive({
  cs_id: null as number | null,
  exis: "",
  hard: "",
  hard_terakhir: "",
  panggilan: "",
  real_name: "",
  soft: "",
  soft_terakhir: "",
});
const jsonInfoText = ref("[]");

const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
  queryKey: computed(() => ["user-detail-profiling", userId.value]),
  queryFn: () => getUserDetailById(userId.value),
  enabled: computed(() => userId.value > 0),
});

const fillFormFromDetail = () => {
  const d = userDetail.value?.donatur ?? {};

  formState.cs_id = d.cs_id ?? null;
  formState.exis = d.exis ?? "";
  formState.hard = d.hard ?? "";
  formState.hard_terakhir = d.hard_terakhir ?? "";
  formState.panggilan = d.panggilan ?? "";
  formState.real_name = d.real_name ?? userDetail.value?.name ?? "";
  formState.soft = d.soft ?? "";
  formState.soft_terakhir = d.soft_terakhir ?? "";

  const rawInfo = Array.isArray(d.json_info) ? d.json_info : [];
  jsonInfoText.value = JSON.stringify(rawInfo);
};

watch(userDetail, () => {
  if (!userDetail.value) return;
  fillFormFromDetail();
});

const parseJsonInfo = () => {
  if (!jsonInfoText.value.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonInfoText.value);
  } catch {
    throw new Error("Format JSON Info tidak valid. Contoh yang benar: [0,1,2]");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON Info harus berupa array.");
  }

  return parsed;
};

const { mutate, isPending } = useMutation({
  mutationFn: async () => {
    const payload = {
      cs_id: formState.cs_id,
      exis: formState.exis,
      hard: formState.hard,
      hard_terakhir: formState.hard_terakhir,
      json_info: parseJsonInfo(),
      panggilan: formState.panggilan,
      real_name: formState.real_name,
      soft: formState.soft,
      soft_terakhir: formState.soft_terakhir,
    };

    return updateUserProfiling(userId.value, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["user-detail-profiling", userId.value],
    });
    queryClient.invalidateQueries({ queryKey: ["user-detail", userId.value] });
    queryClient.invalidateQueries({ queryKey: ["users", userId.value] });
    showToast("Profiling user berhasil disimpan", {
      type: "success",
      position: "top-center",
    });
  },
  onError: (error: any) => {
    const msg =
      error?.response?.data?.message ??
      error?.message ??
      "Gagal menyimpan profiling user";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = () => {
  if (!userId.value) {
    showToast("ID user tidak valid", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  mutate();
};

const resetForm = () => {
  fillFormFromDetail();
};

const goBack = () => {
  router.back();
};
</script>
