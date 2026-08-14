<template>
  <div class="rounded-3 p-3 mb-3" style="background-color: #eef1fd">
    <div class="d-flex align-items-start gap-3">
      <div
        class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold text-white"
        :style="`
          width: 42px;
          height: 42px;
          background-color: ${!detail.color_tag ? '#6c757d' : detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
          opacity: 0.5;
        `"
      >
        {{ initialsOf(detail.name) }}
      </div>

      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1 fw-semibold">
              {{ detail.name }}
              <span v-if="detail.nick" class="text-muted fw-normal fs-12">
                ({{ detail.nick }})
              </span>
            </h6>

            <div class="text-muted fs-12 d-flex align-items-center gap-1">
              <i class="bx bx-phone"></i>
              {{ detail.phone }}
            </div>
          </div>

          <div class="d-flex gap-1">
            <span
              class="badge"
              :class="`badge-soft-${cycleStatusVariant(detail.cycle_status)}`"
            >
              {{ detail.cycle_status }}
            </span>
            <span
              class="badge"
              :style="`
                background-color: ${detail.color_tag && detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
                opacity: 0.5;
              `"
            >
              {{ detail.color_tag }}
            </span>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-1 mt-2">
          <b-badge :variant="null" class="fw-medium fs-10 badge-soft-secondary">
            {{ detail.level }}
          </b-badge>

          <b-badge :variant="null" class="badge-soft-danger">
            <i class="bx bx-time me-1"></i>
            {{ detail.hari_tidak_aktif }} Hari Tidak Aktif
          </b-badge>

          <b-badge :variant="null" class="badge-soft-info">
            <i class="bx bx-task me-1"></i>
            {{ detail.follow_ups.length }} Follow Up
          </b-badge>

          <b-badge :variant="null" class="badge-soft-warning">
            <i class="bx bx-task me-1"></i>
            Donasi ke - {{ detail.follow_ups.length }}
          </b-badge>

          <b-badge :variant="null" class="badge-soft-primary">
            <i class="bx bx-star me-1"></i>
            {{ detail.poin }} Poin
          </b-badge>
        </div>
      </div>
    </div>

    <div
      v-if="detail.assigned_cs"
      class="d-flex align-items-center gap-2 bg-white mt-2 rounded-2 py-1 px-3 fs-12"
    >
      <i class="bx bx-headphone fs-16 text-muted"></i>
      <span>
        CS:
        <span class="fw-semibold">{{ detail.assigned_cs.nama }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cycleStatusVariant, initialsOf } from "@/utils/crmAdapters";
import type { CrmDonorDetail } from "@/types/crm";
import { useQuery } from "@tanstack/vue-query";
import { getUserById } from "@/services/userService";

const props = defineProps<{
  detail: CrmDonorDetail;
  userId: number;
}>();

const { data: userDetail, isLoading } = useQuery({
  queryKey: ["user-detail", props.userId],
  queryFn: () => getUserById(props.userId),
});

console.log(userDetail);
</script>
