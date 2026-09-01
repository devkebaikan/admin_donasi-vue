import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllCategories, deleteCategory } from "@/services/categoryService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("program:update");
const isCanDelete = hasPermission("program:delete");

export function useCategoryTable() {
  const selectedIsActive = ref<string>("");
  const selectedIsUtama = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedIsActive.value !== ""
      ? { is_active: selectedIsActive.value }
      : {}),
    ...(selectedIsUtama.value !== ""
      ? { is_utama: selectedIsUtama.value }
      : {}),
  }));

  const table = useDataTable({
    queryKey: "program-categories",
    fetchFn: getAllCategories,
    deleteFn: deleteCategory,
    defaultSort: "id",
    // defaultSortDir: "asc",
    extraFilters,
    deleteMessages: {
      text: "Data kategori tidak bisa dikembalikan!",
      successText: "Kategori berhasil dihapus.",
      cancelText: "Data kategori aman :)",
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
            `<img src="${cell}" alt="gambar" class="rounded" style="width:48px;height:48px;object-fit:cover;" onerror="this.style.display='none'" />`,
          );
        },
      },
      {
        name: "Nama",
        width: "180px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Slug",
        width: "160px",
        formatter: (cell: string) =>
          html(
            `<span class="text-muted small font-monospace">${cell ?? "-"}</span>`,
          ),
      },
      {
        name: "Utama",
        width: "80px",
        formatter: (cell: string) => {
          const isUtama = cell === "1";
          const color = isUtama ? "bg-primary" : "bg-light text-dark";
          return html(
            `<span class="badge ${color}">${isUtama ? "Ya" : "Tidak"}</span>`,
          );
        },
      },
      {
        name: "Status",
        width: "90px",
        formatter: (cell: string) => {
          const isActive = cell === "1";
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
        formatter: (category: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
             ${
               isCanEdit
                 ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${category.id}"
                title="Edit Category">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                 : ""
             }
              ${
                isCanDelete
                  ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${category.id}"
                title="Hapus Kategori">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                  : ""
              }
            </div>
          `),
      },
    ],

    rowMapper: (category: any, index: number) => [
      index,
      category.image_url ?? null,
      category.name,
      category.slug ?? "-",
      category.is_utama,
      category.is_active,
      { id: category.id },
    ],
  });

  return {
    ...table,
    selectedIsActive,
    selectedIsUtama,
  };
}
