import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllBlogs, deleteBlog } from "@/services/blogService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("blog:update");
const isCanDelete = hasPermission("blog:delete");

export function useBlogTable() {
  const selectedIsActive = ref<string>("");
  const selectedCategoryId = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedIsActive.value !== ""
      ? { is_active: selectedIsActive.value }
      : {}),
    ...(selectedCategoryId.value !== ""
      ? { category_id: selectedCategoryId.value }
      : {}),
  }));

  const table = useDataTable({
    queryKey: "blogs",
    fetchFn: getAllBlogs,
    deleteFn: deleteBlog,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "Data blog tidak bisa dikembalikan!",
      successText: "Blog berhasil dihapus.",
      cancelText: "Data blog aman :)",
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
        width: "220px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Kategori",
        width: "110px",
        sort: false,
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-info-subtle text-info">${cell ?? "-"}</span>`,
          ),
      },
      {
        name: "Penulis",
        width: "120px",
        sort: false,
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell ?? "-"}</span>`),
      },
      {
        name: "Visitor",
        width: "70px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell ?? 0}</span>`),
      },
      {
        name: "Status",
        width: "90px",
        formatter: (cell: string) => {
          const isActive = cell === "1" || String(cell) === "true";
          const color = isActive ? "bg-success" : "bg-secondary";
          return html(
            `<span class="badge ${color}">${isActive ? "Aktif" : "Nonaktif"}</span>`,
          );
        },
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (blog: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${blog.id}"
                title="Edit Blog">
                <i class="bx bx-edit fs-16"></i>
              </button> `
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${blog.id}"
                title="Hapus Blog">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    rowMapper: (blog: any, index: number) => [
      index,
      blog.title,
      blog.category?.name ?? "-",
      blog.creator ?? "-",
      blog.visitor ?? 0,
      blog.is_active,
      { id: blog.id },
    ],
  });

  return {
    ...table,
    selectedIsActive,
    selectedCategoryId,
  };
}
