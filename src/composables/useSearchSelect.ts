import { ref, computed, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

export interface SearchSelectConfig<T> {
  /** Query key untuk caching */
  queryKey: string;
  /** Async function fetch data: (params: { limit, search? }) => Promise<T[]> */
  fetchFn: (params: Record<string, any>) => Promise<T[]>;
  /** Default limit per page (default: 10) */
  limit?: number;
  /** Function untuk map item ke option {value, text} */
  optionsMapper: (item: T) => { value: string | number; text: string };
  /** Placeholder text di dropdown (default: "Cari...") */
  placeholder?: string;
}

export interface SearchSelectReturn {
  searchQuery: any;
  options: any;
  isLoading: any;
  refetch: any;
}

export function useSearchSelect<T>(config: SearchSelectConfig<T>): SearchSelectReturn {
  const {
    queryKey,
    fetchFn,
    limit = 10,
    optionsMapper,
    placeholder = "Cari...",
  } = config;

  // State
  const searchQuery = ref("");

  // Query dengan conditional enable
  const { data, isLoading, refetch } = useQuery({
    queryKey: [queryKey, searchQuery],
    queryFn: () => {
      const params: Record<string, any> = { limit };
      if (searchQuery.value && searchQuery.value.length > 2) {
        params.search = searchQuery.value;
      }
      return fetchFn(params);
    },
    enabled: computed(() => !searchQuery.value || searchQuery.value.length > 2),
  });

  // Format options dengan placeholder
  const options = computed(() => {
    const list = Array.isArray(data.value) ? data.value : [];
    return [
      { value: 0, text: placeholder },
      ...list.map((item: T) => optionsMapper(item)),
    ];
  });

  // Watch search & refetch
  watch(searchQuery, (newVal) => {
    if (newVal && newVal.length > 2) {
      refetch();
    }
  });

  return {
    searchQuery,
    options,
    isLoading,
    refetch,
  };
}
