import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getBanners, deleteBanner } from "@/services/bannerService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("setting:banner");
const isCanDelete = hasPermission("setting:banner");

export function useSettingBannerTable() {
  const table = useDataTable({
    queryKey: "setting-banners",
    fetchFn: getBanners,
    deleteFn: deleteBanner,
    defaultSort: "id",
    defaultSortDir: "desc",
    deleteMessages: {
      text: "Banner tidak bisa dikembalikan setelah dihapus!",
      successText: "Banner berhasil dihapus.",
      cancelText: "Banner aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Banner",
        width: "120px",
        sort: false,
        formatter: (cell: string) => {
          return cell
            ? html(
                `<img src="${cell}" alt="banner" style="width:100px;height:60px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                 <div style="display:none;width:100px;height:60px;background:#f8f9fa;border-radius:4px;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              )
            : html(
                `<div style="width:100px;height:60px;background:#f8f9fa;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              );
        },
      },
      {
        name: "Link",
        width: "200px",
        formatter: (cell: string) =>
          cell
            ? html(`<span class="font-monospace small text-primary">${cell}</span>`)
            : html(`<span class="text-muted fst-italic small">-</span>`),
      },
      {
        name: "New Tab",
        width: "90px",
        formatter: (cell: boolean) => {
          const badge = cell ? "bg-success" : "bg-secondary";
          const label = cell ? "Ya" : "Tidak";
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit Banner">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                : ""
            }
            ${
              isCanDelete
                ? `<button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${id}"
                title="Hapus Banner">
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
      item.image_url,
      item.link,
      item.is_new_tab,
      item.id,
    ],
  });

  return { ...table };
}
