import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getEventAttributes,
  deleteEventAttribute,
} from "@/services/eventService";

const TYPE_BADGE: Record<string, string> = {
  text: "bg-secondary",
  image: "bg-info",
  video: "bg-primary",
  file: "bg-warning",
};

export function useEventAttributeTable() {
  const selectedEventId = ref<number | "">("");
  const selectedType = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, any> = {};
    if (selectedEventId.value) filters.event_id = selectedEventId.value;
    if (selectedType.value) filters.type = selectedType.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "event-attributes",
    fetchFn: getEventAttributes,
    deleteFn: deleteEventAttribute,
    defaultSort: "sequence",
    defaultSortDir: "asc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Data attribute event tidak bisa dikembalikan!",
      successText: "Attribute event berhasil dihapus.",
      cancelText: "Data attribute event aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Judul",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Tipe",
        width: "100px",
        formatter: (cell: string) =>
          html(
            `<span class="badge ${TYPE_BADGE[cell] ?? "bg-secondary"}">${cell}</span>`,
          ),
      },
      {
        name: "Urutan",
        width: "90px",
        formatter: (cell: number) =>
          html(`<span class="fw-semibold">${cell}</span>`),
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
      item.title,
      item.type,
      item.sequence,
      item.id,
    ],
  });

  return { ...table, selectedEventId, selectedType };
}
