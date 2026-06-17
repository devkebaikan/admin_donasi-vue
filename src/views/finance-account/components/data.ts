import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getFinanceAccounts,
  deleteFinanceAccount,
} from "@/services/financeAccountService";
import { formatCurrency } from "@/helpers/format";

const TYPE_BADGE: Record<string, string> = {
  D: "bg-primary",
  K: "bg-success",
};

export function useFinanceAccountsTable() {
  const selectedType = ref<string>("");
  const selectedHaveChild = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
    ...(selectedHaveChild.value ? { have_child: selectedHaveChild.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "finance-accounts",
    fetchFn: getFinanceAccounts,
    deleteFn: deleteFinanceAccount,
    defaultSort: "id",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "You won't be able to revert this!",
      successText: "Finance account has been deleted.",
      cancelText: "Your data is safe :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Nomor",
        width: "120px",
        formatter: (cell: number) =>
          html(`<span class="fw-semibold text-primary">${cell}</span>`),
      },
      {
        name: "Nama Akun",
        width: "260px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Type",
        width: "90px",
        formatter: (cell: string) => {
          const badge = TYPE_BADGE[cell] ?? "bg-secondary";
          const label =
            cell === "D" ? "Debit" : cell === "K" ? "Kredit" : (cell ?? "-");
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Laporan",
        width: "100px",
        formatter: (cell: string) =>
          html(`<span class="badge bg-secondary">${cell ?? "-"}</span>`),
      },
      {
        name: "Have Child",
        width: "100px",
        formatter: (cell: string) => {
          const badge = cell === "Y" ? "bg-success" : "bg-secondary";
          const label = cell === "Y" ? "Ya" : "Tidak";
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Saldo Awal",
        width: "160px",
        formatter: (cell: number) =>
          html(
            `<span class="fw-semibold small">${formatCurrency(cell)}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "100px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center align-items-center">
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-id="${id}"
                title="Edit Akun">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${id}"
                title="Hapus Akun">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (account: any, index: number) => [
      index,
      account.number,
      account.name,
      account.type,
      account.laporan,
      account.have_child,
      account.saldo_awal,
      account.id,
    ],
  });

  return {
    ...table,
    selectedType,
    selectedHaveChild,
  };
}
