import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllKegiatan, deleteKegiatan } from "@/services/kegiatanService";
import { hasPermission } from "@/helpers/permission";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const isCanEdit = hasPermission("program:update");
const isCanDelete = hasPermission("program:delete");

export function useKegiatanTable() {
  const selectedType = ref<string>("");
  const selectedProjectId = ref<number | "">("");
  const selectedMitraId = ref<number | "">("");

  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
    ...(selectedProjectId.value !== "" ? { project_id: selectedProjectId.value } : {}),
    ...(selectedMitraId.value !== "" ? { mitra_id: selectedMitraId.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "kegiatans",
    fetchFn: getAllKegiatan,
    deleteFn: deleteKegiatan,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Data kegiatan tidak bisa dikembalikan setelah dihapus!",
      successText: "Data kegiatan berhasil dihapus.",
      cancelText: "Data aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Judul",
        width: "240px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Mitra",
        width: "140px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Tanggal",
        width: "110px",
        formatter: (cell: string) => {
          const d = cell
            ? new Date(cell).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-";
          return html(`<span class="small text-muted">${d}</span>`);
        },
      },
      {
        name: "Tipe",
        width: "90px",
        sort: false,
        formatter: (cell: string) => {
          const cls = cell === "Final" ? "bg-success" : "bg-info";
          return html(`<span class="badge ${cls}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Lihat Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
              ${
                isCanEdit
                  ? `<button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                  : ""
              }
              ${
                isCanDelete
                  ? `<button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                  : ""
              }
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.judul,
      item.mitra_name,
      item.date,
      item.type,
      item.id,
    ],
  });

  return { ...table, selectedType, selectedProjectId, selectedMitraId };
}
