<template>
  <div class="crm-donors-shell d-flex flex-column">
    <b-row class="g-2 flex-grow-1" style="min-height: 0">
      <!-- Pipeline stage menu -->
      <b-col xxl="2" lg="3" class="d-flex flex-column" style="min-height: 0">
        <PipelineSidebar />
      </b-col>

      <!-- Konten modul -->
      <b-col xxl="10" lg="9" class="d-flex flex-column" style="min-height: 0">
        <b-card class="mb-2 flex-shrink-0" body-class="py-2">
          <h6 class="mb-0 fs-15 fw-semibold">WA Template</h6>
          <p class="text-muted mb-0 fs-11">Kelola template pesan WhatsApp</p>
        </b-card>

        <b-card class="flex-grow-1" style="min-height: 0">
          <!-- konten daftar template di sini -->
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import PipelineSidebar from "@/views/CRM/components/PipelineSidebar.vue";
</script>

<style scoped>
.crm-donors-shell {
  min-height: 100vh;
}
</style>
