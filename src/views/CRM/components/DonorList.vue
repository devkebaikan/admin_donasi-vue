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
        @click.prevent="$emit('select', card.id)"
        tabindex="0"
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
              :style="`
              width: 30px;
              height: 30px;
              background-color: ${!card.color_tag ? '#6c757d' : card.color_tag === 'amber' ? '#f59e0b' : card.color_tag};
              opacity: 0.5;
            `"
            >
              {{ getInitials(card) }}
            </div>
            <div class="ms-2">
              <h6 class="mb-0 fs-13 fw-semibold">{{ getName(card) }}</h6>
              <p class="mb-1 text-muted fs-11">{{ subLine(card) }}</p>
              <div v-if="getTags(card).length" class="d-flex flex-wrap gap-1">
                <b-badge
                  v-for="(tag, idx) in getTags(card)"
                  :key="idx"
                  :variant="null"
                  class="fw-normal fs-10"
                  :class="getTagClass(tag)"
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
import { formatCurrency } from "@/helpers/format";
import {
  cycleStatusVariant,
  initialsOf,
  stageColorVariant,
} from "@/utils/crmAdapters";

withDefaults(
  defineProps<{
    cards: any[];
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

const sanitizeVariant = (v: any) => {
  if (!v) return "primary";
  const s = String(v).trim().toLowerCase();
  const clean = s.replace(/[^a-z0-9-]/g, "");
  return clean || "primary";
};

const getAvatarClass = (card: any) => {
  const v = sanitizeVariant(
    card?.colorVariant ??
      card?.color_tag ??
      card?.donor?.color_tag ??
      card?.variant,
  );
  return `bg-soft-${v} text-${v}`;
};

const getInitials = (card: any) =>
  card.initials ?? initialsOf(card?.donor?.name ?? card?.name ?? "");

const getName = (card: any) => card.name ?? card?.donor?.name ?? "-";

const getPhone = (card: any) => card.phone ?? card?.donor?.phone ?? "";

const getAmount = (card: any) => {
  if (card.amount) return card.amount;
  if (card?.transaction?.total != null)
    return formatCurrency(card.transaction.total);
  return "";
};

const getTags = (card: any) => {
  if (Array.isArray(card.tags) && card.tags.length) return card.tags;

  const tags: any[] = [];
  if (card?.donor?.level) {
    tags.push({ label: card.donor.level, variant: "secondary" });
  }
  if (card?.donor?.cycle_status) {
    tags.push({
      label: card.donor.cycle_status,
      variant: cycleStatusVariant(card.donor.cycle_status),
    });
  }
  if (card?.pipeline_stage?.label) {
    tags.push({
      label: card.pipeline_stage.label,
      variant: stageColorVariant(card.pipeline_stage.color),
    });
  }
  return tags;
};

const getTagClass = (tag: any) => {
  const v = sanitizeVariant(tag?.variant ?? tag);
  return `badge-soft-${v}`;
};

const subLine = (card: any) =>
  [getAmount(card), getPhone(card)].filter(Boolean).join(" · ");
</script>
