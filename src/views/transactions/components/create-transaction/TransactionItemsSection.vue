<template>
  <UIComponentCard title="Item Detail Transaksi" class="mb-3">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="border rounded p-3 mb-3"
    >
      <div class="d-flex justify-content-between align-items-center mb-3">
        <strong class="text-muted small text-uppercase">Item #{{ idx + 1 }}</strong>
        <b-button
          v-if="items.length > 1"
          variant="outline-danger"
          size="sm"
          @click="emit('remove-item', idx)"
        >
          <i class="bx bx-trash"></i>
        </b-button>
      </div>

      <!-- Donation Item -->
      <b-row class="g-3" v-if="activeType === 'donation'">
        <b-col cols="12" md="6">
          <label class="form-label fw-semibold required">Program</label>
          <ChoicesSelect
            :id="`donation-program-id-${idx}`"
            :modelValue="String(item.program_id || 0)"
            @update:modelValue="
              (val: string) => {
                item.program_id = val === '0' ? null : Number(val);
              }
            "
            :options="programList"
            :isLoading="isProgramLoading"
            :key="programList.length"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold required">Gross Nominal</label>
          <CurrencyInput
            v-model.number="item.gross_nominal"
            placeholder="0"
            :state="null"
          
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold">Diskon</label>
          <CurrencyInput
            v-model.number="item.discount"
            placeholder="0"
            :state="null"
          />
        </b-col>
      </b-row>

      <!-- Event Item -->
      <b-row class="g-3" v-else-if="activeType === 'event'">
        <b-col cols="12" md="7">
          <label class="form-label fw-semibold required">Event</label>
          <ChoicesSelect
            :id="`event-id-${idx}`"
            :modelValue="String(item.event_id || 0)"
            @update:modelValue="
              (val: string) => {
                item.event_id = val === '0' ? null : Number(val);
              }
            "
            :options="eventList"
            :isLoading="isEventLoading"
            :key="eventList.length"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold required">Qty</label>
          <CurrencyInput
            v-model.number="item.quantity"
            placeholder="1"
            :state="null"
          />
        </b-col>

        <b-col cols="12" v-if="getEventOf(item)">
          <div class="bg-light rounded p-2 d-inline-block">
            <small class="text-muted d-block">Estimasi Total</small>
            <span class="fw-semibold">{{
              formatCurrency(
                (getEventOf(item)?.price || 0) * (item.quantity || 0),
              )
            }}</span>
          </div>
        </b-col>
      </b-row>

      <!-- Zakat Item (Menggunakan Program Setup Zakat) -->
      <b-row class="g-3" v-else-if="activeType === 'zakat'">
        <b-col cols="12" md="5">
          <label class="form-label fw-semibold required">Program</label>
          <ChoicesSelect
            :id="`zakat-program-id-${idx}`"
            :modelValue="String(item.program_id || 0)"
            @update:modelValue="
              (val: string) => {
                item.program_id = val === '0' ? null : Number(val);
              }
            "
            :options="zakatProgramList"
            :isLoading="isProgramLoading || isProgramZakatLoading"
            :key="`zakat-prog-${zakatProgramList.length}-${item.program_id}`"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold required">Jenis Zakat</label>
          <ChoicesSelect
            :id="`zakat-id-${idx}`"
            :modelValue="String(item.zakat_id || 0)"
            @update:modelValue="
              (val: string) => {
                item.zakat_id = val === '0' ? null : Number(val);
              }
            "
            :options="zakatTypeList"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold required">Qty</label>
          <CurrencyInput
            v-model.number="item.quantity"
            placeholder="1"
            :state="null"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold required">Gross Nominal</label>
          <CurrencyInput
            v-model.number="item.gross_nominal"
            placeholder="0"
            :state="null"
          />
        </b-col>

        <b-col cols="12">
          <div class="bg-light rounded p-2 d-inline-block">
            <small class="text-muted d-block">Total</small>
            <span class="fw-semibold">{{
              formatCurrency(zakatItemTotal(item))
            }}</span>
          </div>
        </b-col>
      </b-row>

      <!-- Qurban Item -->
      <b-row class="g-3" v-else-if="activeType === 'qurban'">
        <b-col cols="12" md="5">
          <label class="form-label fw-semibold required">Program</label>
          <ChoicesSelect
            :id="`qurban-program-id-${idx}`"
            :modelValue="String(item.program_id || 0)"
            @update:modelValue="
              (val: string) => {
                item.program_id = val === '0' ? null : Number(val);
              }
            "
            :options="programList"
            :isLoading="isProgramLoading"
            :key="programList.length"
          />
        </b-col>

        <b-col cols="12" md="3">
          <label class="form-label fw-semibold required">Qty</label>
          <CurrencyInput
            v-model.number="item.quantity"
            placeholder="1"
            :state="null"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold required">Gross Nominal</label>
          <CurrencyInput
            v-model.number="item.gross_nominal"
            placeholder="0"
            :state="null"
          />
        </b-col>

        <b-col cols="12">
          <div class="bg-light rounded p-2 d-inline-block">
            <small class="text-muted d-block">Total</small>
            <span class="fw-semibold">{{
              formatCurrency(qurbanItemTotal(item))
            }}</span>
          </div>
        </b-col>
      </b-row>
    </div>

    <b-button variant="outline-primary" size="sm" @click="emit('add-item')">
      <i class="bx bx-plus me-1"></i>Tambah Item
    </b-button>

    <div v-if="itemError" class="text-danger small mt-2">
      {{ itemError }}
    </div>
  </UIComponentCard>
</template>

<script setup lang="ts">
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { formatCurrency } from "@/helpers/format";
import type { DedicatedType, TransactionItem, SelectOption } from "./types";

const props = defineProps<{
  activeType: DedicatedType | null;
  items: TransactionItem[];
  programList: SelectOption[];
  isProgramLoading: boolean;
  eventList: SelectOption[];
  isEventLoading: boolean;
  eventRawList: any[];
  zakatProgramList: SelectOption[];
  isProgramZakatLoading: boolean;
  zakatTypeList: SelectOption[];
  itemError?: string;
}>();

const emit = defineEmits<{
  (e: "add-item"): void;
  (e: "remove-item", idx: number): void;
}>();

const getEventOf = (item: TransactionItem) =>
  props.eventRawList.find((e: any) => e.id === item.event_id);

const zakatItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) * (item.quantity || 0);

const qurbanItemTotal = (item: TransactionItem) =>
  (item.gross_nominal || 0) * (item.quantity || 1);
</script>
