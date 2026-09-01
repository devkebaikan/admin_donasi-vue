import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllPercentage,
  deletePercentage,
} from "@/services/percentageService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("program:update");
const isCanDelete = hasPermission("program:delete");

export function usePercentageTable() {
  const table = useDataTable({
    queryKey: "program-percentage",
    fetchFn: getAllPercentage,
    deleteFn: deletePercentage,
    defaultSort: "name",
    defaultSortDir: "asc",
    deleteMessages: {
      text: "Data persentase tidak bisa dikembalikan!",
      successText: "Persentase berhasil dihapus.",
      cancelText: "Data persentase aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
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
        name: "Percentage (Program % | Operasional % | Komisi %)",
        width: "110px",
        formatter: (cell: any) =>
          html(
            `<span class="font-monospace">( ${cell.program} | ${cell.operasional} | ${cell.komisi} )</span>`,
          ),
      },

      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (item: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              ${
                isCanEdit
                  ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${item.id}"
                title="Edit Persentase">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                  : ""
              }
              ${
                isCanDelete
                  ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${item.id}"
                title="Hapus Persentase">
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
      item.name,
      {
        program: item.program,
        operasional: item.operasional,
        komisi: item.komisi,
      },
      { id: item.id },
    ],
  });

  return { ...table };
}
