<script setup lang="ts">
import PipelineSidebar from "@/components/PipelineSidebar.vue";
</script>

<template>
  <div class="d-flex flex-column" style="min-height: 100vh">
    <b-row class="g-2 flex-grow-1" style="min-height: 0">
      <!-- Pipeline stage menu -->
      <b-col xxl="2" lg="3" class="d-flex flex-column" style="min-height: 0">
        <PipelineSidebar />
      </b-col>

      <!-- Konten modul -->
      <b-col xxl="10" lg="9" class="d-flex flex-column" style="min-height: 0">
        <b-card class="mb-2 flex-shrink-0" body-class="py-2">
          <h6 class="mb-0 fs-15 fw-semibold">Benefit</h6>
          <p class="text-muted mb-0 fs-11">Kelola Benefit Donatur</p>
        </b-card>
      </b-col></b-row
    >
  </div>
</template>
