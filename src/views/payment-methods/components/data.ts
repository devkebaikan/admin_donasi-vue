import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllPaymentMethods,
  deletePaymentMethod,
} from "@/services/paymentMethodService";
import { formatCurrency } from "@/helpers/format";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("payment:update");
const isCanDelete = hasPermission("payment:delete");

export function usePaymentMethodTable() {
  const selectedBankReferenceId = ref<number | string>("");
  const selectedIsActive = ref<string>("");
  const selectedUsage = ref<string>("");

  const extraFilters = computed(() => {
    const filters: Record<string, any> = {};
    if (selectedBankReferenceId.value)
      filters.bank_reference_id = selectedBankReferenceId.value;
    if (selectedIsActive.value !== "")
      filters.is_active = selectedIsActive.value;
    if (selectedUsage.value) filters.usage = selectedUsage.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "payment-methods",
    fetchFn: getAllPaymentMethods,
    deleteFn: deletePaymentMethod,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Metode pembayaran tidak bisa dikembalikan!",
      successText: "Metode pembayaran berhasil dihapus.",
      cancelText: "Data metode pembayaran aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Rekening",
        width: "230px",
        formatter: (cell: {
          behalf: string;
          number: string;
          bankName: string;
        }) =>
          html(`
            <div>
            <span class="fw-semibold d-block">${cell.number} &middot; ${cell.bankName}</span>
            <span  class="text-muted small">${cell.behalf}</span>
            </div>
          `),
      },
      {
        name: "Tipe",
        width: "110px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold d-block">${cell || "-"}</span>`),
      },
      {
        name: "Fee",
        width: "110px",
        formatter: (cell: { fee: number; fee_type: string }) =>
          html(
            `<span class="small">${
              cell.fee_type === "percentage"
                ? `${cell.fee}%`
                : formatCurrency(cell.fee)
            }</span>`,
          ),
      },
      {
        name: "Status",
        width: "120px",
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
        name: "Aksi",
        width: "130px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              ${isCanEdit ? `<button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button>` : ""}
              ${isCanDelete ? `<button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>` : ""}
            </div>
          `),
      },
    ],
    // <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Detail"><i class="bx bx-show fs-16"></i></button>

    rowMapper: (item: any, index: number) => [
      index,
      {
        behalf: item.account_behalf,
        number: item.account_number,
        bankName: item.bank_reference?.name ?? "-",
      },
      item.bank_reference.type,
      { fee: item.fee, fee_type: item.fee_type },
      { id: item.id, is_active: item.is_active },
      item.id,
    ],
  });

  return {
    ...table,
    selectedBankReferenceId,
    selectedIsActive,
    selectedUsage,
  };
}
