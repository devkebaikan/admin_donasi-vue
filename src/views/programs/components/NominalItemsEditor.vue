<!-- FILE: src/components/NominalItemsEditor.vue -->
<!-- Editor daftar pilihan nominal. Dipakai 2x per form: Masukan Biasa & Masukan Ads. -->
<template>
  <div class="border rounded p-3 h-100">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h6 class="mb-0 fw-semibold">{{ title }}</h6>
        <small class="text-muted">{{ description }}</small>
      </div>
      <b-button variant="primary" size="sm" @click="addItem">
        <i class="bx bx-plus me-1"></i>Tambah Item
      </b-button>
    </div>

    <!-- Empty state -->
    <div v-if="modelValue.length === 0" class="text-center text-muted py-3">
      <i class="bx bx-list-plus fs-2 d-block mb-1 opacity-50"></i>
      <small>Belum ada pilihan. Klik "Tambah Item" untuk menambahkan.</small>
    </div>

    <!-- Item list -->
    <div
      v-for="(item, idx) in modelValue"
      :key="idx"
      class="d-flex gap-2 mb-2 align-items-center"
    >
      <span class="text-muted small flex-shrink-0" style="width: 28px">
        {{ idx + 1 }}.
      </span>
      <b-form-input
        :model-value="item.nama"
        placeholder="Nama pilihan (e.g., Paket Hemat)"
        style="flex: 2"
        @update:model-value="(val: string) => updateItem(idx, { nama: val })"
      />
      <CurrencyInput
        :model-value="item.nominal"
        placeholder="Nominal"
        style="flex: 1; min-width: 140px"
        :state="null"
        @update:model-value="
          (val: number | undefined) => updateItem(idx, { nominal: val })
        "
      />
      <b-button
        variant="outline-danger"
        size="sm"
        class="flex-shrink-0"
        title="Hapus item"
        @click="removeItem(idx)"
      >
        <i class="bx bx-trash"></i>
      </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NominalItem } from "@/helpers/programNominal";

const props = defineProps<{
  modelValue: NominalItem[];
  title: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: NominalItem[]): void;
}>();

const addItem = () => {
  emit("update:modelValue", [
    ...props.modelValue,
    { nama: "", nominal: undefined },
  ]);
};

const removeItem = (index: number) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((_, i) => i !== index),
  );
};

const updateItem = (index: number, patch: Partial<NominalItem>) => {
  emit(
    "update:modelValue",
    props.modelValue.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    ),
  );
};
</script>