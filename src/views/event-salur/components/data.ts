import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllEventSalur,
  deleteEventSalur,
} from "@/services/eventSalurService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = true;
const isCanDelete = true;

export function useEventSalurTable() {
  const searchQuery = ref<string>("");
  const selectedStatus = ref<string>("");

  const extraFilters = computed(() => ({
    ...(searchQuery.value ? { search: searchQuery.value } : {}),
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "event-salur",
    fetchFn: getAllEventSalur,
    deleteFn: deleteEventSalur,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "Data event salur tidak bisa dikembalikan!",
      successText: "Event salur berhasil dihapus.",
      cancelText: "Data event salur aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Gambar",
        width: "72px",
        sort: false,
        formatter: (cell: string | null) => {
          if (!cell)
            return html(
              `<div class="rounded bg-light d-flex align-items-center justify-content-center" style="width:48px;height:48px;"><i class="bx bx-image-alt text-muted fs-20"></i></div>`,
            );
          return html(
            `<img src="${cell}" alt="event" class="rounded" style="width:48px;height:48px;object-fit:cover;" onerror="this.style.display='none'" />`,
          );
        },
      },
      {
        name: "Judul",
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Slug",
        width: "120px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small font-monospace">${cell}</span>`),
      },
      {
        name: "Status",
        width: "100px",
        formatter: (cell: string) => {
          const color =
            cell === "PUBLISH"
              ? "bg-success"
              : cell === "DRAFT"
                ? "bg-warning"
                : "bg-secondary";
          return html(`<span class="badge ${color}">${cell}</span>`);
        },
      },
      {
        name: "Program",
        width: "80px",
        formatter: (cell: number) =>
          html(`<span class="badge bg-info">${cell}</span>`),
      },
      {
        name: "Project",
        width: "80px",
        formatter: (cell: number) =>
          html(`<span class="badge bg-secondary">${cell}</span>`),
      },
      {
        name: "Terkumpul",
        width: "100px",
        formatter: (cell: number) =>
          html(
            `<span class="fw-semibold text-success">Rp ${cell.toLocaleString("id-ID")}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "120px",
        sort: false,
        formatter: (event: { id: number }) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button
                class="btn btn-sm btn-soft-primary detail-btn"
                data-action="detail"
                data-id="${event.id}"
                title="Lihat Detail Event Salur & Project">
                <i class="bx bx-show fs-16"></i>
              </button>
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${event.id}"
                title="Edit Event Salur">
                <i class="bx bx-edit fs-16"></i>
              </button> `
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${event.id}"
                title="Hapus Event Salur">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    rowMapper: (event: any, index: number) => [
      index,
      event.image
        ? `${import.meta.env.VITE_API_BASE_URL}/storage/${event.image}`
        : null,
      event.judul,
      event.slug,
      event.status,
      event.stats?.programs_count ?? 0,
      event.stats?.projects_count ?? 0,
      event.stats?.terkumpul_total ?? 0,
      { id: event.id },
    ],
  });

  return {
    ...table,
    searchQuery,
    selectedStatus,
  };
}
