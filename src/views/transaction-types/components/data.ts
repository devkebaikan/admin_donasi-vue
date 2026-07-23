import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllTransactionType,
  deleteTransactionType,
} from "@/services/transactionTypeService";

export function useTransactionTypeTable() {
  const table = useDataTable({
    queryKey: "transaction-types",
    fetchFn: getAllTransactionType,
    deleteFn: deleteTransactionType,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    deleteMessages: {
      text: "Data tipe transaksi tidak bisa dikembalikan!",
      successText: "Tipe transaksi berhasil dihapus.",
      cancelText: "Data tipe transaksi aman :)",
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
        width: "220px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Slug",
        width: "180px",
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-light text-dark font-monospace">${cell}</span>`,
          ),
      },
      {
        name: "Jumlah Transaksi",
        width: "140px",
        sort: false,
        formatter: (cell: number) =>
          html(
            `<span class="fw-semibold">${(cell ?? 0).toLocaleString("id-ID")}</span>`,
          ),
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button>
              <button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>
            </div>`),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.slug,
      item.transactions_count ?? 0,
      item.id,
    ],
  });

  return { ...table };
}
