<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Tambah Metode Pembayaran">
          <b-row class="g-3">
            <!-- Atas Nama -->
            <b-col md="6">
              <b-form-group label="Atas Nama" label-for="account_behalf">
                <b-form-input
                  id="account_behalf"
                  v-model="v$.account_behalf.$model"
                  type="text"
                  placeholder="e.g., Aksi Berbagi"
                  :state="v$.account_behalf.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.account_behalf.$error">
                  {{ v$.account_behalf.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- No Rekening -->
            <b-col md="6">
              <b-form-group label="No. Rekening" label-for="account_number">
                <b-form-input
                  id="account_number"
                  v-model="v$.account_number.$model"
                  type="text"
                  placeholder="e.g., 1227607782"
                  :state="v$.account_number.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.account_number.$error">
                  {{ v$.account_number.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Bank Reference -->
            <b-col md="6">
              <b-form-group
                label="Bank Reference"
                label-for="bank-reference-id"
              >
                <ChoicesSelect
                  id="bank-reference-id"
                  :modelValue="String(formState.bank_reference_id || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.bank_reference_id =
                        val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="bankReferenceOptions"
                  :isLoading="isBankReferenceLoading"
                  :key="bankReferenceOptions.length"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Fin Akun -->
            <b-col md="6">
              <b-form-group label="Akun Keuangan" label-for="fin-akun">
                <ChoicesSelect
                  id="fin-akun"
                  :modelValue="String(formState.fin_akun || 0)"
                  @update:modelValue="
                    (val) => {
                      formState.fin_akun = val === '0' ? 0 : Number(val);
                    }
                  "
                  :options="finAkunOptions"
                  :isLoading="isFinAkunLoading"
                  :key="finAkunOptions.length"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Bank Provider -->
            <b-col md="4">
              <b-form-group label="Bank Provider" label-for="bank_provider">
                <b-form-input
                  id="bank_provider"
                  v-model="formState.bank_provider"
                  type="text"
                  placeholder="e.g., xendit"
                  maxlength="100"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Kode -->
            <b-col md="4">
              <b-form-group label="Kode" label-for="code">
                <b-form-input
                  id="code"
                  v-model="formState.code"
                  type="text"
                  placeholder="e.g., 03"
                  maxlength="100"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Usage -->
            <b-col md="4">
              <b-form-group label="Usage" label-for="usage">
                <b-form-select id="usage" v-model="formState.usage">
                  <b-form-select-option value="penerima"
                    >Penerima</b-form-select-option
                  >
                  <b-form-select-option value="penampung"
                    >Penampung</b-form-select-option
                  >
                </b-form-select>
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Section: Keuangan -->
            <b-col cols="12"
              ><hr class="mt-3" />
              <h5 class="my-1 fw-semibold text-info">Keuangan</h5></b-col
            >

            <!-- Fee Type -->
            <b-col md="4">
              <b-form-group label="Tipe Fee" label-for="fee_type">
                <b-form-select id="fee_type" v-model="formState.fee_type">
                  <b-form-select-option value="amount"
                    >Nominal (Rp)</b-form-select-option
                  >
                  <b-form-select-option value="percentage"
                    >Persentase (%)</b-form-select-option
                  >
                </b-form-select>
              </b-form-group>
            </b-col>

            <!-- Fee -->
            <b-col md="4">
              <b-form-group label="Fee" label-for="fee">
                <b-input-group
                  :prepend="formState.fee_type === 'percentage' ? '%' : 'Rp'"
                >
                  <b-form-input
                    id="fee"
                    v-model.number="formState.fee"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </b-input-group>
              </b-form-group>
            </b-col>

            <!-- Saldo Terakhir -->
            <b-col md="4">
              <b-form-group label="Saldo Terakhir" label-for="saldo_terakhir">
                <b-input-group prepend="Rp">
                  <CurrencyInput
                    id="saldo_terakhir"
                    v-model="formState.saldo_terakhir"
                    placeholder="0"
                    :state="null"
                  />
                </b-input-group>
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Status -->
            <b-col cols="12">
              <b-form-checkbox v-model="formState.is_active" switch>
                Aktifkan metode pembayaran
              </b-form-checkbox>
            </b-col>

            <!-- Loading + Actions -->
            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" /><span
                class="text-muted"
                >Menyimpan...</span
              >
            </b-col>
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/payment-methods')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />Simpan Metode
                  Pembayaran
                </b-button>
              </div>
            </b-col>
          </b-row>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast, type ToastOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { createPaymentMethod } from "@/services/paymentMethodService";
import { getAllBankReferences } from "@/services/bankReferenceService";
import { getFinanceAccounts } from "@/services/financeAccountService";
import router from "@/router";

const showToast = (message: string, options: ToastOptions) =>
  toast(message, options);
const queryClient = useQueryClient();

const formState = reactive({
  account_behalf: "",
  account_number: "",
  bank_reference_id: 0,
  fin_akun: 0,
  bank_provider: "",
  code: "",
  usage: "",
  fee_type: "amount",
  fee: 0,
  saldo_terakhir: 0,
  is_active: true,
});

const rules = {
  account_behalf: {
    required: helpers.withMessage("Atas nama wajib diisi", required),
  },
  account_number: {
    required: helpers.withMessage("No. rekening wajib diisi", required),
  },
};

const v$ = useVuelidate(rules, formState);

// ── Dropdown options ─────────────────────────────────────────────────────────

const { data: bankReferenceData, isLoading: isBankReferenceLoading } = useQuery(
  {
    queryKey: ["bank-references-list"],
    queryFn: () => getAllBankReferences({ mode: "list" }),
  },
);
const bankReferenceOptions = computed(() => {
  const list = Array.isArray(bankReferenceData.value)
    ? bankReferenceData.value
    : [];
  return [
    { value: 0, text: "-- Pilih Bank Reference --" },
    ...list.map((b: any) => ({ value: b.id, text: b.name })),
  ];
});

const { data: finAkunData, isLoading: isFinAkunLoading } = useQuery({
  queryKey: ["finance-accounts-list"],
  queryFn: () => getFinanceAccounts({ mode: "list" }),
});
const finAkunOptions = computed(() => {
  const list = Array.isArray(finAkunData.value) ? finAkunData.value : [];
  return [
    { value: 0, text: "-- Pilih Akun Keuangan --" },
    ...list.map((a: any) => ({ value: a.id, text: `${a.number} - ${a.name}` })),
  ];
});

// ── Submit ───────────────────────────────────────────────────────────────────

const { mutate, isPending } = useMutation({
  mutationFn: () =>
    createPaymentMethod({
      account_behalf: formState.account_behalf.trim(),
      account_number: formState.account_number.trim(),
      ...(formState.bank_reference_id
        ? { bank_reference_id: formState.bank_reference_id }
        : {}),
      ...(formState.fin_akun ? { fin_akun: formState.fin_akun } : {}),
      ...(formState.bank_provider.trim()
        ? { bank_provider: formState.bank_provider.trim() }
        : {}),
      ...(formState.code.trim() ? { code: formState.code.trim() } : {}),
      ...(formState.usage.trim() ? { usage: formState.usage.trim() } : {}),
      fee_type: formState.fee_type,
      fee: formState.fee,
      saldo_terakhir: formState.saldo_terakhir,
      is_active: formState.is_active,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    showToast("Metode pembayaran berhasil ditambahkan", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/payment-methods"), 1500);
  },
  onError: (err: any) => {
    showToast(
      err?.response?.data?.message ?? "Gagal menambahkan metode pembayaran",
      {
        type: "error",
        position: "top-center",
      },
    );
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  if (!(await v$.value.$validate())) {
    showToast("Lengkapi field wajib", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
