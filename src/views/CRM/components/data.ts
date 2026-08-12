import { computed, ref, watch } from "vue";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { useRoute, useRouter } from "vue-router";
import { getDonorCases } from "@/services/crmService";
import { toCaseCard } from "@/utils/crmAdapters";
import type { CrmCaseCard, CrmPipelineCase } from "@/types/crm";

/**
 * Board donatur CRM berbasis data asli: daftar kasus pipeline (donasi + stage
 * + profil donatur) dengan filter stage/level/cycle_status/search/assigned_cs
 * dan "load more" (akumulasi per halaman, bukan ganti halaman).
 *
 * Fetch detail donatur (poin, follow up, chat, dst) SENGAJA tidak di sini —
 * lihat DonorDetail.vue, yang fetch sendiri by id supaya mudah diubah/nambah
 * endpoint lain khusus detail tanpa menyentuh composable list ini.
 *
 * Dipakai oleh donors.vue — reusable untuk page CRM lain yang perlu
 * menampilkan daftar donatur per stage (mis. halaman Dorman).
 */
export function useDonorsBoard() {
  const route = useRoute();
  const router = useRouter();

  const selectedLevel = ref("");
  const selectedCycleStatus = ref("");
  const assignedCs = ref<number | null>(null);
  const dateFilter = ref<"all" | "today" | "yesterday" | "dayBeforeYesterday">(
    "all",
  );
  const searchQuery = ref("");
  const currentPage = ref(1);
  const perPageItem = ref(5);
  const selectedId = ref(0);

  // Akumulasi hasil tiap halaman yang sudah dimuat (bukan hanya halaman aktif).
  const loadedCases = ref<CrmPipelineCase[]>([]);

  const selectedStage = computed(() => (route.query.stage as string) || "");

  const setStage = (code: string) => {
    const query = { ...route.query };
    if (code) query.stage = code;
    else delete query.stage;
    delete query.page;
    router.push({ query });
    currentPage.value = 1;
  };

  const queryParams = computed(() => ({
    mode: "pagination",
    page: currentPage.value,
    limit: perPageItem.value,
    ...(selectedStage.value ? { stage: selectedStage.value } : {}),
    ...(selectedLevel.value ? { level: selectedLevel.value } : {}),
    ...(selectedCycleStatus.value
      ? { cycle_status: selectedCycleStatus.value }
      : {}),
    ...(searchQuery.value ? { search: searchQuery.value } : {}),
    ...(assignedCs.value ? { assigned_cs: assignedCs.value } : {}),
  }));

  const normalizeDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const today = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const dateDiffDays = (dateA: Date, dateB: Date) => {
    const diff = dateA.getTime() - dateB.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const filteredCasesRaw = computed(() => {
    if (dateFilter.value === "all") return loadedCases.value;

    const baseDate = today();
    return loadedCases.value.filter((item) => {
      const itemDate = normalizeDate(item.created_at);
      if (!itemDate) return false;
      const diff = dateDiffDays(baseDate, itemDate);
      if (dateFilter.value === "today") return diff === 0;
      if (dateFilter.value === "yesterday") return diff === 1;
      if (dateFilter.value === "dayBeforeYesterday") return diff === 2;
      return false;
    });
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: computed(() => ["crm-donors", queryParams.value]),
    queryFn: () => getDonorCases(queryParams.value),
    // Tetap tampilkan halaman yang sudah termuat selagi halaman berikutnya
    // diambil, supaya list tidak kosong/berkedip saat "Lihat Lainnya".
    placeholderData: keepPreviousData,
  });

  const totalRows = computed(() => data.value?.meta?.total ?? 0);
  const totalPages = computed(() => data.value?.meta?.last_page ?? 1);
  const hasMore = computed(() => currentPage.value < totalPages.value);

  // Halaman 1 mengganti akumulasi (filter/search baru), halaman > 1 menambah
  // di bawahnya — inilah yang membuat list "bertambah ke bawah", bukan berganti.
  watch(data, (page) => {
    const pageItems = (page?.data ?? []) as CrmPipelineCase[];
    if (currentPage.value <= 1) {
      loadedCases.value = pageItems;
      return;
    }
    const existingIds = new Set(loadedCases.value.map((item) => item.id));
    loadedCases.value = [
      ...loadedCases.value,
      ...pageItems.filter((item) => !existingIds.has(item.id)),
    ];
  });

  const cases = computed<CrmCaseCard[]>(() =>
    filteredCasesRaw.value.map(toCaseCard),
  );

  const resetPage = () => {
    currentPage.value = 1;
  };

  watch(
    [
      selectedStage,
      selectedLevel,
      selectedCycleStatus,
      searchQuery,
      assignedCs,
      dateFilter,
    ],
    resetPage,
  );

  const loadMore = () => {
    if (isFetching.value || !hasMore.value) return;
    currentPage.value += 1;
  };

  const selectedCase = computed<CrmCaseCard | null>(
    () => cases.value.find((item) => item.id === selectedId.value) ?? null,
  );

  // Case mentah (belum di-map ke CrmCaseCard) — dipakai DonorDetail untuk
  // ambil transaction_id & keterangan yang tidak ada di CrmCaseCard.
  const selectedPipelineCase = computed<CrmPipelineCase | null>(
    () =>
      loadedCases.value.find((item) => item.id === selectedId.value) ?? null,
  );

  const selectCase = (id: number) => {
    selectedId.value = id;
  };

  return {
    selectedLevel,
    selectedCycleStatus,
    assignedCs,
    dateFilter,
    searchQuery,
    currentPage,
    perPageItem,
    selectedStage,
    setStage,
    cases,
    totalRows,
    totalPages,
    hasMore,
    loadMore,
    resetPage,
    isLoading,
    isFetching,
    isError,
    error,
    selectedId,
    selectCase,
    selectedCase,
    selectedPipelineCase,
  };
}
