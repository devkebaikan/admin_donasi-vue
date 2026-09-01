import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getUsers, deleteUser } from "@/services/userService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("user:update");

export function useUsersTable() {
  const selectedRoleId = ref<string>("");
  const selectedVerified = ref<string>("");
  const selectedHasDonatur = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedRoleId.value ? { role_id: selectedRoleId.value } : {}),
    ...(selectedVerified.value ? { verified: selectedVerified.value } : {}),
    ...(selectedHasDonatur.value !== ""
      ? { has_donatur: selectedHasDonatur.value }
      : {}),
    ...{ exclude_role_id: 7 },
  }));

  const table = useDataTable({
    queryKey: "users",
    fetchFn: getUsers,
    deleteFn: deleteUser,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Data user tidak bisa dikembalikan setelah dihapus!",
      successText: "User berhasil dihapus.",
      cancelText: "Data user aman :)",
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
          html(`<span class="fw-semibold">${cell ?? "-"}</span>`),
      },
      {
        name: "Telepon",
        width: "140px",
        formatter: (cell: string) =>
          html(`<span class="small text-muted">${cell ?? "-"}</span>`),
      },
      {
        name: "Email",
        width: "180px",
        formatter: (cell: string) =>
          cell
            ? html(`<span class="small">${cell}</span>`)
            : html(`<span class="text-muted small">-</span>`),
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
             <button
                class="btn btn-sm btn-soft-primary detail-btn"
                data-action="detail"
                data-id="${id}"
                title="Detail User">
                <i class="bx bx-show fs-16"></i>
              </button>
              ${
                isCanEdit
                  ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit User">
                <i class="bx bx-edit fs-16"></i>
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
      item.phone,
      item.email ?? "",
      item.id,
    ],
  });

  return { ...table, selectedRoleId, selectedVerified, selectedHasDonatur };
}
