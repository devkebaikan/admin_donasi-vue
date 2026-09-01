import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllMitra, deleteMitra } from "@/services/mitraService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("mitra:update");
const isCanDelete = hasPermission("mitra:delete");

export function useMitraTable() {
  const selectedStatus = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "mitra",
    fetchFn: getAllMitra,
    deleteFn: deleteMitra,
    defaultSort: "id",
    // defaultSortDir: "desc",
    extraFilters,
    deleteMessages: {
      text: "Data mitra tidak bisa dikembalikan!",
      successText: "Mitra berhasil dihapus.",
      cancelText: "Data mitra aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Logo",
        width: "72px",
        sort: false,
        formatter: (cell: string | null) => {
          if (!cell)
            return html(
              `<div class="rounded bg-light d-flex align-items-center justify-content-center" style="width:48px;height:48px;"><i class="bx bx-image-alt text-muted fs-20"></i></div>`,
            );
          return html(
            `<img src="${cell}" alt="logo" class="rounded" style="width:48px;height:48px;object-fit:cover;" onerror="this.style.display='none'" />`,
          );
        },
      },
      {
        name: "Nama",
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Email",
        width: "190px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell ?? "-"}</span>`),
      },
      {
        name: "Kontak",
        width: "130px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell ?? "-"}</span>`),
      },
      {
        name: "PJ",
        width: "150px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell ?? "-"}</span>`),
      },
      {
        name: "Status",
        width: "90px",
        formatter: (cell: string) => {
          const color = cell === "active" ? "bg-success" : "bg-secondary";
          return html(`<span class="badge ${color}">${cell}</span>`);
        },
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (mitra: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${mitra.id}"
                title="Edit Mitra">
                <i class="bx bx-edit fs-16"></i>
              </button> `
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${mitra.id}"
                title="Hapus Mitra">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    rowMapper: (mitra: any, index: number) => [
      index,
      mitra.logo_url ?? null,
      mitra.nama,
      mitra.email ?? "-",
      mitra.kontak ?? "-",
      mitra.pj ?? "-",
      mitra.status,
      { id: mitra.id },
    ],
  });

  return {
    ...table,
    selectedStatus,
  };
}
