<template>
  <div class="main-nav">
    <LogoBox />

    <!-- Menu Toggle Button (sm-hover) -->
    <button
      type="button"
      class="button-sm-hover"
      aria-label="Show Full Sidebar"
      @click="toggleMenuSize"
    >
      <Icon
        icon="solar:hamburger-menu-broken"
        class="button-sm-hover-icon mt-1 me-1"
        style="height: 25px; width: 25px"
      />
    </button>

    <simplebar class="scrollbar">
      <div v-if="isLoadingMenu" class="text-center p-3">
        <b-spinner small />
        <p class="mt-2 small text-muted">Memuat Menu...</p>
      </div>
      <div v-else-if="menuError" class="text-center p-3">
        <p class="mt-2 small text-muted">Menu belum siap, silakan coba lagi.</p>
      </div>
      <AppMenu v-else-if="menuItems.length > 0" :menu-items="menuItems" />
      <div v-else class="text-center p-3">
        <p class="mt-2 small text-muted">Menu tidak tersedia.</p>
      </div>
    </simplebar>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import simplebar from "simplebar-vue";
import AppMenu from "@/components/AppMenu/index.vue";
import { useDynamicMenu } from "@/composables/useDynamicMenu";
import { useLayoutStore } from "@/stores/layout";
import { onMounted } from "vue";

const useLayout = useLayoutStore();
const {
  menuItems,
  isLoading: isLoadingMenu,
  error: menuError,
} = useDynamicMenu();

const { layout, setLeftSideBarSize } = useLayout;

const toggleMenuSize = () => {
  if (layout.leftSideBarSize === "sm-hover-active")
    return setLeftSideBarSize("sm-hover");
  return setLeftSideBarSize("sm-hover-active");
};

const resize = () => {
  if (window.innerWidth < 1140) {
    setLeftSideBarSize("hidden");
  } else {
    setLeftSideBarSize(
      layout.leftSideBarSize === "hidden"
        ? "sm-hover-active"
        : layout.leftSideBarSize,
    );
  }
};

onMounted(() => {
  resize();
  window.addEventListener("resize", () => {
    resize();
  });
});

import logoSm from "@/assets/images/logo-sm.png";
import logoDark from "@/assets/images/logo-dark.png";
import logoLight from "@/assets/images/logo-light.png";
</script>
