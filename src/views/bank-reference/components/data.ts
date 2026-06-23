import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllBankReferences,
  deleteBankReference,
} from "@/services/bankReferenceService";

const STORAGE_BASE =
  (import.meta.env.VITE_API_BASE_URL as string).replace("/api/v1", "") +
  "/storage/";

const buildImageUrl = (path: string) => (path ? `${STORAGE_BASE}${path}` : "");

export function useBankReferenceTable() {
  const selectedType = ref<string>("");
  const selectedIsActive = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, string> = {};
    if (selectedType.value) filters.type = selectedType.value;
    if (selectedIsActive.value !== "")
      filters.is_active = selectedIsActive.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "bank-references",
    fetchFn: getAllBankReferences,
    deleteFn: deleteBankReference,
    defaultSort: "name",
    defaultSortDir: "asc",
    extraFilters,
    deleteMessages: {
      text: "Data bank reference tidak bisa dikembalikan!",
      successText: "Bank reference berhasil dihapus.",
      cancelText: "Data bank reference aman :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      // {
      //   name: "Logo",
      //   width: "72px",
      //   sort: false,
      //   formatter: (cell: string) => {
      //     const url = buildImageUrl(cell);
      //     return url
      //       ? html(
      //           `<img src="${url}" alt="logo" style="width:48px;height:32px;object-fit:contain;border-radius:4px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
      //            <div style="display:none;width:48px;height:32px;background:#f8f9fa;border-radius:4px;align-items:center;justify-content:center;">
      //              <i class="bx bx-image text-muted"></i>
      //            </div>`,
      //         )
      //       : html(
      //           `<div style="width:48px;height:32px;background:#f8f9fa;border-radius:4px;display:flex;align-items:center;justify-content:center;">
      //              <i class="bx bx-image text-muted"></i>
      //            </div>`,
      //         );
      //   },
      // },
      {
        name: "Nama",
        width: "240px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Kode",
        width: "130px",
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-light text-dark font-monospace">${cell}</span>`,
          ),
      },
      {
        name: "Tipe",
        width: "110px",
        formatter: (cell: string) => {
          const isEwallet = cell === "e_wallet";
          const label = isEwallet ? "E-Wallet" : "Bank";
          const cls = isEwallet ? "bg-info" : "bg-primary";
          return html(`<span class="badge ${cls}">${label}</span>`);
        },
      },
      {
        name: "Status",
        width: "130px",
        sort: false,
        formatter: (cell: { id: number; is_active: boolean }) => {
          const { id, is_active } = cell;
          return html(`
            <div class="form-check form-switch toggle-status d-flex align-items-center gap-1"
                 data-id="${id}" data-active="${is_active}"
                 style="cursor:pointer;margin:0;padding-left:2.5rem;">
              <input class="form-check-input" type="checkbox" role="switch"
                     ${is_active ? "checked" : ""}
                     style="pointer-events:none;margin-top:0;">
              <label class="form-check-label small ${is_active ? "text-success fw-semibold" : "text-secondary"}"
                     style="pointer-events:none;">
                ${is_active ? "Aktif" : "Nonaktif"}
              </label>
            </div>
          `);
        },
      },
      {
        name: "Actions",
        width: "110px",
        sort: false,
        formatter: (item: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${item.id}"
                title="Edit Bank Reference">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${item.id}"
                title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      // item.image,
      item.name,
      item.code,
      item.type,
      { id: item.id, is_active: item.is_active },
      { id: item.id },
    ],
  });

  return { ...table, selectedType, selectedIsActive };
}
