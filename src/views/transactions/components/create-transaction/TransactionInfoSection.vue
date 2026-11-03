<template>
  <UIComponentCard title="Informasi Detail" class="mb-3">
    <b-row class="g-3">
      <b-col cols="12" md="3">
        <label class="form-label fw-semibold required">Tanggal</label>
        <FlatPicker
          id="tx-date"
          :model-value="formState.date"
          @update:model-value="emit('update:field', 'date', $event)"
          placeholder="Pilih tanggal"
          :options="{ dateFormat: 'Y-m-d' }"
        />
        <div v-if="v$.date.$error" class="invalid-feedback d-block">
          {{ v$.date.$errors[0]?.$message }}
        </div>
      </b-col>

      <b-col cols="12" md="3">
        <label class="form-label fw-semibold required">Waktu</label>
        <FlatPicker
          id="tx-time"
          :model-value="formState.time"
          @update:model-value="emit('update:field', 'time', $event)"
          placeholder="Pilih waktu"
          :options="{
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i:S',
            time_24hr: true,
          }"
        />
        <div v-if="v$.time.$error" class="invalid-feedback d-block">
          {{ v$.time.$errors[0]?.$message }}
        </div>
      </b-col>

      <b-col cols="12" md="3">
        <label class="form-label fw-semibold required">Status</label>
        <b-form-select
          :model-value="formState.status"
          @update:model-value="emit('update:field', 'status', $event)"
          :state="v$.status.$dirty ? !v$.status.$error : null"
        >
          <b-form-select-option value="Paid">Paid</b-form-select-option>
          <b-form-select-option value="Pending">Pending</b-form-select-option>
        </b-form-select>
        <div v-if="v$.status.$error" class="invalid-feedback d-block">
          {{ v$.status.$errors[0]?.$message }}
        </div>
      </b-col>

      <b-col cols="12" md="3">
        <label class="form-label fw-semibold">Source</label>
        <b-form-input
          :model-value="formState.source"
          @update:model-value="emit('update:field', 'source', $event)"
          placeholder="CRM, direct, ..."
        />
      </b-col>

      <b-col cols="12" md="4">
        <label class="form-label fw-semibold required">User</label>
        <b-form-input :model-value="userDisplay" disabled />
        <div v-if="userIdError" class="invalid-feedback d-block">
          {{ userIdError }}
        </div>
      </b-col>

      <b-col cols="12" :md="8">
        <label class="form-label fw-semibold">Doa</label>
        <b-form-input
          :model-value="formState.doa"
          @update:model-value="emit('update:field', 'doa', $event)"
          placeholder="Permohonan doa dari pendonor..."
        />
      </b-col>
    </b-row>
  </UIComponentCard>
</template>

<script setup lang="ts">
import UIComponentCard from "@/components/UIComponentCard.vue";
import FlatPicker from "@/components/FlatPicker.vue";
import type { FormState } from "./types";

defineProps<{
  formState: FormState;
  v$: any;
  userDisplay: string;
  userIdError?: string;
}>();

const emit = defineEmits<{
  (e: "update:field", field: keyof FormState, value: any): void;
}>();
</script>

