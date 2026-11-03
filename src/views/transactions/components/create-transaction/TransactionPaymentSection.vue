<template>
  <UIComponentCard title="Detail Payment" class="mb-3">
    <b-row class="g-3">
      <b-col cols="12" md="6">
        <label class="form-label fw-semibold required">Payment Method</label>
        <SearchSelect
          id="payment-method-id"
          :modelValue="String(formState.payment_method_id || 0)"
          @update:modelValue="
            (val: any) => {
              emit(
                'update:field',
                'payment_method_id',
                val === '0' || !val ? null : Number(val),
              );
            }
          "
          @search="emit('search-payment-method', $event)"
          :options="paymentMethodOptions"
          :isLoading="isPaymentMethodLoading"
        />
        <div
          v-if="v$.payment_method_id.$error"
          class="invalid-feedback d-block"
        >
          {{ v$.payment_method_id.$errors[0]?.$message }}
        </div>
      </b-col>
    </b-row>

    <!-- Pencocokan Mutasi / Jurnal (Untuk Donation & Zakat) -->
    <b-row
      v-if="activeType === 'donation' || activeType === 'zakat'"
      class="g-3 mt-1"
    >
      <b-col cols="12">
        <hr class="my-2" />
        <h5 class="text-muted fw-semibold mb-3">
          Pencocokan Mutasi / Jurnal
        </h5>
      </b-col>

      <b-col cols="12" md="4">
        <label class="form-label fw-semibold">Total Nominal</label>
        <b-form-input
          :model-value="formatCurrency(activeGrandTotal)"
          disabled
        />
      </b-col>

      <b-col cols="12" md="3" class="d-flex align-items-end">
        <b-button
          variant="outline-primary"
          class="w-100"
          :disabled="isDataUnclaimed || formState.status !== 'Paid'"
          @click="emit('check-mutation')"
        >
          <b-spinner v-if="isDataUnclaimed" small class="me-1" />
          Cek Mutasi
        </b-button>
      </b-col>

      <b-col cols="12" md="5">
        <label class="form-label fw-semibold">Matching Mutation</label>
        <ChoicesSelect
          id="jurnal-id"
          :modelValue="String(formState.jurnal_id || 0)"
          @update:modelValue="
            (val: string) => {
              emit(
                'update:field',
                'jurnal_id',
                val === '0' ? null : Number(val),
              );
            }
          "
          :options="jurnalOptions"
          :isLoading="isDataUnclaimed"
          :disabled="formState.status !== 'Paid'"
          :key="jurnalOptions.length"
        />
      </b-col>
    </b-row>

    <!-- Actions -->
    <div class="d-flex gap-2 mt-3">
      <b-button type="submit" variant="primary" :disabled="isPending">
        <b-spinner v-if="isPending" small class="me-1" />
        {{ isPending ? "Menyimpan..." : "Simpan Transaksi" }}
      </b-button>
      <b-button variant="outline-secondary" @click="emit('cancel')">
        Batal
      </b-button>
    </div>
  </UIComponentCard>
</template>

<script setup lang="ts">
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import { formatCurrency } from "@/helpers/format";
import type { DedicatedType, FormState, SelectOption } from "./types";

defineProps<{
  activeType: DedicatedType | null;
  formState: FormState;
  v$: any;
  paymentMethodOptions: SelectOption[];
  isPaymentMethodLoading: boolean;
  activeGrandTotal: number;
  jurnalOptions: SelectOption[];
  isDataUnclaimed: boolean;
  isPending: boolean;
}>();

const emit = defineEmits<{
  (e: "update:field", field: keyof FormState, value: any): void;
  (e: "search-payment-method", query: string): void;
  (e: "check-mutation"): void;
  (e: "cancel"): void;
}>();
</script>

