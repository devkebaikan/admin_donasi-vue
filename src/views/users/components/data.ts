import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getUsers, deleteUser } from "@/services/userService";
import { useQuery } from "@tanstack/vue-query";
import { getAllRoles } from "@/services/roleService";

const VERIFIED_BADGE: Record<string, string> = {
  verified: "bg-success",
  unverified: "bg-warning text-dark",
};

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
        name: "Role ID",
        width: "80px",
        formatter: (cell: number) =>
          html(`<span class="badge bg-primary">${cell ?? "-"}</span>`),
      },
      //   {
      //     name: "Verified",
      //     width: "100px",
      //     formatter: (cell: string) => {
      //       if (!cell) return html(`<span class="badge bg-secondary">-</span>`);
      //       const badge = VERIFIED_BADGE[cell] ?? "bg-info";
      //       return html(`<span class="badge ${badge}">${cell}</span>`);
      //     },
      //   },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button
                class="btn btn-sm btn-soft-info detail-btn"
                data-action="detail"
                data-id="${id}"
                title="Detail User">
                <i class="bx bx-show fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit User">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${id}"
                title="Hapus User">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.phone,
      item.email ?? "",
      item.role_id,
      //   item.verified ?? "",
      item.id,
    ],
  });

  return { ...table, selectedRoleId, selectedVerified, selectedHasDonatur };
}
