import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getProgramTypes, deleteProgramType } from "@/services/programService";

export function useProgramTypeTable() {
  const table = useDataTable({
    queryKey: "program-types",
    fetchFn: getProgramTypes,
    deleteFn: deleteProgramType,
    defaultSort: "id",
    defaultSortDir: "asc",
    defaultPerPage: 10,
    deleteMessages: {
      text: "Tipe program tidak bisa dikembalikan setelah dihapus!",
      successText: "Tipe program berhasil dihapus.",
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
        name: "Nama",
        width: "180px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Slug",
        width: "160px",
        formatter: (cell: string) =>
          html(`<span class="font-monospace small text-muted">${cell ?? "-"}</span>`),
      },
      {
        name: "Keterangan",
        width: "220px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Jumlah Program",
        width: "120px",
        formatter: (cell: number) =>
          html(
            `<span class="badge bg-primary rounded-pill">${cell ?? 0}</span>`,
          ),
      },
      {
        name: "Aksi",
        width: "100px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.nama,
      item.slug,
      item.keterangan,
      item.programs_count,
      item.id,
    ],
  });

  return { ...table };
}
