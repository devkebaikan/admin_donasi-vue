import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllRoles, deleteRole } from "@/services/roleService";

export function useRoleTable() {
  const selectedGuardName = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, string> = {};
    if (selectedGuardName.value) filters.guard_name = selectedGuardName.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "roles",
    fetchFn: getAllRoles,
    deleteFn: deleteRole,
    defaultSort: "name",
    defaultSortDir: "asc",
    extraFilters,
    deleteMessages: {
      text: "Data role tidak bisa dikembalikan setelah dihapus!",
      successText: "Role berhasil dihapus.",
      cancelText: "Data role aman :)",
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
        width: "240px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Guard",
        width: "100px",
        formatter: (cell: string) => {
          const isApi = cell === "api";
          return html(
            `<span class="badge ${isApi ? "bg-info" : "bg-secondary"}">${cell}</span>`,
          );
        },
      },
      {
        name: "Users",
        width: "80px",
        formatter: (cell: number) =>
          html(
            `<span class="badge bg-light text-dark">${cell ?? 0} user</span>`,
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
                class="btn btn-sm btn-soft-info users-btn"
                data-action="users"
                data-id="${item.id}"
                title="Lihat Users">
                <i class="bx bx-group fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${item.id}"
                title="Edit Role">
                <i class="bx bx-edit fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    //  <button
    //     class="btn btn-sm btn-soft-danger delete-btn"
    //     data-action="delete"
    //     data-id="${item.id}"
    //     title="Hapus Role">
    //     <i class="bx bx-trash fs-16"></i>
    //     </button>

    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.guard_name,
      item.users_count,
      { id: item.id },
    ],
  });

  return { ...table, selectedGuardName };
}
