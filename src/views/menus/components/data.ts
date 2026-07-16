import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAll, deleteMenu } from "@/services/rbacMenuService";

export function useMenuTable() {
  const table = useDataTable({
    queryKey: "rbac-menus",
    fetchFn: (params = {}) => getAll({ ...params, format: "list" }),
    deleteFn: deleteMenu,
    defaultPerPage: 50,
    deleteMessages: {
      text: "Tidak bisa dikembalikan!",
      successText: "Menu berhasil dihapus.",
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
        name: "Nama Menu",
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Route",
        width: "180px",
        formatter: (cell?: string) =>
          html(`<span class="text-muted small">${cell || "-"}</span>`),
      },
      {
        name: "Icon",
        width: "150px",
        formatter: (cell?: string) =>
          html(`<span class="text-muted small">${cell || "-"}</span>`),
      },
      {
        name: "Parent",
        width: "100px",
        formatter: (cell?: number) =>
          html(`<span class="text-muted small">${cell || "-"}</span>`),
      },
      {
        name: "Guard",
        width: "80px",
        formatter: (cell: string) => {
          const badgeClass =
            cell === "web" ? "badge-soft-success" : "badge-soft-info";
          return html(`<span class="badge ${badgeClass}">${cell}</span>`);
        },
      },
      {
        name: "Status",
        width: "80px",
        formatter: (cell: boolean) => {
          const badgeClass = cell
            ? "badge-soft-success"
            : "badge-soft-secondary";
          const text = cell ? "Aktif" : "Nonaktif";
          return html(`<span class="badge ${badgeClass}">${text}</span>`);
        },
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
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.route || null,
      item.icon || null,
      item.parent_id || null,
      item.guard_name,
      item.is_active,
      item.id,
    ],
  });

  return { ...table };
}
