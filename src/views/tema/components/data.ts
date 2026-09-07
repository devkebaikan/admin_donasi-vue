import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllTema, deleteTema } from "@/services/temaService";
import { hasPermission } from "@/helpers/permission";
import { formatDate } from "@/helpers/format";

const isCanEdit = true;
const isCanDelete = true;

export function useTemaTable() {
  const searchQuery = ref<string>("");

  const extraFilters = computed(() => ({
    ...(searchQuery.value ? { search: searchQuery.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "tema",
    fetchFn: getAllTema,
    deleteFn: deleteTema,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "Data tema tidak bisa dikembalikan!",
      successText: "Tema berhasil dihapus.",
      cancelText: "Data tema aman :)",
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
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Slug",
        width: "150px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small font-monospace">${cell}</span>`),
      },
      {
        name: "Program",
        width: "80px",
        formatter: (cell: number) =>
          html(`<span class="badge bg-info">${cell}</span>`),
      },
      {
        name: "Tanggal Buat",
        width: "150px",
        formatter: (cell: string) => {
          return html(
            `<span class="text-muted small">${formatDate(cell)}</span>`,
          );
        },
      },
      {
        name: "Actions",
        width: "120px",
        sort: false,
        formatter: (tema: { id: number }) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button
                class="btn btn-sm btn-soft-primary detail-btn"
                data-action="detail"
                data-id="${tema.id}"
                title="Lihat Detail Tema & Program">
                <i class="bx bx-show fs-16"></i>
              </button>
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${tema.id}"
                title="Edit Tema">
                <i class="bx bx-edit fs-16"></i>
              </button> `
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${tema.id}"
                title="Hapus Tema">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    rowMapper: (tema: any, index: number) => [
      index,
      tema.judul,
      tema.slug,
      tema.programs_count ?? 0,
      tema.created_at,
      { id: tema.id },
    ],
  });

  return {
    ...table,
    searchQuery,
  };
}
