import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllBlogCategory,
  deleteBlogCategory,
} from "@/services/blogCategoryService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("blog:update");
const isCanDelete = hasPermission("blog:delete");

export function useBlogCategoryTable() {
  const table = useDataTable({
    queryKey: "blog-categories",
    fetchFn: getAllBlogCategory,
    deleteFn: deleteBlogCategory,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    deleteMessages: {
      text: "Data kategori blog tidak bisa dikembalikan!",
      successText: "Kategori blog berhasil dihapus.",
      cancelText: "Data kategori blog aman :)",
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
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
            ${isCanEdit ? `<button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button> ` : ""}
            ${isCanDelete ? `<button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>` : ""}
            </div>`),
      },
    ],
    rowMapper: (item: any, index: number) => [index, item.nama, item.id],
  });

  return { ...table };
}
