import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllFinanceJournal } from "@/services/financeJournalService";
import { formatCurrency } from "@/helpers/format";

const TYPE_BADGE: Record<string, string> = {
  D: "bg-primary",
  K: "bg-success",
};

export function useFinanceJournalTable() {
  const selectedType = ref<string>("");
  const selectedAkunId = ref<number | "">("");
  const selectedProgramId = ref<number | "">("");
  const selectedProjectId = ref<number | "">("");
  const selectedNotaNumber = ref<string>("");
  const selectedHasPair = ref<string>("");
  const dateRange = ref<string>("");

  const dateFrom = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[0]?.trim() ?? "";
  });

  const dateTo = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[1]?.trim() ?? "";
  });

  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
    ...(selectedAkunId.value !== "" ? { akun_id: selectedAkunId.value } : {}),
    ...(selectedProgramId.value !== ""
      ? { program_id: selectedProgramId.value }
      : {}),
    ...(selectedProjectId.value !== ""
      ? { project_id: selectedProjectId.value }
      : {}),
    ...(selectedNotaNumber.value
      ? { nota_number: selectedNotaNumber.value }
      : {}),
    ...(selectedHasPair.value !== ""
      ? { has_pair: selectedHasPair.value === "true" }
      : {}),
    ...(dateFrom.value ? { date_from: dateFrom.value } : {}),
    ...(dateTo.value ? { date_to: dateTo.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "finance-journals",
    fetchFn: getAllFinanceJournal,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Tanggal",
        width: "110px",
        formatter: (cell: string) => {
          const d = cell
            ? new Date(cell).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-";
          return html(`<span class="small text-muted">${d}</span>`);
        },
      },
      {
        name: "Nota",
        width: "200px",
        formatter: (cell: string) =>
          html(
            `<span class="small fw-semibold text-primary">${cell ?? "-"}</span>`,
          ),
      },
      {
        name: "Keterangan",
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Akun",
        width: "80px",
        formatter: (cell: number) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Tipe",
        width: "80px",
        sort: false,
        formatter: (cell: string) => {
          const badge = TYPE_BADGE[cell] ?? "bg-secondary";
          const label =
            cell === "D" ? "Debit" : cell === "K" ? "Kredit" : (cell ?? "-");
          return html(`<span class="badge ${badge}">${label}</span>`);
        },
      },
      {
        name: "Nominal",
        width: "150px",
        formatter: (cell: number) =>
          html(
            `<span class="fw-semibold small">${formatCurrency(cell)}</span>`,
          ),
      },
      {
        name: "Aksi",
        width: "80px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-primary detail-btn"
                data-action="detail" data-id="${id}" title="Lihat Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.date,
      item.nota_number,
      item.keterangan,
      item.akun_id,
      item.type,
      item.nominal,
      item.id,
    ],
  });

  return {
    ...table,
    selectedType,
    selectedAkunId,
    selectedProgramId,
    selectedProjectId,
    selectedNotaNumber,
    selectedHasPair,
    dateRange,
  };
}
