import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllImages, deleteImage } from "@/services/imageService";
import { hasPermission } from "@/helpers/permission";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const buildImageUrl = (path: string) => (path ? `${STORAGE_BASE}${path}` : "");

const isCanEdit = hasPermission("setting:image");
const isCanDelete = hasPermission("setting:image");

export function useSettingImageTable() {
  const table = useDataTable({
    queryKey: "setting-images",
    fetchFn: getAllImages,
    deleteFn: deleteImage,
    defaultSort: "id",
    defaultSortDir: "desc",
    deleteMessages: {
      text: "Gambar tidak bisa dikembalikan setelah dihapus!",
      successText: "Gambar berhasil dihapus.",
      cancelText: "Gambar aman :)",
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
        width: "100px",
        sort: false,
        formatter: (cell: string) => {
          const url = buildImageUrl(cell);
          return url
            ? html(
                `<img src="${url}" alt="image" style="width:80px;height:52px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                 <div style="display:none;width:80px;height:52px;background:#f8f9fa;border-radius:4px;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              )
            : html(
                `<div style="width:80px;height:52px;background:#f8f9fa;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              );
        },
      },
      {
        name: "Nama",
        width: "200px",
        formatter: (cell: string) =>
          html(
            `<span class="fw-semibold">${cell || '<span class="text-muted fst-italic">-</span>'}</span>`,
          ),
      },
      {
        name: "Link",
        width: "180px",
        formatter: (cell: string) =>
          cell && cell !== "No Link"
            ? html(
                `<span class="font-monospace small text-primary">${cell}</span>`,
              )
            : html(`<span class="text-muted fst-italic small">No Link</span>`),
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (item: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${item.id}"
                title="Edit Image">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${item.id}"
                title="Hapus Gambar">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      item.image,
      item.name,
      item.link,
      { id: item.id },
    ],
  });

  return { ...table };
}
