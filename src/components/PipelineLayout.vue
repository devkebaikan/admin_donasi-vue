<template>
  <div class="crm-layout-shell d-flex flex-column">
    <b-row class="g-2 flex-grow-1" style="min-height: 0">
      <b-col
        v-if="props.showSidebar"
        xxl="2"
        lg="3"
        class="d-flex flex-column"
        style="min-height: 0"
      >
        <slot name="sidebar">
          <PipelineSidebar :active-code="props.activeCode" />
        </slot>
      </b-col>
      <b-col
        :xxl="props.showSidebar ? 10 : 12"
        :lg="props.showSidebar ? 9 : 12"
        class="d-flex flex-column"
        style="
          min-height: 0;
          max-height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
        "
      >
        <slot />
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import PipelineSidebar from "./PipelineSidebar.vue";

const props = withDefaults(
  defineProps<{
    activeCode?: string;
    showSidebar?: boolean;
  }>(),
  {
    showSidebar: true,
  },
);
</script>

<style scoped>
.crm-layout-shell {
  min-height: 100vh;
}
</style>
