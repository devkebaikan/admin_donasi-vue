import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getEvents, deleteEvent } from "@/services/eventService";
import { formatCurrency } from "@/helpers/format";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const buildImageUrl = (path: string) => (path ? `${STORAGE_BASE}${path}` : "");

const MODE_BADGE: Record<string, string> = {
  online: "bg-info",
  offline: "bg-warning text-dark",
  hybrid: "bg-primary",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-success",
  inactive: "bg-secondary",
};

export function useEventTable() {
  const selectedStatus = ref<string>("");
  const selectedMode = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
    ...(selectedMode.value ? { type: selectedMode.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "events",
    fetchFn: getEvents,
    deleteFn: deleteEvent,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Event tidak bisa dikembalikan setelah dihapus!",
      successText: "Event berhasil dihapus.",
      cancelText: "Event aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Judul",
        width: "200px",
        formatter: (cell: string) =>
          html(
            `<span class="fw-semibold" style="white-space:normal;line-height:1.3">${cell}</span>`,
          ),
      },
      {
        name: "Mitra",
        width: "120px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Tipe",
        width: "80px",
        formatter: (cell: string) =>
          html(`<span class="badge bg-primary">${cell ?? "-"}</span>`),
      },
      {
        name: "Mode",
        width: "90px",
        formatter: (cell: string) => {
          const badge = MODE_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${badge}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Status",
        width: "90px",
        formatter: (cell: string) => {
          const badge = STATUS_BADGE[cell] ?? "bg-secondary";
          const label =
            cell === "active"
              ? "Aktif"
              : cell === "inactive"
                ? "Nonaktif"
                : (cell ?? "-");
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Harga",
        width: "110px",
        formatter: (cell: number) =>
          cell === 0
            ? html(`<span class="badge bg-success">Gratis</span>`)
            : html(
                `<span class="fw-semibold small">${formatCurrency(cell)}</span>`,
              ),
      },
      {
        name: "Actions",
        width: "100px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit Event">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${id}"
                title="Hapus Event">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.title,
      item.mitra?.nama ?? "-",
      item.event_type?.name ?? "-",
      item.mode,
      item.status,
      item.price,
      item.id,
    ],
  });

  return { ...table, selectedStatus, selectedMode };
}
