import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllPermissions,
  deletePermission,
} from "@/services/permissionService";

export function usePermissionTable() {
  const selectedGuardName = ref<string>("");
  const selectedType = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, string> = {};
    if (selectedGuardName.value) filters.guard_name = selectedGuardName.value;
    if (selectedType.value) filters.type = selectedType.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "permissions",
    fetchFn: getAllPermissions,
    deleteFn: deletePermission,
    defaultSort: "name",
    defaultSortDir: "asc",
    extraFilters,
    deleteMessages: {
      text: "Data permission tidak bisa dikembalikan setelah dihapus!",
      successText: "Permission berhasil dihapus.",
      cancelText: "Data permission aman :)",
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
        width: "260px",
        formatter: (cell: string) =>
          html(`<span class="font-monospace small fw-semibold">${cell}</span>`),
      },
      {
        name: "Guard",
        width: "90px",
        formatter: (cell: string) => {
          const isApi = cell === "api";
          return html(
            `<span class="badge ${isApi ? "bg-info" : "bg-secondary"}">${cell}</span>`,
          );
        },
      },
      {
        name: "Type",
        width: "120px",
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-light text-dark border">${cell || "-"}</span>`,
          ),
      },
      {
        name: "Main",
        width: "90px",
        sort: false,
        formatter: (cell: number) =>
          cell
            ? html(`<span class="badge bg-primary">Utama</span>`)
            : html(`<span class="badge bg-light text-muted">Tambahan</span>`),
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
                title="Edit Permission">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${item.id}"
                title="Hapus Permission">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.guard_name,
      item.type,
      item.main,
      { id: item.id },
    ],
  });

  return { ...table, selectedGuardName, selectedType };
}
