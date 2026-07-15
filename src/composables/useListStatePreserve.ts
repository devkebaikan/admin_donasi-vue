import { watch, onMounted, nextTick } from "vue";
import { useListStateStore } from "@/stores/listState";

interface ListStateRef {
  searchQuery: any;
  currentPage: any;
  perPageItem: any;
  extraFilters?: any;
}

export function useListStatePreserve(key: string, state: ListStateRef) {
  const listStateStore = useListStateStore();

  // Restore state saat component mount
  onMounted(async () => {
    const saved = listStateStore.getState(key);
    if (saved) {
      state.searchQuery.value = saved.searchQuery;
      state.currentPage.value = saved.currentPage;
      state.perPageItem.value = saved.perPageItem;
      if (state.extraFilters) {
        Object.assign(state.extraFilters.value, saved.extraFilters);
      }

      // Restore scroll setelah DOM render
      await nextTick();
      window.scrollTo(0, saved.scrollPos);
    }
  });

  // Auto-save state saat filter/pagination berubah
  watch(
    [state.searchQuery, state.currentPage, state.perPageItem],
    () => {
      listStateStore.saveState(key, {
        searchQuery: state.searchQuery.value,
        currentPage: state.currentPage.value,
        perPageItem: state.perPageItem.value,
        extraFilters: state.extraFilters?.value ?? {},
        scrollPos: window.scrollY,
      });
    },
    { deep: true }
  );

  // Save scroll position saat component unmount
  const saveScroll = () => {
    const current = listStateStore.getState(key);
    if (current) {
      listStateStore.saveState(key, {
        ...current,
        scrollPos: window.scrollY,
      });
    }
  };

  return { saveScroll };
}
