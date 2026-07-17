import { watch, onMounted, nextTick } from "vue";
import { useListStateStore } from "@/stores/listState";

interface OffcanvasStateRef {
  showOffcanvas: any;
  selectedId: any;
}

/**
 * Preserve offcanvas state (open/close + selected item data)
 * Useful for detail offcanvas that should restore when user comes back
 *
 * @example
 * const showDetailOffcanvas = ref(false);
 * const selectedProgramLink = ref("");
 *
 * useOffcanvasStatePreserve("programs-detail", {
 *   showOffcanvas: showDetailOffcanvas,
 *   selectedId: selectedProgramLink,
 * });
 */
export function useOffcanvasStatePreserve(
  key: string,
  state: OffcanvasStateRef,
): { listStateStore: ReturnType<typeof useListStateStore> } {
  const listStateStore = useListStateStore();

  // Restore offcanvas state saat component mount
  onMounted(async () => {
    const saved = listStateStore.getOffcanvasState(key);
    if (saved && saved.isOpen) {
      state.selectedId.value = saved.selectedId;
      state.showOffcanvas.value = true;

      // Delay untuk ensure query sudah selesai load
      await nextTick();
    }
  });

  // Auto-save state saat offcanvas terbuka atau item berubah
  watch(
    [state.showOffcanvas, state.selectedId],
    () => {
      // Hanya save kalau offcanvas sedang open
      if (state.showOffcanvas.value) {
        listStateStore.saveOffcanvasState(key, {
          isOpen: true,
          selectedId: state.selectedId.value,
        });
      } else {
        // Clear state saat offcanvas ditutup
        listStateStore.clearOffcanvasState(key);
      }
    },
    { deep: true },
  );

  return { listStateStore };
}
