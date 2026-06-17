<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12">
        <UIComponentCard title="Edit Akun Keuangan">
          <div v-if="accountLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data akun...</p>
          </div>

          <div v-else-if="accountError" class="alert alert-danger">
            Gagal memuat data akun. Silakan coba lagi.
          </div>

          <form v-else @submit.prevent="handleSubmit">
            <b-row>
              <!-- Nomor Akun -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold required"
                  >Nomor Akun</label
                >
                <b-form-input
                  v-model.number="formState.number"
                  type="number"
                  placeholder="Contoh: 11102101"
                  :state="v$.number.$dirty ? !v$.number.$error : null"
                />
                <div v-if="v$.number.$error" class="invalid-feedback d-block">
                  {{ v$.number.$errors[0]?.$message }}
                </div>
              </b-col>

              <!-- Nama Akun -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold required">Nama Akun</label>
                <b-form-input
                  v-model="formState.name"
                  type="text"
                  placeholder="Contoh: Bank BRI 001201001453562"
                  :state="v$.name.$dirty ? !v$.name.$error : null"
                />
                <div v-if="v$.name.$error" class="invalid-feedback d-block">
                  {{ v$.name.$errors[0]?.$message }}
                </div>
              </b-col>

              <!-- Type -->
              <b-col cols="12" md="4" class="mb-3">
                <label class="form-label fw-semibold">Type</label>
                <b-form-select v-model="formState.type">
                  <option value="">Pilih type</option>
                  <option value="D">D - Debit</option>
                  <option value="K">K - Kredit</option>
                </b-form-select>
              </b-col>

              <!-- Laporan -->
              <b-col cols="12" md="4" class="mb-3">
                <label class="form-label fw-semibold">Laporan</label>
                <b-form-select v-model="formState.laporan">
                  <option value="">Pilih laporan</option>
                  <option value="NR">NR</option>
                  <option value="LPD-T">LPD-T</option>
                  <option value="LPD-TD">LPD-TD</option>
                  <option value="LPD-A">LPD-A</option>
                  <option value="LPD-Z">LPD-Z</option>
                  <option value="LPD-I">LPD-I</option>
                </b-form-select>
              </b-col>

              <!-- Have Child -->
              <b-col cols="12" md="4" class="mb-3">
                <label class="form-label fw-semibold required"
                  >Have Child</label
                >
                <b-form-select
                  v-model="formState.have_child"
                  :state="v$.have_child.$dirty ? !v$.have_child.$error : null"
                >
                  <option value="">Pilih opsi</option>
                  <option value="Y">Y - Punya sub-akun</option>
                  <option value="N">N - Tidak punya sub-akun</option>
                </b-form-select>
                <div
                  v-if="v$.have_child.$error"
                  class="invalid-feedback d-block"
                >
                  {{ v$.have_child.$errors[0]?.$message }}
                </div>
              </b-col>

              <!-- Parent ID -->
              <b-col cols="12" class="mb-3">
                <label class="form-label fw-semibold">Parent Akun</label>
                <b-form-select v-model.number="formState.parent_id">
                  <option :value="null">Tidak ada parent (top-level)</option>
                  <option
                    v-for="acc in parentOptions"
                    :key="acc.id"
                    :value="acc.id"
                  >
                    {{ acc.number }} - {{ acc.name }}
                  </option>
                </b-form-select>
                <div v-if="parentLoading" class="form-text text-muted">
                  <b-spinner small class="me-1" />Memuat daftar akun...
                </div>
              </b-col>

              <!-- Saldo Awal -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold">Saldo Awal</label>
                <b-form-input
                  v-model.number="formState.saldo_awal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </b-col>

              <!-- Is Saldo -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold">Is Saldo</label>
                <b-form-input
                  v-model.number="formState.is_saldo"
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </b-col>

              <!-- Sub Parent -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold">Sub Parent</label>
                <b-form-input
                  v-model="formState.sub_parent"
                  type="text"
                  placeholder="Sub parent"
                  maxlength="255"
                />
              </b-col>

              <!-- Sum -->
              <b-col cols="12" md="6" class="mb-3">
                <label class="form-label fw-semibold">Sum</label>
                <b-form-input
                  v-model="formState.sum"
                  type="text"
                  placeholder="Sum"
                  maxlength="255"
                />
              </b-col>

              <!-- Detail -->
              <b-col cols="12" class="mb-4">
                <label class="form-label fw-semibold">Detail</label>
                <b-form-textarea
                  v-model="formState.detail"
                  rows="3"
                  placeholder="Keterangan tambahan..."
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
                @click="router.push('/finance-account')"
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
import { reactive, computed, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue, maxLength } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import {
  getFinanceAccountById,
  getFinanceAccounts,
  updateFinanceAccount,
} from "@/services/financeAccountService";
import router from "@/router";

const route = useRoute();
const accountId = Number(route.params.id);
const queryClient = useQueryClient();

const formState = reactive({
  number: null as number | null,
  name: "",
  type: "",
  laporan: "",
  have_child: "",
  parent_id: null as number | null,
  saldo_awal: null as number | null,
  is_saldo: null as number | null,
  sub_parent: "",
  sum: "",
  detail: "",
});

const rules = {
  number: {
    required: helpers.withMessage("Nomor akun wajib diisi.", required),
    minValue: helpers.withMessage("Nomor minimal 1.", minValue(1)),
  },
  name: {
    required: helpers.withMessage("Nama akun wajib diisi.", required),
    maxLength: helpers.withMessage("Maksimal 255 karakter.", maxLength(255)),
  },
  have_child: {
    required: helpers.withMessage("Have child wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const {
  data: accountData,
  isLoading: accountLoading,
  isError: accountError,
} = useQuery({
  queryKey: ["finance-account", accountId],
  queryFn: () => getFinanceAccountById(accountId),
  enabled: !!accountId,
});

const { data: accountsData, isLoading: parentLoading } = useQuery({
  queryKey: ["finance-accounts-list"],
  queryFn: () => getFinanceAccounts({ mode: "list", have_child: "Y" }),
});

const parentOptions = computed(() => {
  const list = accountsData.value?.data ?? accountsData.value ?? [];
  return list.filter((acc: any) => acc.id !== accountId);
});

watch(accountData, (data) => {
  if (!data) return;
  formState.number = data.number ?? null;
  formState.name = data.name ?? "";
  formState.type = data.type ?? "";
  formState.laporan = data.laporan ?? "";
  formState.have_child = data.have_child ?? "";
  formState.parent_id = data.parent_id ?? null;
  formState.saldo_awal = data.saldo_awal ?? null;
  formState.is_saldo = data.is_saldo ?? null;
  formState.sub_parent = data.sub_parent ?? "";
  formState.sum = data.sum ?? "";
  formState.detail = data.detail ?? "";
});

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Record<string, any>) =>
    updateFinanceAccount(accountId, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["finance-accounts"],
      exact: false,
    });
    queryClient.invalidateQueries({ queryKey: ["finance-account", accountId] });
    toast.success("Akun keuangan berhasil diperbarui.");
    router.push("/finance-account");
  },
  onError: () => {
    toast.error("Gagal memperbarui akun. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  const payload: Record<string, any> = {
    number: formState.number,
    name: formState.name,
    have_child: formState.have_child,
  };

  if (formState.type) payload.type = formState.type;
  if (formState.laporan) payload.laporan = formState.laporan;
  payload.parent_id = formState.parent_id ?? null;
  if (formState.saldo_awal !== null) payload.saldo_awal = formState.saldo_awal;
  if (formState.is_saldo !== null) payload.is_saldo = formState.is_saldo;
  if (formState.sub_parent) payload.sub_parent = formState.sub_parent;
  if (formState.sum) payload.sum = formState.sum;
  if (formState.detail) payload.detail = formState.detail;

  mutate(payload);
};
</script>
