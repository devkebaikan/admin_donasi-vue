import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAdsScripts, deleteAdsScript } from "@/services/adsScriptService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("setting:ads");
const isCanDelete = hasPermission("setting:ads");

const TYPE_BADGE: Record<string, string> = {
  google: "bg-danger",
  meta: "bg-primary",
  tiktok: "bg-dark",
  fb_pixel: "bg-primary",
};

const TYPE_LABEL: Record<string, string> = {
  google: "Google",
  meta: "Meta",
  tiktok: "TikTok",
  fb_pixel: "FB Pixel",
};

export function useAdsScriptsTable() {
  const selectedType = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "ads-scripts",
    fetchFn: getAdsScripts,
    deleteFn: deleteAdsScript,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Ads script tidak bisa dikembalikan setelah dihapus!",
      successText: "Ads script berhasil dihapus.",
      cancelText: "Ads script aman :)",
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
        width: "180px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell ?? "-"}</span>`),
      },
      {
        name: "Tipe",
        width: "100px",
        formatter: (cell: string) => {
          const badge = TYPE_BADGE[cell] ?? "bg-secondary";
          const label = TYPE_LABEL[cell] ?? cell ?? "-";
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Script ID",
        width: "180px",
        formatter: (cell: string) =>
          cell
            ? html(
                `<span class="font-monospace small text-truncate d-block" style="max-width:160px" title="${cell}">${cell}</span>`,
              )
            : html(`<span class="text-muted small">-</span>`),
      },
      {
        name: "Web",
        width: "140px",
        formatter: (cell: string) =>
          cell
            ? html(`<span class="small text-primary">${cell}</span>`)
            : html(`<span class="text-muted small">-</span>`),
      },
      {
        name: "Dibuat",
        width: "120px",
        formatter: (cell: string) => {
          if (!cell) return html(`<span class="text-muted small">-</span>`);
          const d = new Date(cell).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return html(`<span class="small text-muted">${d}</span>`);
        },
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
            ${
              isCanEdit
                ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit">
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
                title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>`
                : ""
            }
            </div>
          `),
      },
    ],

    // <button
    //   class="btn btn-sm btn-soft-info detail-btn"
    //   data-action="detail"
    //   data-id="${id}"
    //   title="Detail">
    //   <i class="bx bx-show fs-16"></i>
    // </button>
    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.type,
      item.script_id,
      item.web,
      item.created_at,
      item.id,
    ],
  });

  return { ...table, selectedType };
}
