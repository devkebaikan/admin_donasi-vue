import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllTransactions,
  deleteTransaction,
} from "@/services/transactionService";
import { formatCurrency, formatDateTime } from "@/helpers/format";

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  Paid: { cls: "bg-success", label: "Paid" },
  Pending: { cls: "bg-warning text-dark", label: "Pending" },
  Canceled: { cls: "bg-danger", label: "Canceled" },
};

export function useTransactionTable() {
  const selectedStatus = ref<string>("");
  const selectedSource = ref<string>("");
  const dateRange = ref<string>("");
  const filterUserId = ref<string>("");
  const filterPaymentMethodId = ref<string>("");
  const filterInvoice = ref<string>("");
  const filterMinTotal = ref<string>("");
  const filterMaxTotal = ref<string>("");

  const parsedDateFrom = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[0]?.trim() ?? "";
  });

  const parsedDateTo = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[1]?.trim() ?? "";
  });

  const extraFilters = computed(() => {
    const filters: Record<string, string> = {};
    if (selectedStatus.value) filters.status = selectedStatus.value;
    if (selectedSource.value) filters.source = selectedSource.value;
    if (parsedDateFrom.value) filters.date_from = parsedDateFrom.value;
    if (parsedDateTo.value) filters.date_to = parsedDateTo.value;
    if (filterUserId.value) filters.user_id = filterUserId.value;
    if (filterPaymentMethodId.value)
      filters.payment_method_id = filterPaymentMethodId.value;
    if (filterInvoice.value) filters.invoice = filterInvoice.value;
    if (filterMinTotal.value) filters.min_total = filterMinTotal.value;
    if (filterMaxTotal.value) filters.max_total = filterMaxTotal.value;
    return filters;
  });

  const table = useDataTable({
    queryKey: "transactions",
    fetchFn: getAllTransactions,
    deleteFn: deleteTransaction,
    extraFilters,
    defaultPerPage: 10,
    deleteMessages: {
      text: "Data transaksi tidak bisa dikembalikan setelah dihapus!",
      successText: "Transaksi berhasil dihapus.",
      cancelText: "Data transaksi aman :)",
    },
    columns: [
      {
        name: "No",
        width: "48px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Invoice",
        width: "200px",
        formatter: (item: { program: string; inv: string; type: string }) =>
          html(`
          <small class="d-flex flex-column">
             ${
               item.program?.trim()
                 ? `<span class="fw-semibold text-dark">${item.program}</span>`
                 : `<span class="fw-semibold text-warning">${item.type === "Donasi" ? "Belum ada program" : item.type}</span>`
             }

            <span class="text-primary font-monospace">
              ${item.inv || "-"}
            </span>
          </small>
      `),
      },
      {
        name: "Tanggal",
        width: "110px",
        formatter: (cell: string) => {
          if (!cell) return html(`<span class="text-muted">-</span>`);
          return html(`<span class="small">${formatDateTime(cell)}</span>`);
        },
      },
      {
        name: "Total",
        width: "140px",
        formatter: (cell: number) =>
          html(
            `<span class="fw-bold small font-monospace">${formatCurrency(cell)}</span>`,
          ),
      },
      {
        name: "Donatur",
        width: "180px",
        formatter: (item: {
          phone: string;
          name: string;
          donation_number: number;
        }) =>
          html(`
          <div class="d-flex flex-column">

            <span class="fw-semibold text-dark small">
              ${item.name}
            </span>

            <small class="text-muted font-monospace small">
              ${item.phone}
            </small>

            <div class="mt-1">
              <span class="badge bg-primary-subtle text-primary border">
                Donasi ke #${item.donation_number}
              </span>
            </div>

          </div>
        `),
      },
      {
        name: "Bank",
        width: "100px",
        sort: false,
        formatter: (cell: string) => {
          return html(`<span class="small fw-semibold">${cell}</span>`);
        },
      },
      {
        name: "Status",
        width: "100px",
        sort: false,
        formatter: (cell: string) => {
          const s = STATUS_MAP[cell] ?? {
            cls: "bg-secondary",
            label: cell || "-",
          };
          return html(`<span class="badge ${s.cls}">${s.label}</span>`);
        },
      },
      {
        name: "Source",
        width: "90px",
        formatter: (cell: string) =>
          html(
            `<span class="badge bg-light text-dark border">${cell || "-"}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "90px",
        sort: false,
        formatter: (item: { id: number; status: string }) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-info detail-btn w-fit"
                data-action="detail" data-id="${item.id}" title="Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
              
              <button class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit" data-id="${item.id}" title="Edit">
                <i class="bx bx-edit fs-16"></i>
              </button>
              
              <button class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete" data-id="${item.id}" title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>
              ${
                item.status === "Pending"
                  ? `<button class="btn btn-sm btn-soft-success verifikasi-btn"
                data-action="verifikasi" data-id="${item.id}" title="verifikasi">
                <i class="bx bx-check fs-16"></i>
                </button>`
                  : ""
              }
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      {
        program: item?.transaction_details?.[0]?.program?.name,
        inv: item.invoice,
        type: item.transaction_type.name,
      },
      item.date,
      item.total,
      {
        name: item.user.name,
        phone: item.user.phone,
        donation_number: item.donation_number,
      },
      item.payment_method.bank_name,
      item.status,
      item.source,
      { id: item.id, status: item.status },
    ],
  });

  return {
    ...table,
    selectedStatus,
    selectedSource,
    dateRange,
    filterUserId,
    filterPaymentMethodId,
    filterInvoice,
    filterMinTotal,
    filterMaxTotal,
    parsedDateFrom,
    parsedDateTo,
  };
}
