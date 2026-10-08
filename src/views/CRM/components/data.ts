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
export const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = (): string => {
  return formatDateToYMD(new Date());
};

export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateToYMD(d);
};

export const getDayBeforeYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return formatDateToYMD(d);
};

export function useDonorsBoard() {
  const route = useRoute();
  const router = useRouter();

  const selectedLevel = ref("");
  const selectedCycleStatus = ref("");
  const assignedCs = ref<number | null>(null);
  const dateFilter = ref<string>("");
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
    selectedId.value = 0;
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
    ...(dateFilter.value ? { date: dateFilter.value } : {}),
  }));

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
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
  watch(
    data,
    (page) => {
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
    },
    { immediate: true },
  );

  const cases = computed<CrmCaseCard[]>(() =>
    loadedCases.value.map(toCaseCard),
  );

  // Otomatis pilih donatur pertama jika donatur saat ini sudah tidak ada di list
  // (misalnya setelah donatur dimasukkan ke project dan berpindah stage).
  watch(
    loadedCases,
    (newList) => {
      if (!newList.length) {
        selectedId.value = 0;
        return;
      }
      const isStillExist = newList.some((item) => item.id === selectedId.value);
      if (!isStillExist || !selectedId.value) {
        selectedId.value = newList[0].id;
      }
    },
    { immediate: true },
  );

  const resetPage = () => {
    currentPage.value = 1;
    selectedId.value = 0;
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

  const setDate = (
    preset: "today" | "yesterday" | "dayBeforeYesterday" | string,
  ) => {
    if (preset === "today") {
      dateFilter.value = getTodayDateString();
    } else if (preset === "yesterday") {
      dateFilter.value = getYesterdayDateString();
    } else if (preset === "dayBeforeYesterday") {
      dateFilter.value = getDayBeforeYesterdayDateString();
    } else {
      dateFilter.value = preset;
    }
  };

  const selectCase = (id: number) => {
    selectedId.value = id;
  };

  return {
    selectedLevel,
    selectedCycleStatus,
    assignedCs,
    dateFilter,
    setDate,
    todayDateStr: getTodayDateString(),
    yesterdayDateStr: getYesterdayDateString(),
    dayBeforeYesterdayDateStr: getDayBeforeYesterdayDateString(),
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
    refetch,
    selectedId,
    selectCase,
    selectedCase,
    selectedPipelineCase,
  };
}
