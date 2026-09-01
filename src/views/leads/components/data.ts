import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllLeads, deleteLead } from "@/services/leadService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("setting:leads");
const isCanDelete = hasPermission("setting:leads");

export function useLeadTable() {
  const selectedType = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedType.value !== "" ? { type: selectedType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "leads",
    fetchFn: getAllLeads,
    deleteFn: deleteLead,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "Data lead tidak bisa dikembalikan!",
      successText: "Lead berhasil dihapus.",
      cancelText: "Data lead aman :)",
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
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Kode",
        width: "160px",
        formatter: (cell: string) =>
          html(
            `<span class="text-muted small font-monospace">${cell ?? "-"}</span>`,
          ),
      },
      {
        name: "Tipe",
        width: "180px",
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-info-subtle text-secondary">${cell ?? "-"}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (lead: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              ${
                isCanEdit
                  ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${lead.id}"
                title="Edit Lead">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                  : ""
              }
              ${
                isCanDelete
                  ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${lead.id}"
                title="Hapus Lead">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                  : ""
              }
            </div>
          `),
      },
    ],

    rowMapper: (lead: any, index: number) => [
      index,
      lead.name,
      lead.code,
      lead.type,
      { id: lead.id },
    ],
  });

  return {
    ...table,
    selectedType,
  };
}
