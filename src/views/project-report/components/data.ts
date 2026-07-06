import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllReports, deleteReport } from "@/services/reportService";

// const STORAGE_BASE =
//   (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
//   "/storage/";

// const buildImageUrl = (path: string) => (path ? `${STORAGE_BASE}${path}` : "");

export function useReportTable() {
  const selectedProjectId = ref<number | string>("");
  const selectedKegiatanId = ref<number | string>("");
  const selectedType = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, any> = {};
    if (selectedProjectId.value) filters.project_id = selectedProjectId.value;
    if (selectedKegiatanId.value)
      filters.kegiatan_id = selectedKegiatanId.value;
    if (selectedType.value) filters.type = selectedType.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "reports",
    fetchFn: getAllReports,
    deleteFn: deleteReport,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Laporan project tidak bisa dikembalikan!",
      successText: "Laporan project berhasil dihapus.",
      cancelText: "Laporan aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Project",
        width: "200px",
        formatter: (cell) =>
          html(`
            <div>
              <span class="fw-semibold d-block text-truncate">${cell}</span>
            </div>
          `),
      },
      {
        name: "Kegiatan",
        width: "180px",
        formatter: (cell: string) =>
          html(
            `<span class="small text-truncate d-block">${cell || "-"}</span>`,
          ),
      },
      {
        name: "Status",
        width: "110px",
        formatter: (cell: string) => {
          const isFinal = cell === "Final";
          return html(
            `              <span class="badge ${cell === "diterima" ? "bg-success" : "bg-warning"} small">${cell}</span>
`,
          );
        },
      },
      {
        name: "Tipe",
        width: "110px",
        formatter: (cell: string) => {
          const isFinal = cell === "Final";
          return html(
            `<span class="badge ${isFinal ? "bg-success" : "bg-info"}">${cell}</span>`,
          );
        },
      },
      {
        name: "Aksi",
        width: "130px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Detail"><i class="bx bx-show fs-16"></i></button>
              <button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button>
              <button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      item.project?.name ?? "-",
      item.kegiatan?.nama ?? "-",
      item.project.status ?? "-",
      item.type,
      item.id,
    ],
  });

  return {
    ...table,
    selectedProjectId,
    selectedKegiatanId,
    selectedType,
  };
}
