<template>
  <b-card no-body class="d-flex flex-column" style="overflow: auto">
    <b-card-header class="border-0 py-2 flex-shrink-0">
      <b-card-title class="mb-0 fs-14">{{ title }}</b-card-title>
      <p v-if="subtitle" class="text-muted mb-0 fs-11">{{ subtitle }}</p>
    </b-card-header>

    <div v-if="$slots.filters" class="px-2 pb-2 flex-shrink-0">
      <slot name="filters" />
    </div>

    <div v-if="isLoading" class="text-center p-4 flex-grow-1">
      <b-spinner small />
      <p class="mt-2 text-muted small mb-0">Memuat...</p>
    </div>

    <simplebar
      v-else
      class="px-2 pb-2 flex-grow-1"
      data-simplebar
      style="min-height: 0; max-height: 70vh"
    >
      <a
        href="javascript:void(0);"
        class="text-body d-block"
        v-for="card in cards"
        :key="card.id"
        @click="$emit('select', card.id)"
      >
        <div
          class="d-flex align-items-start justify-content-between p-2 mb-1 rounded border cursor-pointer"
          :class="
            selectedId === card.id ? 'border-primary' : 'border-light-subtle'
          "
        >
          <div class="d-flex align-items-start">
            <div
              class="avatar-title rounded-circle flex-shrink-0 fs-12 fw-semibold"
              :class="`bg-soft-${card.colorVariant} text-${card.colorVariant}`"
              style="width: 30px; height: 30px"
            >
              {{ card.initials }}
            </div>
            <div class="ms-2">
              <h6 class="mb-0 fs-13 fw-semibold">{{ card.name }}</h6>
              <p class="mb-1 text-muted fs-11">{{ subLine(card) }}</p>
              <div v-if="card.tags?.length" class="d-flex flex-wrap gap-1">
                <b-badge
                  v-for="(tag, idx) in card.tags"
                  :key="idx"
                  :variant="null"
                  class="fw-normal fs-10"
                  :class="`badge-soft-${tag.variant}`"
                >
                  {{ tag.label }}
                </b-badge>
              </div>
            </div>
          </div>
          <div
            v-if="card.days !== undefined"
            class="text-end flex-shrink-0 ms-2"
          >
            <span
              class="d-block fs-14 fw-semibold"
              :class="card.isUrgent ? 'text-danger' : 'text-dark'"
            >
              {{ card.days }}
            </span>
            <span class="d-block text-muted fs-10">hari</span>
          </div>
        </div>
      </a>

      <p v-if="!cards.length" class="text-muted text-center py-4 mb-0 fs-12">
        {{ emptyText }}
      </p>
    </simplebar>

    <div v-if="$slots.footer" class="border-top p-2 flex-shrink-0">
      <slot name="footer" />
    </div>
  </b-card>
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import type { CrmCaseCard } from "./types";

withDefaults(
  defineProps<{
    cards: CrmCaseCard[];
    selectedId: number | null;
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
    emptyText?: string;
  }>(),
  {
    title: "Daftar Donatur",
    subtitle: undefined,
    isLoading: false,
    emptyText: "Tidak ada donatur yang cocok",
  },
);

defineEmits<{
  select: [id: number];
}>();

const subLine = (card: CrmCaseCard) =>
  [card.amount, card.phone].filter(Boolean).join(" · ");
</script>
