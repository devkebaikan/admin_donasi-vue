<template>
  <b-card
    no-body
    class="h-100 d-flex flex-column overflow-hidden"
    style="margin-bottom: 0; max-height: 100vh"
  >
    <b-card-header class="main-nav">
      <LogoBox
        customClass="mx-auto text-center auth-logo"
        :smLogoHeight="20"
        :logoHeight="18"
        smLogoClass="me-1"
      />
    </b-card-header>
    <!-- <b-card-title class="mb-0 fs-14">
      <i class="bx bx-git-branch me-1 text-primary"></i>CRM
    </b-card-title> -->
    <div v-if="isLoading" class="text-center p-3 flex-grow-1">
      <b-spinner small />
    </div>

    <simplebar
      v-else
      class="p-1 flex-grow-1"
      data-simplebar
      style="min-height: 0"
    >
      <!-- Section: Antrian (dinamis dari API) -->
      <div class="px-2 pt-2 pb-1 fs-10 fw-bold text-muted text-uppercase">
        Kartu
      </div>
      <router-link
        :to="{ path: '/crm', query: {} }"
        custom
        v-slot="{ navigate }"
      >
        <a
          href="javascript:void(0);"
          class="d-flex align-items-start gap-2 rounded-2 px-2 py-1 mb-1 text-body crm-pipeline-item"
          :class="{ active: isOnCrmDashboard && !currentStageQuery }"
          @click="navigate"
        >
          <i class="bx bx-grid-alt fs-14 flex-shrink-0 mt-1"></i>
          <span class="fs-11 fw-semibold">Semua Stage</span>
        </a>
      </router-link>

      <!-- Kartu Plan -->
      <router-link
        :to="'/crm'"
        class="d-flex align-items-start gap-2 rounded-2 px-2 py-1 mb-1 text-body crm-pipeline-item"
        :class="{ active: isRouteActive('/crm/plan') }"
      >
        <i :class="`bx bx-book fs-14 flex-shrink-0 mt-1 text-info`"></i>
        <span class="lh-sm">
          <span class="d-block fs-11 fw-semibold">Plan - Belum Transfer</span>
          <span class="d-block fs-10 text-muted"
            >khusus untuk case tertentu</span
          >
        </span>
      </router-link>

      <router-link
        v-for="stage in pipelineStages"
        :key="stage.id"
        :to="{ path: '/crm', query: { stage: stage.code } }"
        custom
        v-slot="{ navigate }"
      >
        <a
          href="javascript:void(0);"
          class="d-flex align-items-start gap-2 rounded-2 px-2 py-1 mb-1 text-body crm-pipeline-item"
          :class="{
            active: isOnCrmDashboard && activeStageCode === stage.code,
          }"
          @click="navigate"
        >
          <i
            :class="`bx ${stageIcon(stage.code)} fs-14 flex-shrink-0 mt-1 text-info`"
          ></i>
          <span class="lh-sm">
            <span class="d-block fs-11 fw-semibold">{{ stage.label }}</span>
            <span class="d-block fs-10 text-muted">{{
              stage.description
            }}</span>
          </span>
          <span class="ms-auto">
            <span
              class="badge fs-10 rounded-pill bg-soft-primary text-primary fw-semibold"
            >
              {{ stage.id }}
            </span>
          </span>
        </a>
      </router-link>

      <!-- Kartu 0 - khusus -->
      <router-link
        :to="'/crm'"
        class="d-flex align-items-start gap-2 rounded-2 px-2 py-1 mb-1 text-body crm-pipeline-item"
        :class="{ active: isRouteActive('/crm/kartu0') }"
      >
        <i :class="`bx bx-book fs-14 flex-shrink-0 mt-1 text-info`"></i>
        <span class="lh-sm">
          <span class="d-block fs-11 fw-semibold">Kartu 0 - Khusus</span>
          <span class="d-block fs-10 text-muted"
            >khusus untuk case tertentu</span
          >
        </span>
      </router-link>

      <!-- Section: Modul (halaman terpisah) -->
      <div class="px-2 pt-2 pb-1 fs-10 fw-bold text-muted text-uppercase">
        Modul
      </div>
      <router-link
        v-for="mod in modules"
        :key="mod.to"
        :to="mod.to"
        class="d-flex align-items-start gap-2 rounded-2 px-2 py-1 mb-1 text-body crm-pipeline-item"
        active-class="active"
      >
        <i :class="`bx ${mod.icon} fs-14 flex-shrink-0 mt-1 text-warning`"></i>
        <span class="lh-sm">
          <span class="d-block fs-11 fw-semibold">{{ mod.label }}</span>
          <span class="d-block fs-10 text-muted">{{ mod.description }}</span>
        </span>
      </router-link>
    </simplebar>
    <b-card-footer class="py-2 flex-shrink-0">
      <b-card-title class="mb-0 fs-12">
        <div>
          <h6>Nama CS</h6>
          <div class="fs-10 text-muted">CS 1 | online</div>
        </div>
      </b-card-title>
    </b-card-footer>
  </b-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import simplebar from "simplebar-vue";
import { getPipeline } from "@/services/crmService";
import type { PipelineStage } from "@/types/crm";

const props = defineProps<{
  activeCode?: string;
}>();

// Menu modul manual — masing-masing memiliki halaman sendiri
const modules = [
  {
    to: "/crm/wa-template",
    label: "WA Template",
    description: "Kelola template pesan WhatsApp",
    icon: "bxl-whatsapp",
  },
  // {
  //   to: "/crm/benefit",
  //   label: "Marketing - Benefit",
  //   description: "Kelola benefit donatur",
  //   icon: "bx-book",
  // },
];

const { data, isLoading } = useQuery({
  queryKey: ["crm-pipeline-stages"],
  queryFn: () => getPipeline(),
});

// Hanya stage dinamis dari API
const pipelineStages = computed<PipelineStage[]>(
  () => (data.value ?? []) as PipelineStage[],
);

const route = useRoute();

// Hanya aktifkan highlight stage saat berada di halaman dashboard CRM (bukan modul lain)
const isOnCrmDashboard = computed(() => route.path === "/crm");

const currentStageQuery = computed(
  () => (route.query.stage as string | undefined) ?? undefined,
);

const activeStageCode = computed(
  () => props.activeCode ?? currentStageQuery.value,
);

const isRouteActive = (path: string) => route.path === path;

const STAGE_ICON: Record<string, string> = {
  kartu1: "bx-time-five",
  kartu2: "bx-wallet",
  kartu3: "bx-check-circle",
  kartu4: "bx-package",
  kartu5: "bx-calendar-week",
  kartu6: "bx-refresh",
  kartu7: "bx-gift",
  kartu8: "bx-star",
  kartu9: "bx-trophy",
  kartu10: "bx-power-off",
  kartu11: "bx-pulse",
};

const stageIcon = (code: string) =>
  STAGE_ICON[code] ?? "bx-radio-circle-marked";
</script>

<style scoped>
.crm-pipeline-item:hover {
  background-color: var(--bs-light);
}

.crm-pipeline-item.active {
  background-color: var(
    --bs-primary-bg-subtle,
    rgba(var(--bs-primary-rgb), 0.1)
  );
  color: var(--bs-primary);
}
</style>
