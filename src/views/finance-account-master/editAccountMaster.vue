<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12">
        <UIComponentCard title="Edit Akun Keuangan Master">
          <div v-if="masterLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data...</p>
          </div>

          <div v-else-if="masterError" class="alert alert-danger">
            Gagal memuat data. Silakan coba lagi.
          </div>

          <form v-else @submit.prevent="handleSubmit">
            <b-row>
              <!-- Name -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold required">Name</label>
                <b-form-input
                  v-model="formState.name"
                  type="text"
                  placeholder="Contoh: amil_zakat"
                  :state="v$.name.$dirty ? !v$.name.$error : null"
                />
                <div v-if="v$.name.$error" class="invalid-feedback d-block">
                  {{ v$.name.$errors[0]?.$message }}
                </div>
              </b-col>

              <!-- Description -->
              <b-col cols="12" class="mb-4">
                <label class="form-label fw-semibold">Deskripsi</label>
                <b-form-textarea
                  v-model="formState.description"
                  rows="3"
                  placeholder="Keterangan akun master..."
                />
              </b-col>
            </b-row>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <b-button type="submit" variant="primary" :disabled="isPending">
                <b-spinner v-if="isPending" small class="me-1" />
                {{ isPending ? "Menyimpan..." : "Simpan Perubahan" }}
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="router.push('/finance-account-master')"
              >
                Batal
              </b-button>
            </div>
          </form>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import {
  getAccountMasterById,
  updateAccountMaster,
} from "@/services/financeAccountMasterService";
import router from "@/router";

const route = useRoute();
const masterId = Number(route.params.id);
const queryClient = useQueryClient();

const formState = reactive({
  name: "",
  description: "",
  akun_id: null as number | null,
});

const rules = {
  name: {
    required: helpers.withMessage("Name wajib diisi.", required),
  },
  akun_id: {
    required: helpers.withMessage("Akun keuangan wajib dipilih.", required),
    minValue: helpers.withMessage("Pilih akun yang valid.", minValue(1)),
  },
};

const v$ = useVuelidate(rules, formState);

const {
  data: masterData,
  isLoading: masterLoading,
  isError: masterError,
} = useQuery({
  queryKey: ["finance-account-master", masterId],
  queryFn: () => getAccountMasterById(masterId),
  enabled: !!masterId,
});

watch(masterData, (data) => {
  if (!data) return;
  formState.name = data.name ?? "";
  formState.description = data.description ?? "";
  formState.akun_id = data.akun_id ?? null;
});

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Record<string, any>) =>
    updateAccountMaster(masterId, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["finance-accounts-master"],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["finance-account-master", masterId],
    });
    toast.success("Akun keuangan master berhasil diperbarui.");
    router.push("/finance-account-master");
  },
  onError: () => {
    toast.error("Gagal memperbarui data. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  const payload: Record<string, any> = {
    name: formState.name,
    akun_id: formState.akun_id,
  };

  if (formState.description) payload.description = formState.description;

  mutate(payload);
};
</script>
