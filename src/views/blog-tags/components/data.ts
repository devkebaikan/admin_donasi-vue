import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllBlogTag, deleteBlogTag } from "@/services/blogTagService";

export function useBlogTagTable() {
  const table = useDataTable({
    queryKey: "blog-tags",
    fetchFn: getAllBlogTag,
    deleteFn: deleteBlogTag,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    deleteMessages: {
      text: "Data tag blog tidak bisa dikembalikan!",
      successText: "Tag blog berhasil dihapus.",
      cancelText: "Data tag blog aman :)",
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
              <button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button>
              <button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>
            </div>`),
      },
    ],
    rowMapper: (item: any, index: number) => [index, item.nama, item.id],
  });

  return { ...table };
}
