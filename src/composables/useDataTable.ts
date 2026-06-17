import { computed, ref, unref, watch, type ComputedRef, type Ref } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ColumnDef {
  name: string;
  width?: string;
  sort?: boolean;
  formatter?: (cell: any, row?: any) => any;
  [key: string]: any;
}

export interface PaginatedMeta {
  total: number;
  last_page: number;
  current_page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: PaginatedMeta;
}

export interface DeleteMessages {
  title?: string;
  text?: string;
  successTitle?: string;
  successText?: string;
  cancelTitle?: string;
  cancelText?: string;
}

export interface UseDataTableOptions<T = any> {
  /** Base cache key (e.g. "programs", "donations") */
  queryKey: string;

  /** Async function that fetches paginated data */
  fetchFn: (params: Record<string, any>) => Promise<PaginatedResponse<T>>;

  /** GridJS column definitions */
  columns: ColumnDef[];

  /** Map a single record to a flat row array matching the columns order */
  // rowMapper: (item: T) => any[];
  rowMapper: (item: T, index: number) => any[];

  /** Optional: async function to delete a record by id */
  deleteFn?: (id: number) => Promise<any>;

  /** Default sort column key */
  defaultSort?: string;

  /** Default sort direction */
  defaultSortDir?: "asc" | "desc";

  /** Default rows per page */
  defaultPerPage?: number;

  /**
   * Reactive extra filters beyond search/sort/page.
   * Pass a computed ref so that changes trigger re-fetch automatically.
   *
   * @example
   * const selectedCategory = ref("")
   * const extraFilters = computed(() => ({ category: selectedCategory.value }))
   * useDataTable({ ..., extraFilters })
   */
  extraFilters?: ComputedRef<Record<string, any>> | Ref<Record<string, any>>;

  /** Customise SweetAlert2 delete confirmation messages */
  deleteMessages?: DeleteMessages;

  /**
   * Additional query keys to invalidate on successful delete,
   * beyond the primary queryKey.
   */
  extraInvalidateKeys?: string[];
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useDataTable<T = any>(options: UseDataTableOptions<T>) {
  const {
    queryKey,
    fetchFn,
    columns,
    rowMapper,
    deleteFn,
    defaultSort = "id",
    // defaultSortDir = "asc",
    defaultPerPage = 10,
    extraFilters,
    deleteMessages = {},
    extraInvalidateKeys = [],
  } = options;

  // ── State ────────────────────────────────────────────────────────────────

  const searchQuery = ref("");
  const currentPage = ref(1);
  const perPageItem = ref(defaultPerPage);
  const sortOrder = ref(defaultSort);
  // const sortDir = ref<"asc" | "desc">(defaultSortDir);
  const tableKey = ref(0); // incremented after mutations to force GridJS re-render

  const queryClient = useQueryClient();

  // ── Query key (must include all reactive filter state) ──────────────────

  const reactiveQueryKey = computed(() => {
    const extra = extraFilters ? unref(extraFilters) : {};
    return [
      queryKey,
      searchQuery.value,
      currentPage.value,
      perPageItem.value,
      sortOrder.value,
      // sortDir.value,
      ...Object.values(extra),
    ];
  });

  // ── Data fetch ───────────────────────────────────────────────────────────

  const { data, error, isLoading, isFetching, isError } = useQuery({
    queryKey: reactiveQueryKey,
    queryFn: () => {
      const params: Record<string, any> = {
        limit: perPageItem.value,
        mode: "pagination",
        page: currentPage.value,
        // order: sortOrder.value,
        // sort: sortDir.value,
      };

      if (searchQuery.value) params.search = searchQuery.value;

      const extra = extraFilters ? unref(extraFilters) : {};
      for (const [key, value] of Object.entries(extra)) {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      }

      return fetchFn(params);
    },
  });

  // ── Derived ──────────────────────────────────────────────────────────────

  const tableData = computed<T[]>(() => data.value?.data ?? []);
  const totalRows = computed(() => data.value?.meta?.total ?? 0);
  const totalPages = computed(() => data.value?.meta?.last_page ?? 1);
  // const formattedRows = computed(() => tableData.value.map(rowMapper));
  const formattedRows = computed(() =>
    tableData.value.map((item, index) =>
      rowMapper(item, (currentPage.value - 1) * perPageItem.value + index + 1),
    ),
  );

  const tableOptions = computed(() => ({
    columns,
    data: formattedRows.value,
    pagination: false,
    sort: true,
    search: false,
    autoWidth: true,
    fixedHeader: true,
  }));

  /**
   * A single string combining all reactive state — bind to `:key` on
   * `<GridJsTable>` to force a re-render whenever data or filters change.
   */
  const tableKeyString = computed(() => {
    const extra = extraFilters ? unref(extraFilters) : {};
    return [
      ...Object.values(extra),
      searchQuery.value,
      currentPage.value,
      sortOrder.value,
      // sortDir.value,
      tableKey.value,
    ].join("-");
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const resetPage = () => {
    currentPage.value = 1;
  };

  // Reset to page 1 whenever extraFilters change so stale pages are avoided.
  if (extraFilters) {
    watch(extraFilters, () => resetPage(), { deep: true });
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  const { mutate: _remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => {
      if (!deleteFn) throw new Error("useDataTable: deleteFn not provided");
      return deleteFn(id);
    },
    onSuccess: async () => {
      const allKeys = [queryKey, ...extraInvalidateKeys];
      await Promise.all(
        allKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key], exact: false }),
        ),
      );
      tableKey.value++;
    },
    onError: (err: any) => {
      console.error(err?.message ?? "Failed to delete record");
    },
  });

  const handleDelete = (id: number) => {
    if (!deleteFn) {
      console.warn("useDataTable: cannot delete — deleteFn not provided");
      return;
    }

    Swal.fire({
      title: deleteMessages.title ?? "Are you sure?",
      text: deleteMessages.text ?? "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#ff6c2f",
      cancelButtonColor: "#ef5f5f",
    }).then((result: any) => {
      if (result.isConfirmed) {
        _remove(id);
        Swal.fire({
          title: deleteMessages.successTitle ?? "Deleted!",
          text: deleteMessages.successText ?? "Data has been deleted.",
          icon: "success",
          confirmButtonColor: "#ff6c2f",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: deleteMessages.cancelTitle ?? "Cancelled",
          text: deleteMessages.cancelText ?? "Your data is safe :)",
          icon: "error",
          confirmButtonColor: "#ff6c2f",
        });
      }
    });
  };

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    // Filter / pagination state
    searchQuery,
    currentPage,
    perPageItem,
    sortOrder,
    // sortDir,
    // Query state
    data,
    isLoading,
    isFetching,
    isError,
    error,
    // Derived
    tableData,
    totalRows,
    totalPages,
    tableOptions,
    tableKeyString,
    tableKey,
    // Actions
    resetPage,
    handleDelete,
    isDeleting,
  };
}
