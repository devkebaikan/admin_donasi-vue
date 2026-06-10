import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getALlNominal, deleteNominal } from "@/services/nominalService";
import { formatCurrency } from "@/helpers/format";

export function useDefaultNominalTable() {
  const table = useDataTable({
    queryKey: "default-nominal",
    fetchFn: getALlNominal,
    deleteFn: deleteNominal,
    defaultSort: "nominal",
    defaultSortDir: "asc",
    deleteMessages: {
      text: "Data nominal tidak bisa dikembalikan!",
      successText: "Nominal berhasil dihapus.",
      cancelText: "Data nominal aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Nama Pilihan",
        width: "240px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Nominal",
        width: "180px",
        formatter: (cell: number) =>
          html(
            `<span class="font-monospace fw-semibold">${formatCurrency(cell)}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (item: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
               <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${item.id}"
                title="Edit Nominal">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${item.id}"
                title="Hapus Nominal">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      item.nama_pilihan,
      item.nominal,
      { id: item.id },
    ],
  });

  return { ...table };
}
