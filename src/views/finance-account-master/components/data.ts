import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllAccountMaster } from "@/services/financeAccountMasterService";

const TYPE_BADGE: Record<string, string> = {
  D: "bg-primary",
  K: "bg-success",
};

export function useFinanceAccountMasterTable() {
  const table = useDataTable({
    queryKey: "finance-accounts-master",
    fetchFn: getAllAccountMaster,
    defaultPerPage: 10,
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "No. akun",
        width: "100px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell ?? "-"}</span>`),
      },
      {
        name: "Nama",
        width: "120px",
        formatter: (cell: number) =>
          html(`<span class="fw-semibold text-primary">${cell}</span>`),
      },
      {
        name: "Deskripsi",
        width: "260px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell ?? ""}</span>`),
      },

      {
        name: "Akun",
        width: "160px",
        formatter: (cell: string) => html(`<span ">${cell ?? "-"}</span>`),
      },

      {
        name: "Type",
        width: "100px",
        formatter: (cell: string) => {
          const badge = TYPE_BADGE[cell] ?? "bg-secondary";
          const label =
            cell === "D" ? "Debit" : cell === "K" ? "Kredit" : (cell ?? "-");
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
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
             
            </div>
          `),
      },
    ],
    rowMapper: (account: any, index: number) => [
      index,
      account.akun.number,
      account.name,
      account.description,
      account.akun.name,
      account.akun.type,
      account.id,
    ],
  });

  return {
    ...table,
  };
}
