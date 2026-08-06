<template>
  <div class="crm-donors-shell d-flex flex-column">
    <b-row class="g-2 flex-grow-1" style="min-height: 0">
      <!-- Pipeline stage menu -->
      <b-col xxl="2" lg="3" class="d-flex flex-column" style="min-height: 0">
        <PipelineSidebar :active-code="selectedStage" @select="setStage" />
      </b-col>

      <b-col xxl="10" lg="9" class="d-flex flex-column" style="min-height: 0">
        <b-card class="mb-2 flex-shrink-0" body-class="py-2">
          <b-row class="align-items-center">
            <b-col>
              <h6 class="mb-0 fs-15 fw-semibold">{{ boardTitle }}</h6>
              <p class="text-muted mb-0 fs-11">{{ boardDescription }}</p>
            </b-col>
          </b-row>
        </b-card>

        <b-card class="mb-2 flex-shrink-0" body-class="py-2">
          <b-row class="g-2 align-items-center">
            <b-col cols="12" md="6" lg="3">
              <b-input-group size="sm">
                <span class="input-group-text"
                  ><i class="bx bx-search"></i
                ></span>
                <b-form-input
                  v-model="searchQuery"
                  debounce="500"
                  placeholder="Cari nama / no. HP..."
                  @update:model-value="resetPage"
                />
              </b-input-group>
            </b-col>
          </b-row>
        </b-card>

        <div v-if="isError" class="alert alert-danger flex-shrink-0">
          {{ error?.message ?? "Gagal memuat data donatur." }}
        </div>

        <b-row v-else class="g-2 flex-grow-1" style="min-height: 0">
          <b-col
            lg="4"
            xxl="3"
            class="d-flex flex-column"
            style="min-height: 0"
          >
            <DonorList
              :cards="cases"
              :selected-id="selectedId"
              title="Daftar Donatur"
              :subtitle="`${totalRows} donatur ditemukan`"
              :is-loading="isLoading"
              @select="selectCase"
            >
              <template #footer>
                <div v-if="hasMore" class="d-flex justify-content-center">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    class="rounded-pill px-4"
                    :disabled="isFetching"
                    @click="loadMore"
                  >
                    <b-spinner v-if="isFetching" small class="me-1" />
                    <i v-else class="bx bx-chevron-down me-1"></i>
                    Lihat Lainnya
                  </b-button>
                </div>
                <div
                  v-else-if="cases.length"
                  class="text-center text-muted fs-11"
                >
                  Semua donatur sudah ditampilkan
                </div>
              </template>
            </DonorList>
          </b-col>

          <b-col
            lg="8"
            xxl="9"
            class="d-flex flex-column"
            style="min-height: 0"
          >
            <DonorDetail :donor-id="selectedId" :case="selectedPipelineCase" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getPipeline } from "@/services/crmService";

import DonorList from "./components/DonorList.vue";
import DonorDetail from "./components/DonorDetail.vue";

import { useDonorsBoard } from "./components/data";
import type { PipelineStage } from "@/types/crm";

const {
  selectedLevel,
  selectedCycleStatus,
  assignedCs,
  searchQuery,
  selectedStage,
  setStage,
  cases,
  totalRows,
  hasMore,
  loadMore,
  resetPage,
  isLoading,
  isFetching,
  isError,
  error,
  selectedId,
  selectCase,
  selectedPipelineCase,
} = useDonorsBoard();

const { data: pipelineData } = useQuery({
  queryKey: ["crm-pipeline-stages"],
  queryFn: () => getPipeline(),
});
const activeStage = computed(() =>
  ((pipelineData.value ?? []) as PipelineStage[]).find(
    (s) => s.code === selectedStage.value,
  ),
);
const boardTitle = computed(() => activeStage.value?.label ?? "Semua Donatur");
const boardDescription = computed(
  () =>
    activeStage.value?.description ?? "Seluruh donatur di semua tahap pipeline",
);
</script>

<style scoped>
.crm-donors-shell {
  min-height: 100vh;
}
</style>
