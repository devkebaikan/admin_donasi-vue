<template>
  <b-card no-body class="h-100">
    <b-card-header class="border-0">
      <b-card-title class="mb-1">Plan — Belum Transfer</b-card-title>
      <p class="text-muted mb-0 fs-13">Isi form tapi tidak jadi transfer &gt;5 hari</p>
    </b-card-header>

    <div class="px-3 pb-3">
      <div class="search-bar">
        <span><i class="bx bx-search-alt"></i></span>
        <b-form-input type="search" v-model="search" placeholder="Cari nama / no. HP..." />
      </div>
    </div>

    <simplebar class="px-3 pb-3 plan-list-height" data-simplebar style="max-height: calc(100vh - 320px)">
      <a
        href="javascript:void(0);"
        class="text-body d-block"
        v-for="card in filteredCards"
        :key="card.id"
        @click="$emit('select', card.id)"
      >
        <div
          class="d-flex align-items-start justify-content-between p-2 mb-2 rounded border cursor-pointer"
          :class="selectedId === card.id ? 'border-primary' : 'border-light-subtle'"
        >
          <div class="d-flex align-items-start">
            <div
              class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold"
              :class="`bg-soft-${card.colorVariant} text-${card.colorVariant}`"
              style="width: 36px; height: 36px"
            >
              {{ card.initials }}
            </div>
            <div class="ms-2">
              <h6 class="mb-1 fs-14 fw-semibold">{{ card.name }}</h6>
              <p class="mb-2 text-muted fs-12">{{ card.amount }} · {{ card.phone }}</p>
              <div class="d-flex flex-wrap gap-1">
                <b-badge v-for="(tag, idx) in card.tags" :key="idx" :variant="null" class="fw-normal fs-11" :class="`badge-soft-${tag.variant}`">
                  {{ tag.label }}
                </b-badge>
              </div>
            </div>
          </div>
          <div class="text-end flex-shrink-0 ms-2">
            <span class="d-block fs-16 fw-semibold" :class="card.isUrgent ? 'text-danger' : 'text-dark'">{{ card.days }}</span>
            <span class="d-block text-muted fs-11">hari</span>
          </div>
        </div>
      </a>

      <p v-if="!filteredCards.length" class="text-muted text-center py-4 mb-0">Tidak ada donatur yang cocok</p>
    </simplebar>
  </b-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import simplebar from 'simplebar-vue'
import type { PlanCardType } from '@/views/plan/components/types'

const props = defineProps<{
  cards: PlanCardType[]
  selectedId: number | null
}>()

defineEmits<{
  select: [id: number]
}>()

const search = ref('')

const filteredCards = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return props.cards
  return props.cards.filter((card) => card.name.toLowerCase().includes(keyword) || card.phone.includes(keyword))
})
</script>
